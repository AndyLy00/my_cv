"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";

/** Counts from 0 to `to` the first time it becomes visible. Renders the final value on the server. */
export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, to, suffix]);

  return (
    <span ref={ref} className="tabular-nums">
      {to}
      {suffix}
    </span>
  );
}
