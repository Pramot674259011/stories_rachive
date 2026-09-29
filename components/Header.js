"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "./Providers";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, cart, signOut } = useApp();
  useEffect(() => {
    const k = (e) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, []);
  return (
    <>
      <header className={"chrome " + (open ? "open" : "")}>
        <Link className="wordmark" href="/" aria-label="StoriesRachive">Stories<em>Rachive</em></Link>
        <button className="menu-btn" aria-expanded={open} aria-controls="menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          <span className="menu-label">Menu</span>
          <span className="bars"><i /><i /></span>
        </button>
      </header>
      <div id="menu" className={open ? "open" : ""}>
        <nav onClick={() => setOpen(false)}>
          <Link href="/">Home</Link>
          <Link href="/gallery">The Archive</Link>
          <Link href="/collection">My Collection{cart.length ? ` (${cart.length})` : ""}</Link>
          {user ? <a href="#" onClick={(e) => { e.preventDefault(); signOut(); }}>Sign out</a> : <Link href="/login">Sign in</Link>}
        </nav>
        <div className="addr">Nairobi · Cape Town · Reykjavík<br />studio@ethanvale.photo</div>
      </div>
    </>
  );
}
