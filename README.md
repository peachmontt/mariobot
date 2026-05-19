# MarioBot

One-page Mario-themed landing site wired to your **Solana** wallet.

## Features

- Full-screen command-center layout with dancing **MarioBot** (CSS animation)
- **Connect Solana Wallet** — Phantom, Solflare, Backpack, and other `window.solana` wallets
- Live **SOL balance** and address on the page and desk monitor
- Info dialog explaining the project
## Run locally

```bash
cd mariobot
python3 -m http.server 8080
```

Open http://localhost:8080 (ES modules require a local server, not `file://`).

## Deploy

Static hosting works anywhere (Vercel, Netlify, GitHub Pages). Upload the folder contents; no build step required.

## Customize

- Replace the X link in `index.html` with your MarioBot account
- Point `RPC_ENDPOINT` in `app.js` to your preferred Solana RPC for faster reads
- Swap the CSS character for a PNG/GIF of your MarioBot mascot in `assets/`
