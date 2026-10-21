import { spawn } from "node:child_process";

const port = 9251;
const chrome = spawn("chromium", [
  "--headless=new", `--remote-debugging-port=${port}`,
  "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  "--user-data-dir=/tmp/chrome-attest-live3", "about:blank",
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

// Explore
await send("Page.navigate", { url: "https://frani-attest-trust.vercel.app/explore" });
await new Promise(r => setTimeout(r, 10000));

// Click the first profile card
await send("Runtime.evaluate", { expression: `
  (() => {
    const btns = [...document.querySelectorAll('button')];
    const b = btns.find(x => x.textContent.includes('@'));
    if (b) { b.click(); return 'clicked: ' + b.textContent.slice(0,30); }
    return 'no profile button';
  })()
`, returnByValue: true });
await new Promise(r => setTimeout(r, 4000));

const afterOpen = await send("Runtime.evaluate", { expression: `
  (() => {
    const body = document.body.innerText;
    return {
      hasAttestations: body.includes('Attestation history'),
      hasIssueBtn: body.includes('Issue attestation'),
      bodySnippet: body.slice(0, 200),
    };
  })()
`, returnByValue: true });
console.log("=== AFTER OPENING PROFILE ===");
console.log(JSON.stringify(afterOpen.result.value, null, 2));
console.log(consoleMsgs.filter(m => m.includes("EXCEPTION") || m.toLowerCase().includes("error")).slice(-5));

ws.close();
chrome.kill();
process.exit(0);
