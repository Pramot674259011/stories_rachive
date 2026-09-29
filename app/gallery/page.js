"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/Providers";

export default function Gallery() {
  const { works, sold, user, cart, add, remove } = useApp();
  const [open, setOpen] = useState(null);

  const fitFrameToImage = (image) => {
    if (!image.naturalWidth || !image.naturalHeight) return;
    const frame = image.parentElement;
    frame.style.aspectRatio = `${image.naturalWidth} / ${image.naturalHeight}`;
    const plate = frame.closest(".plate");
    if (plate && innerWidth > 640) {
      const ratio = image.naturalWidth / image.naturalHeight;
      const maxWidth = innerWidth <= 900
        ? Math.min(innerWidth * 0.92, (innerHeight - 220) * ratio)
        : Math.min(innerWidth * 0.72, 860, (innerHeight - 230) * ratio);
      plate.style.width = `${Math.max(1, maxWidth)}px`;
    }
  };

  useEffect(() => {
    document.querySelectorAll(".rows img, .shot img").forEach((image) => {
      if (image.complete) fitFrameToImage(image);
    });
  }, [works, open]);

  useEffect(() => { const id = Number(location.hash.slice(1)); if (id) setOpen(id); }, []);
  useEffect(() => {
    const k = (e) => e.key === "Escape" && setOpen(null);
    addEventListener("keydown", k);
    document.body.style.overflow = open ? "hidden" : "";
    return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open]);

  const w = works.find((x) => x.id === open);
  const buyer = w && sold[w.id];
  const held = w && cart.includes(w.id);
  return (
    <main className="page">
      <div className="rows">
        {works.map((x) => (
          <figure key={x.id} onClick={() => setOpen(x.id)}>
            <img src={x.thumb_url} alt={x.title} loading="lazy" onLoad={(event) => fitFrameToImage(event.currentTarget)} />
            <figcaption>{x.title}</figcaption>
          </figure>
        ))}
      </div>
      {w && (
        <div className="lit">
          <div className="scrim" onClick={() => setOpen(null)} />
          <div className="plate">
            <div className="shot">
              <img src={w.image_url} alt={w.title} onLoad={(event) => fitFrameToImage(event.currentTarget)} />
              <button className="close" onClick={() => setOpen(null)}>Close</button>
            </div>
            <div className="meta">
              <div><h2>{w.title}</h2><div className="where">{w.place}</div></div>
              <div>
                <p className="note">{w.note}</p>
                <p className="hold">
                  {buyer ? <span className="dim">Held privately · {buyer.slice(0, 6)}…{buyer.slice(-4)}</span>
                    : !user ? <Link href="/login">Sign in to keep this work</Link>
                    : held ? <><span className="dim">In your collection · </span><a href="#" onClick={(e) => { e.preventDefault(); remove(w.id); }}>Release</a> · <Link href="/collection">View</Link></>
                    : <a href="#" onClick={(e) => { e.preventDefault(); add(w.id); }}>Keep in my collection</a>}
                  <span className="dim"> &nbsp; {w.price_eth} ETH</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
