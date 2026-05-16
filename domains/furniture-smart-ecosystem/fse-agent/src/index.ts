import http from "node:http";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig, type Config } from "./config.js";
import { sendWol } from "./wol.js";
import { sshExec } from "./ssh.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const config: Config = loadConfig();
const PORT = config.server?.port ?? 3000;

const html = readFileSync(resolve(__dirname, "index.html"), "utf-8");

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  if (url.pathname === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }

  if (url.pathname === "/api/poweron" && req.method === "POST") {
    log("💻 执行开机（WOL）...");
    try {
      await sendWol({
        mac: config.wol.mac,
        broadcast: config.wol.broadcast,
        port: config.wol.port,
      });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, action: "poweron" }));
      log("✅ WOL 包已发送");
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: err.message }));
      log(`❌ WOL 失败: ${err.message}`);
    }
    return;
  }

  if (url.pathname === "/api/poweroff" && req.method === "POST") {
    log("💻 执行关机（SSH）...");
    try {
      const out = await sshExec(
        {
          host: config.ssh.host,
          port: config.ssh.port,
          user: config.ssh.user,
          password: config.ssh.password,
          privateKey: config.ssh.privateKey,
        },
        'shutdown /s /t 5 /c "FSE Agent 远程关机"',
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, action: "poweroff", output: out.trim() }));
      log("✅ 关机命令已执行");
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: err.message }));
      log(`❌ 关机失败: ${err.message}`);
    }
    return;
  }

  if (url.pathname === "/api/status" && req.method === "GET") {
    try {
      await sshExec(
        {
          host: config.ssh.host,
          port: config.ssh.port,
          user: config.ssh.user,
          password: config.ssh.password,
          privateKey: config.ssh.privateKey,
        },
        "echo ONLINE",
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, status: "online" }));
    } catch {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, status: "offline" }));
    }
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`
╔══════════════════════════════════╗
║  FSE Agent v0.1.0               ║
║  HTTP 服务已启动                  ║
║  手机同一 WiFi 访问:             ║
║  http://手机IP:${String(PORT).padEnd(5)}║
╚══════════════════════════════════╝
  `);
  log(`服务地址: http://0.0.0.0:${PORT}`);
  log(`电脑: ${config.wol.mac}`);
});

function log(msg: string) {
  const t = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  console.log(`[${t}] ${msg}`);
}
