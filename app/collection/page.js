"use client";
import Link from "next/link";
import { useApp } from "@/components/Providers";

export default function Collection() {
  const { works, user, ready, cart, remove, sold } = useApp();
  if (ready && !user) return <main className="page center"><h2 className="big">Your collection</h2><Link className="pill" href="/login">Sign in to begin</Link></main>;
  const items = works.filter((w) => cart.includes(w.id) && !sold[w.id]);
  const total = items.reduce((a, i) => a + Number(i.price_eth), 0);
  return (
    <main className="page narrow">
      <h2 className="big">Your collection</h2>
      {!items.length && <p className="dim">Nothing kept yet. <Link href="/gallery">Wander the archive</Link>.</p>}
      {items.map((i) => (
        <div className="row" key={i.id}>
          <img src={i.thumb_url} alt="" />
          <div><h3>{i.title}</h3><div className="dim">{i.place}</div></div>
          <div className="dim">{i.price_eth} ETH</div>
          <a href="#" onClick={(e) => { e.preventDefault(); remove(i.id); }}>Release</a>
        </div>
      ))}
      {!!items.length && <p className="total">Total {total.toFixed(3)} ETH &nbsp; <Link className="pill" href="/checkout">Proceed to settle</Link></p>}
    </main>
  );
}
