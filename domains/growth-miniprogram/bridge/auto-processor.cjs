// Bridge Auto-Processor — persistent Feishu message handler
// Runs as a hidden Windows background process
// Spawns lark-cli event consume and processes each event in real-time

const { spawn, exec } = require('child_process');
const { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } = require('fs');
const { join } = require('path');

// Load .env file (no dotenv dependency needed)
try {
  const envPath = join(__dirname, '.env');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i === -1) continue;
      const k = t.slice(0, i).trim(), v = t.slice(i + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  }
} catch { /* .env is optional */ }

const LARK_CLI = process.env.LARK_CLI_PATH || 'lark-cli';
const LARK_CLI_RUN_JS = join(process.env.APPDATA, 'npm', 'node_modules', '@larksuite', 'cli', 'scripts', 'run.js');
const BACKEND = process.env.BACKEND_URL || 'http://localhost:3001';
const USER_FEISHU_ID = process.env.USER_FEISHU_ID || 'ou_962fd9da211f5b8583097ca7e34b8867';
const SESSION_DIR = join(__dirname, 'sessions');
const PROCESSED_FILE = join(__dirname, '.processed_ids');
const MAX_PROCESSED_IDS = 3000;
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h
const PROJECT_ROOT = join(__dirname, '..');
const BACKEND_DIR = join(PROJECT_ROOT, 'backend');
const FRONTEND_DIR = join(PROJECT_ROOT, 'frontend');

// 分析指令（启动时从后端获取，来源: backend/src/prompts/daily-review.prompt.ts）
let analysisRequirements = '';

if (!existsSync(SESSION_DIR)) mkdirSync(SESSION_DIR, { recursive: true });

let processedIds = new Set();
if (existsSync(PROCESSED_FILE)) {
  readFileSync(PROCESSED_FILE, 'utf8').trim().split('\n').filter(Boolean).forEach(id => processedIds.add(id));
}

function saveProcessedId(id) {
  processedIds.add(id);
  // Trim oldest entries when exceeding limit
  if (processedIds.size > MAX_PROCESSED_IDS) {
    const arr = [...processedIds];
    processedIds.clear();
    for (const item of arr.slice(-MAX_PROCESSED_IDS)) {
      processedIds.add(item);
    }
  }
  writeFileSync(PROCESSED_FILE, [...processedIds].join('\n'), 'utf8');
}

function fetch(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BACKEND);
    const opts = {
      hostname: url.hostname, port: url.port, path: url.pathname + url.search,
      method, headers: { 'Content-Type': 'application/json' }, timeout: 30000,
    };
    const req = require('http').request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch { resolve({ raw: d }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function sendFeishu(text) {
  return new Promise(resolve => {
    // Spawn lark-cli's run.js directly via node to avoid cmd.exe argument mangling
    const proc = spawn(process.execPath, [LARK_CLI_RUN_JS, 'im', '+messages-send', '--user-id', USER_FEISHU_ID, '--as', 'bot', '--msg-type', 'text', '--text', text], {});
    proc.on('exit', () => resolve());
    proc.on('error', () => resolve());
  });
}

function sendFeishuCard(payload) {
  return new Promise(resolve => {
    const json = JSON.stringify(payload);
    const proc = spawn(process.execPath, [LARK_CLI_RUN_JS, 'im', '+messages-send', '--user-id', USER_FEISHU_ID, '--as', 'bot', '--msg-type', 'interactive', '--content', json], {});
    proc.on('exit', () => resolve());
    proc.on('error', () => resolve());
  });
}

function buildAnalysisCard(report) {
  const cs = report.completionSummary || {};
  const completed = (cs.completed || []).join('、');
  const notCompleted = (cs.notCompleted || []).join('、');

  // 偏差分析
  const da = report.deviationAnalysis || {};
  const riskBadge = { '高': '🔴 高', '中': '🟡 中', '低': '🟢 低' }[da.riskLevel] || da.riskLevel;
  const behindText = (da.behind || []).join('、');
  const deviationText = behindText ? `**风险**: ${riskBadge}\n**滞后**: ${behindText}` : `**风险**: ${riskBadge}`;

  // 执行诊断
  const diag = report.executionDiagnosis || {};
  const issuesText = (diag.issues || []).join('\n');
  const rootCause = diag.rootCause || '';

  // Fogg
  const fogg = report.foggDiagnosis || {};
  const foggLabel = { 'M': '动机不足', 'A': '能力不足', 'P': '提示不足' }[fogg.missing] || '';
  const foggText = foggLabel ? `**Fogg**: ${foggLabel} — ${fogg.detail || ''}` : '';

  // 偏误
  const biases = (report.detectedBiases || []).slice(0, 3);
  const biasesText = biases.map(b => `• ${b.type}: "${b.triggerPhrase}"`).join('\n');

  // 能力变化
  const caps = (report.capabilityDeltas || []).slice(0, 3);
  const capsText = caps.map(c => `• ${c.dimension}: ${c.score}/10`).join('\n');

  // 改进建议（不带 emoji，纯文本）
  const suggestions = (report.suggestions || []).slice(0, 5);
  const sugText = suggestions.map(s => `• [${s.type}] ${s.message}`).join('\n');

  const parts = [
    { tag: 'markdown', content: `**✅ 完成**\n${completed || '暂无'}\n\n**❌ 未完成**\n${notCompleted || '暂无'}\n\n**📈 充沛率**: ${report.energyRate || '?'}/100\n\n**💡 洞察**\n${report.insight?.unaware || '分析完成'}` },
    behindText || issuesText ? { tag: 'hr' } : null,
    behindText || issuesText ? { tag: 'markdown', content: `**📊 偏差分析**\n${deviationText}${issuesText ? '\n\n**🔧 执行诊断**\n' + issuesText : ''}${rootCause ? '\n\n原因: ' + rootCause : ''}` } : null,
    foggText ? { tag: 'hr' } : null,
    foggText ? { tag: 'markdown', content: `**⚡ ${foggText}**` } : null,
    biasesText ? { tag: 'hr' } : null,
    biasesText ? { tag: 'markdown', content: `**🧠 偏误**\n${biasesText}` } : null,
    capsText ? { tag: 'hr' } : null,
    capsText ? { tag: 'markdown', content: `**📈 能力变化**\n${capsText}` } : null,
    sugText ? { tag: 'hr' } : null,
    sugText ? { tag: 'markdown', content: `**💪 改进建议**\n${sugText}` } : null,
    { tag: 'hr' },
    { tag: 'note', elements: [{ tag: 'plain_text', content: '请从 0-100 给本次分析评分：' }] },
  ].filter(Boolean);

  return {
    config: { wide_screen_mode: true },
    header: { title: { tag: 'plain_text', content: '📊 今日复盘分析' }, template: 'blue' },
    elements: parts,
  };
}

function getSession(userId) {
  const file = join(SESSION_DIR, userId.replace(/[^a-z0-9]/gi, '_') + '.json');
  if (existsSync(file)) {
    try { return JSON.parse(readFileSync(file, 'utf8')); }
    catch { /* fall through */ }
  }
  return { step: 'idle', reviewId: null, rawInput: '', followUps: [], signalScore: 0, energyRate: null, energyDiagnostics: [], postureCompleted: null };
}

function saveSession(userId, session) {
  const file = join(SESSION_DIR, userId.replace(/[^a-z0-9]/gi, '_') + '.json');
  writeFileSync(file, JSON.stringify(session, null, 2), 'utf8');
}

function resetSession(userId) {
  const file = join(SESSION_DIR, userId.replace(/[^a-z0-9]/gi, '_') + '.json');
  if (existsSync(file)) {
    try { writeFileSync(file, JSON.stringify({ step: 'idle', reviewId: null, rawInput: '', followUps: [], signalScore: 0, energyRate: null, energyDiagnostics: [], postureCompleted: null })); }
    catch { /* ignore */ }
  }
}

function cleanupStaleSessions() {
  if (!existsSync(SESSION_DIR)) return;
  const now = Date.now();
  const files = readdirSync(SESSION_DIR);
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const filePath = join(SESSION_DIR, file);
    try {
      const content = readFileSync(filePath, 'utf8');
      const session = JSON.parse(content);
      if (session.step === 'idle') {
        const stat = statSync(filePath);
        if (now - stat.mtimeMs > SESSION_MAX_AGE_MS) {
          unlinkSync(filePath);
          console.log('[processor] Cleaned stale session:', file);
        }
      }
    } catch {
      try { unlinkSync(filePath); } catch {}
    }
  }
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// 从用户输入中提取复盘日期。按优先级匹配：
//   1) "今天的复盘"/"今日复盘" → 今天
//   2) "昨天的复盘"/"昨日复盘" → 昨天
//   3) "前天" → 前天
//   4) "X月Y日"/"X.Y"/"X-Y" → 指定日期
//   5) "昨天"（单独在句首/开头）→ 昨天（兼容旧消息，但避免内容中的"昨天"干扰）
//   6) 默认 → 今天
function parseReviewDate(text) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;

  // 1) 明确说"今天的复盘" → 今天
  if (/今[天日].*复盘/.test(text)) return todayStr();
  // 2) 明确说"昨天的复盘" → 昨天
  if (/昨[天日].*复盘/.test(text)) {
    const d2 = new Date(now); d2.setDate(d2.getDate() - 1);
    return `${d2.getFullYear()}-${String(d2.getMonth()+1).padStart(2,'0')}-${String(d2.getDate()).padStart(2,'0')}`;
  }
  // 3) "前天"
  if (/前天/.test(text)) {
    const d2 = new Date(now); d2.setDate(d2.getDate() - 2);
    return `${d2.getFullYear()}-${String(d2.getMonth()+1).padStart(2,'0')}-${String(d2.getDate()).padStart(2,'0')}`;
  }
  // 4) "M月D日" or "M.D" or "M-D"
  const match = text.match(/(\d{1,2})\s*[月.\-]\s*(\d{1,2})日?/);
  if (match) {
    let ym = parseInt(match[1], 10), yd = parseInt(match[2], 10);
    let yy = ym > m ? y - 1 : y;
    return `${yy}-${String(ym).padStart(2,'0')}-${String(yd).padStart(2,'0')}`;
  }
  // 5) "昨天" 出现在句首（前4个字符），避免内容中的"昨天"干扰
  if (/^.{0,4}昨天/.test(text)) {
    const d2 = new Date(now); d2.setDate(d2.getDate() - 1);
    return `${d2.getFullYear()}-${String(d2.getMonth()+1).padStart(2,'0')}-${String(d2.getDate()).padStart(2,'0')}`;
  }
  // 6) 默认 → 今天
  return todayStr();
}

/** 检查用户是否在文本中明确给出了充沛率数字（如 "精力7分" "充沛率80" "状态6"） */
function hasExplicitEnergyRate(text) {
  return /(充沛率|精力|状态|energy)\s*[：:]\s*(\d+)/i.test(text);
}

async function hasReviewSignal(text) {
  return text.length >= 8;
}

async function scoreSignal(text) {
  try {
    const res = await fetch('POST', '/api/analysis/signal-score', { input: text });
    return res.data || { score: 5, gap: null };
  } catch { return { score: 5, gap: null }; }
}

function buildFollowUp(gap, count) {
  const questions = {
    behavior_missing: '你今天具体做了什么？可以具体说说完成了哪些事？',
    attribution_missing: '你觉得是什么原因造成的？可以试着分析一下。',
    emotion_vague: '你说的是哪种感受？是焦虑、无力还是别的？',
    time_missing: '这是什么时候的事？今天还是之前？',
    latent_missing: '你内心真正想要的是什么？',
    dimension_missing: '这和你的哪个目标相关？工作、健康还是学习？',
  };
  if (gap && questions[gap]) return questions[gap];
  return count >= 1 ? '还有别的想补充的吗？' : '能再详细说说吗？';
}

// 充沛率诊断：3 问评估法
const ENERGY_DIAG_QUESTIONS = [
  '昨晚休息得怎么样？大概睡了几个小时？睡得沉吗？',
  '今天白天精神状态如何？有没有特别累或者精力很集中的时段？',
  '整体来说，今天的状态更像哪个描述？\n1. 精力充沛  2. 正常运作  3. 有点疲惫  4. 非常累',
];

// ——— Managed process tracking for /start /stop commands ———
let managedProcesses = { backend: null, frontend: null };
let _startingServices = false;

async function checkServiceStatus() {
  const lines = [];
  // Check Docker daemon first
  try {
    await new Promise((resolve, reject) => {
      exec('docker info', { timeout: 5000 }, err => err ? reject() : resolve());
    });
    lines.push('[Docker] running');
  } catch { lines.push('[Docker] not running — start Docker Desktop first'); }
  try {
    const dbStatus = await new Promise(resolve => {
      exec('docker ps --filter name=growth-miniprogram-db --format "{{.Status}}"', (err, stdout) => {
        if (err) return resolve('stopped');
        resolve(stdout.trim() || 'stopped');
      });
    });
    lines.push('[DB] ' + dbStatus);
  } catch { lines.push('[DB] error'); }
  try {
    await fetch('GET', '/api/health');
    lines.push('[Backend] running (port 3001)');
  } catch { lines.push('[Backend] not running'); }
  try {
    await new Promise((resolve, reject) => {
      const req = require('http').get('http://localhost:3002', res => { req.destroy(); resolve(); });
      req.on('error', reject);
      req.setTimeout(3000, () => { req.destroy(); reject(new Error('timeout')); });
    });
    lines.push('[Frontend] running (port 3002)');
  } catch { lines.push('[Frontend] not running'); }
  lines.push('[Bridge] running');
  return 'Services status:\n' + lines.join('\n');
}

async function startManagedServices() {
  if (_startingServices) return 'Already starting...';
  try {
    await fetch('GET', '/api/health');
    return 'Services already running. Send /restart to reboot.';
  } catch {}

  _startingServices = true;
  const results = ['Starting services...'];

  // 0. Wait for Docker daemon to be ready
  for (let i = 0; i < 30; i++) {
    try {
      await new Promise((resolve, reject) => {
        exec('docker info', { timeout: 5000 }, err => err ? reject() : resolve());
      });
      results.push('[Docker] daemon ready');
      break;
    } catch {
      if (i === 9) results.push('[Docker] waiting for daemon...');
      if (i === 29) results.push('[Docker] daemon not ready — continuing');
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // 1. Docker compose up
  try {
    await new Promise((resolve, reject) => {
      exec('docker compose up -d', { cwd: PROJECT_ROOT, timeout: 60000 }, (err, stdout, stderr) => {
        if (err && !/already/i.test(stderr + stdout)) return reject(err);
        resolve();
      });
    });
    results.push('[DB] started');
  } catch (err) { results.push('[DB] error: ' + err.message.slice(0, 60)); }

  // 2. Wait for DB to be ready
  for (let i = 0; i < 30; i++) {
    try {
      await new Promise((resolve, reject) => {
        exec('docker exec growth-miniprogram-db pg_isready -U growthuser -d growth-miniprogram',
          err => err ? reject() : resolve());
      });
      results.push('[DB] ready');
      break;
    } catch {
      if (i === 29) results.push('[DB] wait timeout — continuing');
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // 3. Backend
  const backend = spawn('npm', ['run', 'dev'], { cwd: BACKEND_DIR, shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  managedProcesses.backend = backend;
  backend.stdout.on('data', d => process.stdout.write('[backend] ' + d));
  backend.stderr.on('data', d => process.stderr.write('[backend] ' + d));
  backend.on('error', err => console.error('[processor] Backend spawn error:', err.message));
  results.push('[Backend] starting...');

  for (let i = 0; i < 30; i++) {
    try {
      await fetch('GET', '/api/health');
      results.push('[Backend] ready (port 3001)');
      break;
    } catch {
      if (i === 29) results.push('[Backend] start timeout');
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // 4. Frontend
  const frontend = spawn('npm', ['run', 'dev'], { cwd: FRONTEND_DIR, shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  managedProcesses.frontend = frontend;
  frontend.stdout.on('data', d => process.stdout.write('[frontend] ' + d));
  frontend.stderr.on('data', d => process.stderr.write('[frontend] ' + d));
  frontend.on('error', err => console.error('[processor] Frontend spawn error:', err.message));
  results.push('[Frontend] starting (port 3002)');

  _startingServices = false;
  return results.join('\n');
}

async function stopManagedServices() {
  const results = [];
  for (const [name, proc] of Object.entries(managedProcesses)) {
    if (proc) {
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/PID', String(proc.pid), '/T', '/F'], { stdio: 'ignore' });
        } else {
          proc.kill('SIGTERM');
        }
        results.push('[' + name + '] stopped');
      } catch (err) {
        results.push('[' + name + '] error: ' + err.message.slice(0, 60));
      }
    }
  }
  managedProcesses = { backend: null, frontend: null };
  return results.length > 0 ? results.join('\n') : 'No services running.';
}

function waitForBackend(opts = {}) {
  const maxRetries = opts.maxRetries || 15;
  const baseDelay = opts.baseDelay || 3000;
  let attempt = 0;
  return new Promise(resolve => {
    const tryConnect = () => {
      attempt++;
      fetch('GET', '/api/health').then(() => resolve(true)).catch(() => {
        if (attempt >= maxRetries) return resolve(false);
        if (opts.onRetry) opts.onRetry(attempt);
        setTimeout(tryConnect, baseDelay);
      });
    };
    tryConnect();
  });
}

async function processEvent(event) {
  const { event_id, content, sender_id } = event;
  if (sender_id !== USER_FEISHU_ID) return; // only process lmh
  if (processedIds.has(event_id)) return;

  const text = (content || '').trim();
  if (!text) return;

  // Commands (also support bare text alongside / prefixed)
  if (text.startsWith('/') || text === '取消' || text === '帮助' || text === '状态') {
    if (text === '/help' || text === '帮助') {
      await sendFeishu('复盘助手使用指南：\n• 直接发今日复盘内容\n• 回复「取消」中止当前\n• 回复「状态」查看进度\n• /services — 查看服务状态\n• /start — 启动全部服务\n• /stop — 停止后端+前端\n• /restart — 重启服务');
    } else if (text === '/cancel' || text === '取消') {
      resetSession(sender_id);
      await sendFeishu('已取消本次复盘。');
    } else if (text === '/services') {
      const status = await checkServiceStatus();
      await sendFeishu(status);
    } else if (text === '/status' || text === '状态') {
      const session = getSession(sender_id);
      await sendFeishu(`当前状态：${session.step}${session.reviewId ? '\n复盘ID: '+session.reviewId.slice(0,8) : ''}`);
    } else if (text === '/start') {
      await sendFeishu('正在启动服务...');
      startManagedServices().then(msg => sendFeishu(msg)).catch(err => sendFeishu('启动失败: ' + err.message));
    } else if (text === '/stop') {
      await sendFeishu('正在停止服务...');
      stopManagedServices().then(msg => sendFeishu(msg)).catch(err => sendFeishu('停止失败: ' + err.message));
    } else if (text === '/restart') {
      await sendFeishu('正在重启服务...');
      (async () => {
        const stopMsg = await stopManagedServices();
        const startMsg = await startManagedServices();
        sendFeishu(stopMsg + '\n---\n' + startMsg);
      })().catch(err => sendFeishu('重启失败: ' + err.message));
    }
    saveProcessedId(event_id);
    return;
  }

  // Check if it's a numeric score (feedback)
  const num = parseInt(text, 10);
  if (!isNaN(num) && num >= 0 && num <= 100) {
    const session = getSession(sender_id);
    if (session.step === 'awaiting_feedback' && session.analysisId) {
      try {
        await fetch('POST', `/api/analysis/${session.analysisId}/feedback`, { userScore: num });
        await sendFeishu('感谢反馈！复盘完成 ✅');
      } catch { await sendFeishu('提交反馈失败，但分析已保存。'); }
      resetSession(sender_id);
      saveProcessedId(event_id);
      return;
    }
  }

  // Check session state for follow-up answers
  const session = getSession(sender_id);

  if (session.step === 'awaiting_followup') {
    // Record answer
    session.followUps.push({ answer: text });
    const combined = session.rawInput + '\n' + session.followUps.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n');
    const signal = await scoreSignal(combined);

    if (signal.score < 5 && session.followUps.length < 2) {
      // Need another follow-up
      const question = buildFollowUp(signal.gap || '', session.followUps.length);
      session.followUps.push({ question });
      saveSession(sender_id, session);
      await sendFeishu(`信号评分：${signal.score}/10\n\n${question}`);
      saveProcessedId(event_id);
      return;
    }

    // Check if energy rate needs diagnostics (not explicitly given by user)
    if (!hasExplicitEnergyRate(combined) && session.energyRate == null) {
      session.energyDiagnostics = [];
      session.energyDiagStep = 0;
      session.step = 'awaiting_energy_diag';
      saveSession(sender_id, session);
      await sendFeishu(ENERGY_DIAG_QUESTIONS[0]);
      saveProcessedId(event_id);
      return;
    }

    // Check if posture was mentioned
    if (!/(体态|训练|posture)/i.test(combined) && session.postureCompleted == null) {
      session.pendingMetric = 'postureTraining';
      session.step = 'awaiting_posture';
      saveSession(sender_id, session);
      await sendFeishu('今天有做体态训练吗？(做了/没做)');
      saveProcessedId(event_id);
      return;
    }

    // Enough — run analysis
    await runAnalysis(sender_id, session, combined, signal);
    saveProcessedId(event_id);
    return;
  }

  if (session.step === 'awaiting_energy_diag') {
    // Collect answer for current diagnostic question
    const step = session.energyDiagStep || 0;
    session.energyDiagnostics.push({ question: ENERGY_DIAG_QUESTIONS[step], answer: text });
    session.energyDiagStep = step + 1;

    if (session.energyDiagStep < ENERGY_DIAG_QUESTIONS.length) {
      // Ask next diagnostic question
      saveSession(sender_id, session);
      await sendFeishu(ENERGY_DIAG_QUESTIONS[session.energyDiagStep]);
      saveProcessedId(event_id);
      return;
    }

    // All 3 questions answered — move to posture check
    const allInput = session.rawInput + '\n' + session.followUps.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n');
    if (!/(体态|训练|posture)/i.test(allInput) && session.postureCompleted == null) {
      session.pendingMetric = 'postureTraining';
      session.step = 'awaiting_posture';
      saveSession(sender_id, session);
      await sendFeishu('今天有做体态训练吗？(做了/没做)');
      saveProcessedId(event_id);
      return;
    }

    // No posture needed — run analysis with energy diagnostics context
    const combined = session.rawInput + '\n' + session.followUps.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n')
      + '\n' + session.energyDiagnostics.map((d, i) => `精力诊断Q${i+1}: ${d.question}\n精力诊断A${i+1}: ${d.answer}`).join('\n');
    const signal = await scoreSignal(combined);
    await runAnalysis(sender_id, session, combined, signal);
    saveProcessedId(event_id);
    return;
  }

  if (session.step === 'awaiting_posture') {
    const completed = /完成|做了|是|练了|yes|done|搞了/i.test(text);
    session.postureCompleted = completed;
    session.followUps.push({ question: '体态训练?', answer: text });

    // Build full input and run analysis
    let combined = session.rawInput + '\n' + session.followUps.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n');
    if (session.energyDiagnostics.length > 0) {
      combined += '\n' + session.energyDiagnostics.map((d, i) => `精力诊断Q${i+1}: ${d.question}\n精力诊断A${i+1}: ${d.answer}`).join('\n');
    }
    const signal = await scoreSignal(combined);
    await runAnalysis(sender_id, session, combined, signal);
    saveProcessedId(event_id);
    return;
  }

  if (session.step === 'awaiting_feedback_reason' && session.analysisId) {
    try {
      await fetch('POST', `/api/analysis/${session.analysisId}/feedback`, { userScore: 50, failReason: text });
      await sendFeishu('感谢反馈！已记录您的意见。复盘完成 ✅');
    } catch { await sendFeishu('提交反馈失败。'); }
    resetSession(sender_id);
    saveProcessedId(event_id);
    return;
  }

  // New message — check if it's a review
  if (await hasReviewSignal(text)) {
    await handleNewReview(sender_id, text);
    saveProcessedId(event_id);
    return;
  }

  // Non-review message — forward info
  await sendFeishu('收到你的消息了。\n\n如果是复盘，直接发送今日内容即可。\n发「帮助」查看使用说明。');
  saveProcessedId(event_id);
}

async function handleNewReview(userId, rawInput) {
  const session = getSession(userId);
  session.rawInput = rawInput;

  await sendFeishu('正在分析，请稍候...');

  // 从输入中提取复盘日期（如"昨天""5.24"），否则用今天
  const reviewDate = parseReviewDate(rawInput);

  // Create review
  let review;
  try {
    review = await fetch('POST', '/api/reviews/daily', { date: reviewDate, rawInput });
    if (review.error) {
      if (review.error.code === 'REVIEW_ALREADY_EXISTS') {
        await sendFeishu('今天已经复盘过了。回复「取消」可以重新开始。');
        return;
      }
      await sendFeishu('创建复盘失败，请稍后重试。');
      return;
    }
  } catch {
    await sendFeishu('复盘服务暂不可用，请稍后再试。');
    return;
  }

  session.reviewId = review.data?.id;
  session.reviewDate = reviewDate;
  if (!session.reviewId) {
    await sendFeishu('创建复盘失败。');
    return;
  }

  // Signal score
  let signal;
  try {
    signal = await scoreSignal(rawInput);
  } catch {
    await sendFeishu('信号分析失败，请稍后重试。');
    session.step = 'idle';
    saveSession(userId, session);
    return;
  }

  session.signalScore = signal.score;

  if (signal.score < 5 && session.followUps.length < 2) {
    const question = buildFollowUp(signal.gap || '', session.followUps.length);
    session.followUps.push({ question });
    session.step = 'awaiting_followup';
    saveSession(userId, session);
    await sendFeishu(`信号评分：${signal.score}/10\n\n${question}`);
    return;
  }

  // Check if energy rate needs diagnostics (not explicitly given)
  if (!hasExplicitEnergyRate(rawInput) && session.energyRate == null) {
    session.energyDiagnostics = [];
    session.energyDiagStep = 0;
    session.step = 'awaiting_energy_diag';
    saveSession(userId, session);
    await sendFeishu(ENERGY_DIAG_QUESTIONS[0]);
    return;
  }

  // Check if posture was mentioned
  if (!/(体态|训练|posture)/i.test(rawInput) && session.postureCompleted == null) {
    session.pendingMetric = 'postureTraining';
    session.step = 'awaiting_posture';
    saveSession(userId, session);
    await sendFeishu('今天有做体态训练吗？(做了/没做)');
    return;
  }

  // Enough signal — run analysis directly
  await runAnalysis(userId, session, rawInput, signal);
}

async function runAnalysis(userId, session, fullInput, signal) {
  session.step = 'processing';
  saveSession(userId, session);
  await sendFeishu('分析中，正在调用 AI...');

  try {
    // 用复盘日期的上下文（不是今天的）
    const ctxDate = session.reviewDate || todayStr();
    const [plansRes, patternsRes, biasesRes, capsRes, reviewsRes] = await Promise.all([
      fetch('GET', `/api/plans/daily?date=${ctxDate}`).catch(() => ({ data: [] })),
      fetch('GET', '/api/analysis/patterns').catch(() => ({ data: [] })),
      fetch('GET', '/api/analysis/biases').catch(() => ({ data: [] })),
      fetch('GET', '/api/analysis/capabilities').catch(() => ({ data: [] })),
      fetch('GET', `/api/reviews/daily?from=${new Date(Date.now()-7*86400000).toISOString().slice(0,10)}&to=${ctxDate}`).catch(() => ({ data: [] })),
    ]);

    const plansText = (plansRes.data || []).map(p => `• ${p.title} (${p.status})`).join('\n') || '暂无';
    const patternsText = (patternsRes.data || []).map(p => `• ${p.pattern} (${p.frequency}次)`).join('\n') || '暂无';
    const biasesText = (biasesRes.data || []).map(b => `• ${b.biasType || b.type}: ${b.triggerPhrase}`).join('\n') || '暂无';
    const capsText = (capsRes.data || []).map(c => `• ${c.dimension}: ${c.score}`).join('\n') || '暂无';
    const recentText = (reviewsRes.data || []).slice(-5).map(r => `${(r.date||'').slice(5,10)}: ${(r.rawInput||'').slice(0,60)}`).join('\n') || '暂无';

    // Build the analysis via Claude CLI
    const userPrompt = `你是一个复盘分析师。根据用户的今日复盘输入，生成结构化分析报告。

用户输入: ${fullInput}

信号评分: ${signal?.score || session.signalScore}/10

上下文:
- 今日计划:\n${plansText}
- 最近复盘:\n${recentText}
- 行为模式:\n${patternsText}
- 认知偏误:\n${biasesText}
- 能力评分:\n${capsText}
- 用户画像: 新能源公司AI产品经理（知识库+客服），副业含延吉美容院/小红书情侣号/AI视频/AI编程，目标逐步脱离主业，工作日可用约3.7h（早6:30-8:40、晚21:00-22:30），核心习惯早起+体态训练，有经前疲劳期
- 充沛率: ${session.energyRate != null ? session.energyRate : '根据精力诊断推断'}
- 体态训练(用户自评): ${session.postureCompleted != null ? (session.postureCompleted ? '完成' : '未完成') : '待收集'}

	- 精力诊断: ${session.energyDiagnostics && session.energyDiagnostics.length > 0 ? session.energyDiagnostics.map((d, i) => `\n    - Q${i+1}: ${d.answer}`).join('') : '无'}

注意: energyRate 由你根据用户输入和精力诊断内容综合推断; postureTraining 已由用户确认。

要求输出JSON，schema如下:

${analysisRequirements || '分析要求（请按以下顺序执行）：\n\n1. **偏误分析** — 回顾用户输入中的表达方式，判断是否存在以下偏误：计划谬误（过度乐观）、自我美化（模糊表述）、基本归因错误（外归因）、确认偏误（只找支持自己的论据）、损失厌恶（怕损失>想获得）、事后合理化（为过去找理由）、现状偏差（懒得改）、聚类错觉（以偏概全）。每条偏误必须引用用户原文作为 triggerPhrase，输出到 detectedBiases\n\n2. **执行诊断（Fogg 模型）** — 对于"知道该做但没做"的问题，判断是动机(M)不足、能力(A)不足还是提示(P)不足，输出到 executionDiagnosis.issues 和 foggDiagnosis。写 issues 时注意每条表述要具体一致（如"运动计划未执行"），方便后续识别为同一问题的重复出现\n\n3. **模式对照** — 对照「行为模式」列表中已知的反复障碍。如果本次的某条 issue 和列表中的模式相似，在 detectedPatterns 中记录，frequency 直接使用列表中的已有次数+1\n\n4. **能力评分** — 对照「能力评分」基线，对本次复盘涉及到的维度打 0-10 分，在 evidence 中注明进步/退步/维持及行为证据。输出到 capabilityDeltas（注意：必须使用数组格式 [{dimension, score, evidence}]，不要用对象键值对格式）\n\n5. **洞察（三段式）** — unaware：他没意识到的言外之意（不推测情绪，只说"你说了A，可能在想B"）；pattern：模式判断（反复障碍/新话题）；missing：与目标相关的行动是否缺失\n\n6. **充沛率评估** — 根据用户输入的睡眠质量、日间精力、情绪状态、产出效率综合推断今日充沛率（1-100），不允许留空。输出到 energyRate'}

{
  "completionSummary": { "completed": [], "notCompleted": [], "completionRate": "0%" },
  "deviationAnalysis": { "onTrack": [], "behind": [], "riskLevel": "低|中|高" },
  "executionDiagnosis": { "issues": [], "rootCause": "", "pattern": "" },
  "foggDiagnosis": { "missing": "M|A|P", "detail": "" },
  "adjustmentSuggestions": { "planChanges": [], "executionOptimization": [] },
  "externalPerspective": { "trendInsights": [], "directionCheck": "", "newOpportunities": [], "risks": [] },
  "detectedBiases": [{ "type": "", "triggerPhrase": "", "evidence": "" }],
  "detectedPatterns": [{ "pattern": "", "dimension": "", "frequency": 0 }],
  "capabilityDeltas": [{ "dimension": "", "score": 0, "evidence": "" }],
  "postureTraining": { "completed": false, "note": "" },
  "energyRate": 0,
  "signalScore": 0,
  "insight": { "unaware": "", "pattern": "", "missing": "" },
  "suggestions": [{ "type": "positive|warning|critical", "message": "" }]
}

只输出JSON，不要其他内容。`;

    const analysisText = await new Promise((resolve, reject) => {
      // Use stdin pipe to avoid Windows cmd.exe 8191-char command-line limit
      const proc = spawn('claude', ['-p', '-'], { shell: true, stdio: ['pipe', 'pipe', 'pipe'] });
      let out = '', errOut = '';
      const timer = setTimeout(() => { proc.kill(); reject(new Error('Claude CLI timeout')); }, 120000);
      proc.stdout.on('data', d => out += d);
      proc.stderr.on('data', d => errOut += d);
      proc.on('error', e => { clearTimeout(timer); reject(new Error('Claude spawn error: ' + e.message)); });
      proc.on('close', code => {
        clearTimeout(timer);
        if (code !== 0) reject(new Error('Claude CLI exit code ' + code + ': ' + errOut.slice(0,200)));
        else resolve(out);
      });
      proc.stdin.write(userPrompt);
      proc.stdin.end();
    });

    // Parse JSON from response
    let report;
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { report = JSON.parse(jsonMatch[0]); }
      catch { throw new Error('Could not parse analysis JSON'); }
    } else throw new Error('No JSON in Claude response');

    // Override posture with user-confirmed value (AI 不推断，用户直接回答的)
    // energyRate 由 AI 根据精力诊断内容综合推断，不覆盖
    if (session.postureCompleted != null) report.postureTraining = { completed: session.postureCompleted, note: '' };

    // Save to backend
    const analysisRes = await fetch('POST', '/api/analysis/generate', {
      dailyReviewId: session.reviewId,
      analysisType: 'DAILY',
      structuredReport: report,
    });

    session.analysisId = analysisRes.data?.id;

    // Save energyRate back to DailyReview for direct queryability
    if (report.energyRate != null && session.reviewId) {
      fetch('PATCH', `/api/reviews/daily/${session.reviewId}`, { energyRate: report.energyRate }).catch(err => console.error('[processor] Failed to save energyRate:', err.message));
    }

    // Track recurring issues from analysis
    fetch('POST', '/api/analysis/patterns/track', { structuredReport: report }).catch(err => console.error('[processor] Failed to track patterns:', err.message));
    // Log cognitive biases from analysis
    fetch('POST', '/api/analysis/biases/log', { dailyReviewId: session.reviewId, structuredReport: report }).catch(err => console.error('[processor] Failed to log biases:', err.message));
    // Record capability scores from analysis
    fetch('POST', '/api/analysis/capabilities/log', { structuredReport: report }).catch(err => console.error('[processor] Failed to log capabilities:', err.message));
    session.step = 'awaiting_feedback';
    saveSession(userId, session);

    // Send report as card
    const card = buildAnalysisCard(report);
    await sendFeishuCard(card);
  } catch (err) {
    console.error('[processor] Analysis failed:', err.message);
    session.step = 'idle';
    saveSession(userId, session);
    await sendFeishu('分析过程出现错误，请稍后重试。');
  }
}

// ——— Main ———
async function loadAnalysisRequirements() {
  try {
    const res = await fetch('GET', '/api/prompt/daily-review');
    if (res.data) {
      analysisRequirements = res.data;
      console.log('[processor] Analysis requirements loaded from backend');
      return;
    }
  } catch { /* fall through */ }
  // fallback: 后端不可用时使用内嵌指令
  console.log('[processor] Using embedded analysis requirements');
}

const MAX_RESTARTS = 5;
const RESTART_BASE_DELAY = 5000;
let shuttingDown = false;
let restartCount = 0;
let restartCountResetTimer = null;
let consumer = null;

async function main() {
  console.log('[processor] Starting auto-processor...');
  cleanupStaleSessions();

  // Retry backend connection — Bridge stays alive even if backend is temporarily down
  const backendReady = await waitForBackend({
    maxRetries: 20, baseDelay: 3000,
    onRetry: (n) => console.log('[processor] Waiting for backend (' + n + '/20)...'),
  });
  if (backendReady) {
    await loadAnalysisRequirements();
    console.log('[processor] Backend healthy');
  } else {
    console.warn('[processor] Backend not reachable — will retry later when commands arrive');
  }

  // Graceful shutdown
  process.on('SIGINT', () => shutdownGracefully());
  process.on('SIGTERM', () => shutdownGracefully());

  startConsumer();
}

function startConsumer() {
  if (shuttingDown) return;

  // shell:true required on Windows for .cmd files; stdin must be piped and
  // never closed — lark-cli exits on stdin EOF (detects non-TTY stdin).
  consumer = spawn(LARK_CLI, ['event', 'consume', 'im.message.receive_v1', '--as', 'bot', '--max-events', '0'], {
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  consumer.stderr.on('data', () => {});
  // Keep stdin open — write a no-op space every 30s so the pipe stays alive
  const stdinKeepalive = setInterval(() => {
    try { if (consumer?.stdin?.writable) consumer.stdin.write(' '); }
    catch { clearInterval(stdinKeepalive); }
  }, 30000);
  consumer.stdin.on('error', () => clearInterval(stdinKeepalive));

  consumer.on('error', (err) => {
    console.error('[processor] Failed to spawn lark-cli:', err.message);
    scheduleRestart();
  });

  // On Windows with shell:true, cmd.exe exits immediately (it spawned lark-cli
  // as a child). The 'exit' event fires for cmd.exe, not lark-cli. Only restart
  // when stdout closes — that's the real lark-cli death signal.
  let consumerExited = false;
  consumer.on('exit', (code) => {
    // On Windows with shell:true, the 'exit' event fires for cmd.exe, not
    // lark-cli. Don't restart here — wait for stdout close (the real death
    // signal). Just set the flag so close handler is a no-op if lark-cli
    // really did exit.
    if (consumerExited) return;
    consumerExited = true;
    clearInterval(stdinKeepalive);
    console.log('[processor] lark-cli process exited:', code);
    consumer = null;
  });

  const rl = require('readline').createInterface({ input: consumer.stdout, crlfDelay: Infinity });
  rl.on('line', async (line) => {
    line = line.trim();
    if (!line) return;
    try {
      const parsed = JSON.parse(line);
      const event = parsed.event || parsed;
      if (!event.event_id) return;

      // DEBUG: log raw event structure (without content body for brevity)
      console.log('[processor] RAW event:', JSON.stringify({ event_id: event.event_id, type: event.event_type, chat_type: event.chat_type, message_type: event.message_type, sender: event.sender, has_content: !!event.content, keys: Object.keys(event) }));

      const ev = {
        event_id: event.event_id,
        content: event.content || '',
        sender_id: event.sender_id || event.sender?.sender_id || '',
        chat_type: event.chat_type || '',
        message_type: event.message_type || 'text',
      };

      console.log('[processor] Extracted ev:', JSON.stringify({ event_id: ev.event_id, chat_type: ev.chat_type, sender_id: ev.sender_id, content_preview: ev.content.slice(0, 50) }));

      if (ev.chat_type !== 'p2p') { console.log('[processor] Skip non-p2p:', ev.chat_type); return; } // DM only
      if (ev.message_type === 'text') {
        try { const pc = JSON.parse(ev.content); if (pc.text) ev.content = pc.text; }
        catch { /* plain text */ }
      }

      await processEvent(ev).catch(err => console.error('[processor] Event error:', err.message));
    } catch (e) { console.error('[processor] Parse error:', e.message); }
  });

  rl.on('close', () => {
    if (!consumerExited) {
      consumerExited = true;
      clearInterval(stdinKeepalive);
      console.log('[processor] lark-cli stdout closed — process died');
      consumer = null;
      if (!shuttingDown) scheduleRestart();
    }
  });

  // Reset restart counter after 30s of stable uptime
  if (restartCountResetTimer) clearTimeout(restartCountResetTimer);
  restartCountResetTimer = setTimeout(() => { restartCount = 0; }, 30000);

  console.log('[processor] Ready');
}

function scheduleRestart() {
  if (shuttingDown) return;
  restartCount++;
  if (restartCount > MAX_RESTARTS) {
    console.error('[processor] Max restarts reached, exiting.');
    process.exit(1);
  }
  const delay = RESTART_BASE_DELAY * Math.pow(2, restartCount - 1);
  console.log(`[processor] Restarting consumer in ${delay}ms (attempt ${restartCount}/${MAX_RESTARTS})`);
  setTimeout(() => startConsumer(), delay);
}

function shutdownGracefully() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('[processor] Shutting down...');
  if (consumer) {
    consumer.kill();
    consumer = null;
  }
  setTimeout(() => {
    console.log('[processor] Goodbye.');
    process.exit(0);
  }, 2000);
}

main().catch(err => {
  console.error('[processor] Fatal:', err.message);
  process.exit(1);
});
