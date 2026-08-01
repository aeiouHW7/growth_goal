import { useState, useEffect, useCallback } from 'react';
import { ARCHIVE_API } from '../api';
import type { LifeArchive, LayerCoreInput, LayerResourcesInput, LayerFutureInput } from '../api';
import { LoadingState, ErrorState } from '../components/EmptyState';
import '../styles/archive.css';

type SubTab = 'core' | 'resources' | 'future';

const SUB_LABELS: Record<SubTab, string> = { core: '🧬 核心特质', resources: '📦 资源能力', future: '🎯 未来蓝图' };

// ─── 盖洛普标签组件 ───
function GallupInput({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (!v) return;
    if (values.length >= 5) return;
    onChange([...values, v]);
    setInput('');
  };
  return (
    <div className="f-group">
      <label className="f-label">盖洛普优势 (最多5项)</label>
      <div className="tag-row">
        <input className="tag-input" placeholder="输入后按回车添加" value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
      </div>
      <div className="tags">
        {values.map((t, i) => (
          <span key={i} className="tag">{t} <span className="tag-x" onClick={() => onChange(values.filter((_, j) => j !== i))}>×</span></span>
        ))}
      </div>
    </div>
  );
}

// ─── MBTI 选择器 ───
const MBTI_DIMS: Array<{ key: string; options: [string, string]; label: string }> = [
  { key: 'e', options: ['E', 'I'], label: '能量来源' },
  { key: 'n', options: ['N', 'S'], label: '认知方式' },
  { key: 't', options: ['T', 'F'], label: '决策方式' },
  { key: 'j', options: ['J', 'P'], label: '生活态度' },
];

function MBTISelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parts = value || '----';
  const dimValues = [parts[0] || '-', parts[1] || '-', parts[2] || '-', parts[3] || '-'];

  return (
    <div className="f-group">
      <label className="f-label">MBTI</label>
      <div className="mbti-row">
        {MBTI_DIMS.map((dim, i) => (
          <div key={dim.key} className="mbti-group">
            <label>{dim.label}</label>
            <div className="mbti-btn-group">
              {dim.options.map(opt => (
                <button key={opt} type="button"
                  className={`mbti-btn ${dimValues[i] === opt ? 'selected' : ''}`}
                  onClick={() => {
                    const next = [...dimValues];
                    next[i] = opt;
                    onChange(next.join(''));
                  }}>{opt}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="f-hint">当前: {value || '未设置'}</div>
    </div>
  );
}

// ─── 大五人格滑条 ───
const BIG_FIVE_LABELS: Array<{ key: keyof NonNullable<NonNullable<LayerCoreInput['personality']>['bigFive']>; label: string }> = [
  { key: 'openness', label: '开放性' },
  { key: 'conscientiousness', label: '尽责性' },
  { key: 'extraversion', label: '外向性' },
  { key: 'agreeableness', label: '宜人性' },
  { key: 'neuroticism', label: '神经质' },
];

function BigFiveSliders({ value, onChange }: {
  value: NonNullable<NonNullable<LayerCoreInput['personality']>['bigFive']>;
  onChange: (v: NonNullable<NonNullable<LayerCoreInput['personality']>['bigFive']>) => void;
}) {
  return (
    <div className="f-group">
      <label className="f-label">大五人格</label>
      <div className="bigfive-grid">
        {BIG_FIVE_LABELS.map(({ key, label }) => (
          <div key={key} className="bf-row">
            <span className="bf-label">{label}</span>
            <input type="range" min={1} max={100} value={value[key] ?? 50}
              onChange={e => onChange({ ...value, [key]: Number(e.target.value) })} />
            <span className="bf-val">{value[key] ?? 50}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 技能卡片 ───
function SkillsEditor({ skills, onChange }: {
  skills: NonNullable<LayerResourcesInput['skills']>;
  onChange: (v: NonNullable<LayerResourcesInput['skills']>) => void;
}) {
  const addSkill = () => {
    onChange([...skills, { skillName: '', level: '', yearsOfExperience: 0, description: '' }]);
  };
  const updateSkill = (i: number, patch: Partial<NonNullable<LayerResourcesInput['skills']>[0]>) => {
    const next = [...skills];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  return (
    <div className="skills-area">
      {skills.map((s, i) => (
        <div key={i} className="skill-card">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input className="f-input" style={{ flex: 2 }} placeholder="技能名称" value={s.skillName}
              onChange={e => updateSkill(i, { skillName: e.target.value })} />
            <input className="f-input" style={{ flex: 1 }} placeholder="等级" value={s.level}
              onChange={e => updateSkill(i, { level: e.target.value })} />
            <input className="f-input" style={{ width: 70 }} type="number" placeholder="年限" value={s.yearsOfExperience || ''}
              onChange={e => updateSkill(i, { yearsOfExperience: Number(e.target.value) })} />
            <button className="btn-icon" onClick={() => onChange(skills.filter((_, j) => j !== i))}>✕</button>
          </div>
          <input className="f-input" style={{ marginTop: 6 }} placeholder="具体描述（选填）" value={s.description || ''}
            onChange={e => updateSkill(i, { description: e.target.value })} />
        </div>
      ))}
      <button className="btn btn-outline btn-sm" onClick={addSkill}>+ 添加技能</button>
    </div>
  );
}

// ─── 主页面 ───
export function ArchivePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<SubTab>('core');
  const [data, setData] = useState<LifeArchive | null>(null);

  // 各层编辑数据
  const [layerCore, setLayerCore] = useState<LayerCoreInput>({ personality: { bigFive: {} } });
  const [layerResources, setLayerResources] = useState<LayerResourcesInput>({ skills: [] });
  const [layerFuture, setLayerFuture] = useState<LayerFutureInput>({});

  const loadArchive = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const archive = await ARCHIVE_API.get();
      setData(archive);
      if (archive?.layerCore) setLayerCore(archive.layerCore);
      if (archive?.layerResources) setLayerResources(archive.layerResources);
      if (archive?.layerFuture) setLayerFuture(archive.layerFuture);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve(); // 规避 set-state-in-effect
      if (cancelled) return;
      loadArchive();
    })();
    return () => { cancelled = true; };
  }, [loadArchive]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (subTab === 'core') {
        const updated = await ARCHIVE_API.updateLayerCore(layerCore);
        setData(prev => prev ? { ...prev, layerCore: updated.layerCore } : null);
      } else if (subTab === 'resources') {
        const updated = await ARCHIVE_API.updateLayerResources(layerResources);
        setData(prev => prev ? { ...prev, layerResources: updated.layerResources } : null);
      } else if (subTab === 'future') {
        const updated = await ARCHIVE_API.updateLayerFuture(layerFuture);
        setData(prev => prev ? { ...prev, layerFuture: updated.layerFuture } : null);
      }
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={loadArchive} />;

  const personality = layerCore.personality || {};
  const bigFive = personality.bigFive || {};
  const p = personality;
  const pf = layerFuture;

  return (
    <div className="archive-page">
      <div className="archive-hdr">
        <div>
          <h1>人生档案</h1>
          <p>AI 教练的长期记忆 · 让每次建议更贴合你</p>
        </div>
        <div className="archive-actions">
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
            {saving ? '保存中…' : '💾 保存'}
          </button>
          {saveError && (
            <span style={{ fontSize: 12, color: 'var(--error, #ef4444)', marginLeft: 8 }}>保存失败：{saveError}</span>
          )}
        </div>
      </div>

      {/* AI 摘要预览 */}
      {data?.summary && (
        <div className="summary-card">
          <div className="c-title">🤖 AI 摘要</div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text)' }}>{data.summary}</p>
        </div>
      )}

      {/* 子标签导航 */}
      <div className="sub-tabs">
        {(Object.entries(SUB_LABELS) as [SubTab, string][]).map(([key, label]) => (
          <button key={key} className={`sub-tab ${subTab === key ? 'active' : ''}`}
            onClick={() => setSubTab(key)}>{label}</button>
        ))}
      </div>

      {/* ─── 子标签1：核心特质 ─── */}
      {subTab === 'core' && (
        <div className="archive-grid">
          <div className="archive-col">
            <MBTISelector value={p.mbti || ''}
              onChange={v => setLayerCore({ ...layerCore, personality: { ...personality, mbti: v } })} />
            <GallupInput values={p.gallup || []}
              onChange={v => setLayerCore({ ...layerCore, personality: { ...personality, gallup: v } })} />
          </div>
          <div className="archive-col">
            <BigFiveSliders value={bigFive}
              onChange={v => setLayerCore({ ...layerCore, personality: { ...personality, bigFive: v } })} />
          </div>
        </div>
      )}

      {/* ─── 子标签2：资源能力 ─── */}
      {subTab === 'resources' && (
        <div className="archive-grid">
          <div className="archive-col">
            <div className="archive-section">
              <div className="c-title">💻 核心技能</div>
              <SkillsEditor skills={layerResources.skills || []}
                onChange={v => setLayerResources({ ...layerResources, skills: v })} />
            </div>
            <div className="archive-section">
              <div className="c-title">💰 财务状况</div>
              <div className="f-group">
                <label className="f-label">财务安全垫</label>
                <input className="f-input" value={layerResources.finance?.safetyNet || ''}
                  onChange={e => setLayerResources({ ...layerResources, finance: { ...layerResources.finance, safetyNet: e.target.value } })} />
              </div>
              <div className="f-group">
                <label className="f-label">收入结构</label>
                <input className="f-input" value={layerResources.finance?.incomeStructure || ''}
                  onChange={e => setLayerResources({ ...layerResources, finance: { ...layerResources.finance, incomeStructure: e.target.value } })} />
              </div>
              <div className="f-group">
                <label className="f-label">每月可投入自我发展的资金</label>
                <input className="f-input" value={layerResources.finance?.investableFunds || ''}
                  onChange={e => setLayerResources({ ...layerResources, finance: { ...layerResources.finance, investableFunds: e.target.value } })} />
              </div>
              <div className="f-group">
                <label className="f-label">财务阶段</label>
                <input className="f-input" value={layerResources.finance?.financialStage || ''}
                  onChange={e => setLayerResources({ ...layerResources, finance: { ...layerResources.finance, financialStage: e.target.value } })} />
              </div>
            </div>
          </div>
          <div className="archive-col">
            <div className="archive-section">
              <div className="c-title">⏰ 时间资源</div>
              <div className="f-group">
                <label className="f-label">工作日可支配时间 (小时)</label>
                <input className="f-input" type="number" value={layerResources.weekdayAvailableHours ?? ''}
                  onChange={e => setLayerResources({ ...layerResources, weekdayAvailableHours: Number(e.target.value) || undefined })} />
              </div>
              <div className="f-group">
                <label className="f-label">周末可支配时间 (小时)</label>
                <input className="f-input" type="number" value={layerResources.weekendAvailableHours ?? ''}
                  onChange={e => setLayerResources({ ...layerResources, weekendAvailableHours: Number(e.target.value) || undefined })} />
              </div>
              <div className="f-group">
                <label className="f-label">固定时间支出</label>
                <textarea className="f-textarea" rows={3} value={layerResources.fixedExpenditure || ''}
                  onChange={e => setLayerResources({ ...layerResources, fixedExpenditure: e.target.value })} />
              </div>
            </div>
            <div className="archive-section">
              <div className="c-title">🤝 支持系统</div>
              <div className="f-group">
                <label className="f-label">导师/前辈资源</label>
                <textarea className="f-textarea" rows={2} value={layerResources.support?.guidance || ''}
                  onChange={e => setLayerResources({ ...layerResources, support: { ...layerResources.support, guidance: e.target.value } })} />
              </div>
              <div className="f-group">
                <label className="f-label">协作搭档</label>
                <textarea className="f-textarea" rows={2} value={layerResources.support?.collaboration || ''}
                  onChange={e => setLayerResources({ ...layerResources, support: { ...layerResources.support, collaboration: e.target.value } })} />
              </div>
              <div className="f-group">
                <label className="f-label">情感支持</label>
                <textarea className="f-textarea" rows={2} value={layerResources.support?.emotionalSupport || ''}
                  onChange={e => setLayerResources({ ...layerResources, support: { ...layerResources.support, emotionalSupport: e.target.value } })} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', paddingTop: 8, borderTop: '1px solid var(--sep)', marginTop: 8 }}>
              ⚡ 能量精力和健康状态由 AI 在复盘后自动分析写入
            </div>
          </div>
        </div>
      )}

      {/* ─── 子标签3：未来蓝图 ─── */}
      {subTab === 'future' && (
        <div className="archive-grid">
          <div className="archive-col">
            <div className="archive-section">
              <div className="c-title">🎯 愿景</div>
              {(['years10', 'years3', 'year1'] as const).map(field => (
                <div key={field} className="f-group">
                  <label className="f-label">
                    {field === 'years10' ? '10 年愿景' : field === 'years3' ? '3 年目标' : '1 年目标'}
                    <span className="req">*</span>
                  </label>
                  <textarea className="f-textarea" rows={field === 'years10' ? 3 : 2}
                    value={pf.vision?.[field] || ''}
                    onChange={e => setLayerFuture({ ...layerFuture, vision: { ...pf.vision, [field]: e.target.value } })} />
                </div>
              ))}
            </div>
            <div className="archive-section">
              <div className="c-title">💡 动力来源</div>
              <div className="f-group">
                <label className="f-label">核心动机 <span className="req">*</span></label>
                <textarea className="f-textarea" rows={2} value={pf.goalSource?.motivation || ''}
                  onChange={e => setLayerFuture({ ...layerFuture, goalSource: { ...pf.goalSource, motivation: e.target.value } })} />
              </div>
              <div className="f-group">
                <label className="f-label">为什么是现在 <span className="req">*</span></label>
                <textarea className="f-textarea" rows={2} value={pf.goalSource?.whyNow || ''}
                  onChange={e => setLayerFuture({ ...layerFuture, goalSource: { ...pf.goalSource, whyNow: e.target.value } })} />
              </div>
            </div>
          </div>
          <div className="archive-col">
            <div className="archive-section">
              <div className="c-title">📊 结果区间</div>
              <div className="f-group">
                <label className="f-label">最低可接受结果 <span className="req">*</span></label>
                <input className="f-input" value={pf.outcomeRange?.minimum || ''}
                  onChange={e => setLayerFuture({ ...layerFuture, outcomeRange: { ...pf.outcomeRange, minimum: e.target.value } })} />
              </div>
              <div className="f-group">
                <label className="f-label">理想结果 <span className="req">*</span></label>
                <input className="f-input" value={pf.outcomeRange?.ideal || ''}
                  onChange={e => setLayerFuture({ ...layerFuture, outcomeRange: { ...pf.outcomeRange, ideal: e.target.value } })} />
              </div>
              <div className="f-group">
                <label className="f-label">描述</label>
                <textarea className="f-textarea" rows={2} value={pf.outcomeRange?.description || ''}
                  onChange={e => setLayerFuture({ ...layerFuture, outcomeRange: { ...pf.outcomeRange, description: e.target.value } })} />
              </div>
            </div>
            <div className="archive-section">
              <div className="c-title">👤 榜样与反思</div>
              <div className="f-group">
                <label className="f-label">正面榜样 <span className="req">*</span></label>
                <textarea className="f-textarea" rows={2} value={pf.roleModels?.positive || ''}
                  onChange={e => setLayerFuture({ ...layerFuture, roleModels: { ...pf.roleModels, positive: e.target.value } })} />
              </div>
              <div className="f-group">
                <label className="f-label">反面警示 <span className="req">*</span></label>
                <textarea className="f-textarea" rows={2} value={pf.roleModels?.negative || ''}
                  onChange={e => setLayerFuture({ ...layerFuture, roleModels: { ...pf.roleModels, negative: e.target.value } })} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
