/** Tiny dependency-free confetti burst rendered on a throwaway canvas. */
export function confetti(origin?: { x: number; y: number }) {
  if (typeof window === "undefined" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  const dpr = Math.min(devicePixelRatio, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "100" });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  const colors = ["#6d4aff", "#ff5fa8", "#22b8f0", "#ffd166", "#06d6a0"];
  const ox = origin?.x ?? innerWidth / 2;
  const oy = origin?.y ?? innerHeight / 2;
  const parts = Array.from({ length: 140 }, () => {
    const a = Math.random() * Math.PI * 2;
    const v = 4 + Math.random() * 9;
    return {
      x: ox, y: oy,
      vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6,
      r: 3 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      c: colors[(Math.random() * colors.length) | 0], life: 0,
    };
  });

  let frame = 0;
  const tick = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.28;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life++;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p.life / 140);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      ctx.restore();
    }
    if (++frame < 150) requestAnimationFrame(tick);
    else canvas.remove();
  };
  requestAnimationFrame(tick);
}
