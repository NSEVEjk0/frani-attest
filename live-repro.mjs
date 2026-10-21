import { spawn } from "node:child_process";
const port = 9242;
const chrome = spawn("chromium", [
  "--headless=new", `--remote-debugging-port=${port}`,
  "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  "--user-data-dir=/tmp/chrome-attest-live", "about:blank",
], { stdio: "ignore" });
let targets = null;
for (let i = 0; i < 30; i++) {
  await new Promise(r => setTimeout(r, 500));
  try { targets = await fetch(`http://127.0.0.1:${port}/json`).then(r => r.json()); if (targets.length) break; } catch {}
}
if (!targets?.length) { console.log("CHROME FAILED"); process.exit(0); }
const page = targets.find(t => t.type === "page") || targets[0];
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0; const pending = new Map(); const consoleMsgs = [];
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const msgId = ++id; pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id); pending.delete(msg.id);
    if (msg.error) p.reject(new Error(msg.error.message)); else p.resolve(msg.result);
  } else if (msg.method === "Runtime.consoleAPICalled") {
    consoleMsgs.push(msg.params.args.map(a => a.value ?? a.description ?? "").join(" "));
  } else if (msg.method === "Runtime.exceptionThrown") {
    consoleMsgs.push("EXCEPTION: " + (msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text || ""));
  }
};
await new Promise(r => ws.onopen = r);
await send("Page.enable"); await send("Runtime.enable");
await send("Page.navigate", { url: "https://frani-attest-trust.vercel.app/" });
await new Promise(r => setTimeout(r, 10000));
console.log("home errors:", consoleMsgs.filter(m => m.includes("EXCEPTION")).slice(-3));
await send("Page.navigate", { url: "https://frani-attest-trust.vercel.app/explore" });
await new Promise(r => setTimeout(r, 10000));
console.log("explore errors:", consoleMsgs.filter(m => m.includes("EXCEPTION")).slice(-3));
console.log("all console:", consoleMsgs.slice(-12));
ws.close(); chrome.kill(); process.exit(0);
