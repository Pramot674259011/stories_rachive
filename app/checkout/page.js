"use client";
import { useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { supabase, supabaseReady } from "@/lib/supabase";
import { getContract, CONTRACT } from "@/lib/chain";
import { useApp } from "@/components/Providers";

export default function Checkout() {
  const { works, user, ready, cart, sold, clear, reloadSold, useDb } = useApp();
  const [status, setStatus] = useState("");
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);

  if (ready && !user) return <main className="page center"><Link className="pill" href="/login">Sign in first</Link></main>;
  const items = works.filter((w) => cart.includes(w.id) && !sold[w.id]);
  const total = items.reduce((a, i) => a + ethers.parseEther(String(i.price_eth)), 0n);

  async function settle() {
    setBusy(true);
    try {
      if (!CONTRACT) throw new Error("ยังไม่ได้ตั้ง NEXT_PUBLIC_CONTRACT_ADDRESS ใน .env.local");
      setStatus("Confirm in your wallet…");
      const c = await getContract();
      const tx = await c.acquire(items.map((i) => i.id), { value: total });
      setStatus("Waiting for the network to confirm…");
      await tx.wait();
      if (useDb) { // optional: record the order in the database
        try {
          const { data } = await supabase.auth.getSession();
          await fetch("/api/verify", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + data.session.access_token }, body: JSON.stringify({ txHash: tx.hash }) });
        } catch (e) {}
      }
      await clear(items.map((i) => i.id));
      reloadSold();
      setDone(tx.hash); setStatus("");
    } catch (e) { setStatus(e.shortMessage || e.message); }
    setBusy(false);
  }

  if (done) return (
    <main className="page center">
      <h2 className="big">Yours now.</h2>
      <p className="dim">The works are recorded to your wallet on-chain.</p>
      <a className="pill" href={"https://sepolia.etherscan.io/tx/" + done} target="_blank" rel="noreferrer">View transaction</a>
    </main>
  );
  return (
    <main className="page narrow">
      <h2 className="big">Settle</h2>
      {items.map((i) => (<div className="row" key={i.id}><img src={i.thumb_url} alt="" /><div><h3>{i.title}</h3></div><div className="dim">{i.price_eth} ETH</div></div>))}
      {!items.length && <p className="dim">Nothing to settle. <Link href="/gallery">Back to the archive</Link></p>}
      {!!items.length && (
        <>
          <p className="total">Total {ethers.formatEther(total)} ETH (Sepolia test network)</p>
          <button className="pill" disabled={busy} onClick={settle}>{busy ? "Working…" : "Pay with wallet"}</button>
          <p className="dim small">One wallet approval settles everything. You need MetaMask on Sepolia with a little test ETH.</p>
        </>
      )}
      {status && <p className="status">{status}</p>}
    </main>
  );
}
