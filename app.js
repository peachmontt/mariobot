import { Connection, PublicKey, LAMPORTS_PER_SOL } from "https://esm.sh/@solana/web3.js@1.95.4";

const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";

const walletBtn = document.getElementById("wallet-btn");
const walletStatus = document.getElementById("wallet-status");
const walletDetails = document.getElementById("wallet-details");
const walletAddress = document.getElementById("wallet-address");
const walletBalance = document.getElementById("wallet-balance");
const terminalStats = document.getElementById("terminal-stats");
const infoBtn = document.getElementById("info-btn");
const infoDialog = document.getElementById("info-dialog");
const dialogClose = document.getElementById("dialog-close");

let publicKey = null;
const connection = new Connection(RPC_ENDPOINT, "confirmed");

function getProvider() {
  if (typeof window === "undefined") return null;
  if (window.phantom?.solana?.isPhantom) return window.phantom.solana;
  if (window.solana?.isPhantom) return window.solana;
  if (window.solflare?.isSolflare) return window.solflare;
  if (window.backpack) return window.backpack;
  return window.solana ?? null;
}

function shortenAddress(addr) {
  const s = addr.toString();
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

function updateTerminal({ status, sol, tokens }) {
  terminalStats.textContent = `mariobot wallet
Status: ${status}
SOL: ${sol}
Tokens: ${tokens}`;
}

async function fetchBalance(pubkey) {
  const lamports = await connection.getBalance(pubkey);
  return lamports / LAMPORTS_PER_SOL;
}

async function refreshBalance() {
  if (!publicKey) return;
  try {
    const sol = await fetchBalance(publicKey);
    const formatted = sol.toFixed(4);
    walletBalance.textContent = `${formatted} SOL`;
    updateTerminal({
      status: "connected",
      sol: formatted,
      tokens: "fetch via explorer",
    });
  } catch {
    walletBalance.textContent = "— SOL";
    updateTerminal({ status: "connected (balance error)", sol: "—", tokens: "—" });
  }
}

function setConnected(pubkey) {
  publicKey = pubkey;
  walletBtn.textContent = "Disconnect";
  walletBtn.classList.add("connected");
  walletStatus.textContent = "Wallet connected";
  walletDetails.classList.remove("hidden");
  walletAddress.textContent = shortenAddress(pubkey);
  refreshBalance();
}

function setDisconnected() {
  publicKey = null;
  walletBtn.textContent = "Connect Solana Wallet";
  walletBtn.classList.remove("connected");
  walletStatus.textContent = "Not connected";
  walletDetails.classList.add("hidden");
  walletAddress.textContent = "—";
  walletBalance.textContent = "— SOL";
  updateTerminal({ status: "disconnected", sol: "—", tokens: "—" });
}

async function connectWallet() {
  const provider = getProvider();
  if (!provider) {
    walletStatus.textContent = "Install Phantom or another Solana wallet";
    window.open("https://phantom.app/", "_blank", "noopener,noreferrer");
    return;
  }

  try {
    const resp = await provider.connect();
    const key = resp?.publicKey ?? provider.publicKey;
    if (!key) throw new Error("No public key");
    setConnected(new PublicKey(key.toString()));
  } catch (err) {
    if (err?.code === 4001) {
      walletStatus.textContent = "Connection cancelled";
    } else {
      walletStatus.textContent = "Connection failed";
      console.error(err);
    }
  }
}

async function disconnectWallet() {
  const provider = getProvider();
  try {
    await provider?.disconnect?.();
  } catch {
    /* ignore */
  }
  setDisconnected();
}

walletBtn.addEventListener("click", () => {
  if (publicKey) disconnectWallet();
  else connectWallet();
});

infoBtn.addEventListener("click", () => infoDialog.showModal());
dialogClose.addEventListener("click", () => infoDialog.close());

infoDialog.addEventListener("click", (e) => {
  if (e.target === infoDialog) infoDialog.close();
});

const provider = getProvider();
if (provider) {
  provider.on?.("connect", (key) => {
    const pk = key ?? provider.publicKey;
    if (pk) setConnected(new PublicKey(pk.toString()));
  });
  provider.on?.("disconnect", () => setDisconnected());
  provider.on?.("accountChanged", (key) => {
    if (!key) setDisconnected();
    else setConnected(new PublicKey(key.toString()));
  });

  if (provider.isConnected && provider.publicKey) {
    setConnected(new PublicKey(provider.publicKey.toString()));
  }
}

setDisconnected();
