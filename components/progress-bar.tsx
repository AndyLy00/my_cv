"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

type ProgressBarProps = {
  value: number;
  delay?: number;
  className?: string;
  trackClassName?: string;
};

/**
 * A bar that fills the first time it scrolls into view. The track is what gets observed: the fill
 * starts at scaleX(0), and an element with no area may never be reported as visible.
 */
export function ProgressBar({ value, delay = 0, className, trackClassName }: ProgressBarProps) {
  const track = useRef<HTMLDivElement>(null);
  const inView = useInView(track, { once: true, margin: "-40px" });

  return (
    <div ref={track} className={trackClassName}>
      <motion.div
        className={`h-full origin-left ${className ?? ""}`}
        style={{ width: `${value}%` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: inView ? 1 : 0 }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
