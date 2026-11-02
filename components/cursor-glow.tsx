"use client";

import { useEffect, useRef } from "react";

/** A soft spotlight that trails the pointer on devices with a fine pointer. */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let x = innerWidth / 2;
    let y = innerHeight / 3;
    let cx = x;
    let cy = y;
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.style.opacity = "1";
    };
    const loop = () => {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      el.style.transform = `translate3d(${cx - 300}px, ${cy - 300}px, 0)`;
      frame = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-0 size-[600px] rounded-full opacity-0 transition-opacity duration-700"
      style={{ background: "radial-gradient(circle, var(--glow), transparent 65%)" }}
    />
  );
}
