# Frani Attest

Signed reputation attestations for Unicity testnet2. After a deal, either
party issues a signed attestation about the other; anyone can look up a
nametag and read its score and history. Built with Next.js, deployed on
Vercel.

Made by **CRYPTFRANI**. Owner / creator: **Itachi**.

---

## Track

Identity / Trust.

## Is it Agentic?

No. Frani Attest is a web app; attestations are user-driven.

## Runs on AstridOS?

No.

## Live on-network

- Network: **testnet2**
- Preview mode: profiles + attestations live in the browser (localStorage)
  until a wallet-api connection is wired in.

## SDK features used

| Feature | Where |
|---|---|
| Wallet identity (planned) | `src/lib/attest.ts` adapter |
| Signed messages | attestations carry a signature field |

## Develop

```bash
npm install
npm run dev
npm run build
```
