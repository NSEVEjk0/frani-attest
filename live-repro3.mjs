import { spawn } from "node:child_process";

const port = 9252;
const chrome = spawn("chromium", [
  "--headless=new", `--remote-debugging-port=${port}`,
  "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  "--user-data-dir=/tmp/chrome-attest-live4", "about:blank",
], { stdio: "ignore" });

let targets = null;
for (let i = 0; i < 30; i++) {
  await new Promise(r => setTimeout(r, 500));
  try {
    targets = await fetch(`http://127.0.0.1:${port}/json`).then(r => r.json());
    if (targets.length) break;
  } catch {}
}
if (!targets?.length) { console.log("CHROME FAILED"); process.exit(0); }
const page = targets.find(t => t.type === "page") || targets[0];

const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const consoleMsgs = [];

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}

ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) p.reject(new Error(msg.error.message));
    else p.resolve(msg.result);
  } else if (msg.method === "Runtime.consoleAPICalled") {
    consoleMsgs.push(msg.params.args.map(a => a.value ?? a.description ?? "").join(" "));
  } else if (msg.method === "Runtime.exceptionThrown") {
    const d = msg.params.exceptionDetails;
    consoleMsgs.push("EXCEPTION: " + (d?.exception?.description || d?.text || ""));
  }
};

await new Promise(r => ws.onopen = r);
await send("Page.enable");
await send("Runtime.enable");

// Home → connect wallet → create
await send("Page.navigate", { url: "https://frani-attest-trust.vercel.app/" });
await new Promise(r => setTimeout(r, 9000));
await send("Runtime.evaluate", { expression: `(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Connect wallet')); b?.click(); })()`, returnByValue: true });
await new Promise(r => setTimeout(r, 2000));
await send("Runtime.evaluate", { expression: `(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Create a new Unicity wallet')); b?.click(); })()`, returnByValue: true });
await new Promise(r => setTimeout(r, 1500));
await send("Runtime.evaluate", { expression: `(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Generate wallet')); b?.click(); })()`, returnByValue: true });
await new Promise(r => setTimeout(r, 3000));

const afterCreate = await send("Runtime.evaluate", { expression: `
  (() => {
    const body = document.body.innerText;
    return {
      hasRecovery: body.includes('Save your recovery phrase'),
      hasWallet: body.includes('wallet_'),
    };
  })()
`, returnByValue: true });
console.log("=== WALLET CREATE ===");
console.log(JSON.stringify(afterCreate.result.value));
console.log(consoleMsgs.filter(m => m.includes("EXCEPTION") || m.toLowerCase().includes("error")).slice(-3));

// Explore → open profile → issue attestation
await send("Page.navigate", { url: "https://frani-attest-trust.vercel.app/explore" });
await new Promise(r => setTimeout(r, 9000));
await send("Runtime.evaluate", { expression: `(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('@frani-agent')); b?.click(); })()`, returnByValue: true });
await new Promise(r => setTimeout(r, 3000));
await send("Runtime.evaluate", { expression: `(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Issue attestation')); b?.click(); })()`, returnByValue: true });
await new Promise(r => setTimeout(r, 2000));
await send("Runtime.evaluate", { expression: `(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Sign & issue')); b?.click(); })()`, returnByValue: true });
await new Promise(r => setTimeout(r, 4000));

const afterIssue = await send("Runtime.evaluate", { expression: `
  (() => {
    const body = document.body.innerText;
    return {
      hasSuccess: body.includes('Attestation signed and recorded') || body.includes('attestation'),
      hasError: body.includes('Could not'),
    };
  })()
`, returnByValue: true });
console.log("=== ISSUE ATTESTATION ===");
console.log(JSON.stringify(afterIssue.result.value));
console.log(consoleMsgs.filter(m => m.includes("EXCEPTION") || m.toLowerCase().includes("error")).slice(-3));

ws.close();
chrome.kill();
process.exit(0);
