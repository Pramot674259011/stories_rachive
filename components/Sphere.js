"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "./Providers";

export default function Sphere() {
  const stageRef = useRef(), worldRef = useRef(), orbRef = useRef(), headRef = useRef();
  const router = useRouter();
  const { works } = useApp();

  useEffect(() => {
    const stage = stageRef.current, world = worldRef.current, head = headRef.current;
    const cards = [...orbRef.current.children];
    const N = works.length, GA = Math.PI * (3 - Math.sqrt(5));
    const pts = works.map((_, i) => {
      const y = 1 - (N > 1 ? i / (N - 1) : .5) * 2, rad = Math.sqrt(Math.max(0, 1 - y * y)), th = i * GA;
      return { x: Math.cos(th) * rad, y, z: Math.sin(th) * rad };
    });
    let R = 300, persp = 1150, W = innerWidth, H = innerHeight;
    const layout = () => {
      W = innerWidth; H = innerHeight;
      const hr = W <= 380 ? .38 : W <= 640 ? .42 : .46, wr = W <= 380 ? .48 : W <= 640 ? .52 : .58, fl = W <= 380 ? 108 : W <= 640 ? 120 : 155;
      R = Math.max(fl, Math.min(480, H * hr, W * wr));
      const cw = Math.round(Math.max(72, R * (W <= 380 ? .44 : W <= 640 ? .46 : .47)));
      persp = W <= 380 ? 620 : W <= 640 ? 760 : W <= 900 ? 920 : 1150;
      stage.style.perspective = persp + "px";
      cards.forEach((c, i) => {
        const p = pts[i], tall = works[i].tall;
        const image = c.querySelector("img");
        const ratio = image?.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : tall ? .8 : 1.5;
        const cardHeight = cw / ratio;
        const lat = Math.asin(p.y) * 180 / Math.PI, lon = Math.atan2(p.x, p.z) * 180 / Math.PI;
        c.style.width = cw + "px";
        c.style.height = cardHeight + "px";
        c.style.marginLeft = -cw / 2 + "px";
        c.style.marginTop = -cardHeight / 2 + "px";
        c.style.transform = `translate3d(${p.x * R}px,${-p.y * R}px,${p.z * R}px) rotateY(${lon}deg) rotateX(${lat}deg)`;
      });
    };
    const imageListeners = [];
    cards.forEach((card) => {
      const image = card.querySelector("img");
      if (image && !image.complete) {
        image.addEventListener("load", layout);
        imageListeners.push(image);
      }
    });
    layout();

    let tilt = -4, dragX = 0, dragY = 0, velX = 0, velY = 0, dragging = false, moved = 0, lx = 0, ly = 0, downCard = null, raf;
    const D = Math.PI / 180;
    const frame = () => {
      if (!dragging) {
        dragX += velX; dragY += velY; velX *= .94; velY *= .94;
        if (Math.abs(velX) < .002) velX = 0; if (Math.abs(velY) < .002) velY = 0;
      }
      dragY = Math.max(-32 - tilt, Math.min(32 - tilt, dragY));
      const sx = tilt + dragY, sy = dragX;
      world.style.transform = `translateZ(0px) rotateY(${sy}deg) rotateX(${sx}deg)`;
      head.style.transform = `rotateX(${-sx}deg) rotateY(${-sy}deg) translateZ(${R * .62}px)`;
      cards.forEach((c, i) => {
        const p = pts[i], Y = -p.y;
        const y1 = Y * Math.cos(sx * D) - p.z * Math.sin(sx * D), z1 = Y * Math.sin(sx * D) + p.z * Math.cos(sx * D);
        const zf = -p.x * Math.sin(sy * D) + z1 * Math.cos(sy * D);
        const base = .14 + .86 * Math.pow((zf + 1) / 2, .85);
        const d = (1 - base).toFixed(3);
        if (c._d !== d) { c.style.setProperty("--d", d); c._d = d; }
        const near = persp * .66, absZ = zf * R;
        const fade = absZ > near ? Math.max(0, 1 - (absZ - near) / 190) : 1;
        if (c._f !== fade) { c.style.opacity = fade; c._f = fade; }
      });
      raf = requestAnimationFrame(frame);
    };
    frame();

    const down = (e) => {
      dragging = true; moved = 0; lx = e.clientX; ly = e.clientY; velX = velY = 0;
      downCard = e.target.closest?.(".card") || null;
      stage.setPointerCapture(e.pointerId);
    };
    const move = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      dragX += dx * .13; dragY -= dy * .13; velX = dx * .13; velY = -dy * .13;
    };
    const up = (e) => {
      if (!dragging) return; dragging = false;
      const slop = e.pointerType === "mouse" ? 6 : 14;
      if (moved < slop && downCard) router.push("/gallery#" + downCard.dataset.id);
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
    let t; const rs = () => { clearTimeout(t); t = setTimeout(layout, 120); };
    addEventListener("resize", rs);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", rs);
      imageListeners.forEach((image) => image.removeEventListener("load", layout));
    };
  }, [router, works]);

  const words = ["I", "See", "Through", "the", "Wild"];
  return (
    <div id="stage" ref={stageRef}>
      <div id="world" ref={worldRef}>
        <div id="orb" ref={orbRef}>
          {works.map((w) => (
            <div key={w.id} className={"card" + (w.tall ? " tall" : "")} data-id={w.id}>
              <figure><img src={w.thumb_url} alt={w.title} draggable={false} /></figure>
            </div>
          ))}
        </div>
        <h1 id="headline" ref={headRef}>
          <span className="inner">
            {words.map((w, i) => (<span key={i} className="w" style={{ "--i": i }}>{w}{" "}</span>))}
          </span>
        </h1>
      </div>
      <div className="vig" />
      <p className="cue"><s />Drag to rotate · tap a photo to enter</p>
    </div>
  );
}
