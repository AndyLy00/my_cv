"use client";

import { useOptimistic, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart } from "lucide-react";
import { toggleProjectLike } from "@/lib/actions";

type LikeState = { liked: boolean; count: number };

export function LikeButton({ slug, initial, label }: { slug: string; initial?: LikeState; label: string }) {
  const [state, setState] = useState<LikeState>(initial ?? { liked: false, count: 0 });
  const [optimistic, setOptimistic] = useOptimistic(state, (s: LikeState) => ({
    liked: !s.liked,
    count: s.count + (s.liked ? -1 : 1),
  }));
  const [, startTransition] = useTransition();
  const [burst, setBurst] = useState(0);

  const onClick = () => {
    if (!optimistic.liked) setBurst((b) => b + 1);
    startTransition(async () => {
      setOptimistic(state);
      try {
        setState(await toggleProjectLike(slug));
      } catch {}
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={optimistic.liked}
      aria-label={`${label} (${optimistic.count})`}
      className={`relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        optimistic.liked ? "border-brand-2/40 bg-brand-2/10 text-brand-2" : "border-line text-muted hover:text-brand-2"
      } ${initial ? "" : "opacity-70"}`}
    >
      <span className="relative">
        <motion.span key={String(optimistic.liked)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6 }} className="block">
          <Heart className={`size-3.5 ${optimistic.liked ? "fill-current" : ""}`} />
        </motion.span>
        <AnimatePresence>
          {burst > 0 && (
            <motion.span key={burst} className="pointer-events-none absolute inset-0" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.8 }}>
              {Array.from({ length: 6 }, (_, i) => (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-1/2 size-1 rounded-full bg-brand-2"
                  initial={{ x: 0, y: 0 }}
                  animate={{ x: Math.cos((i / 6) * Math.PI * 2) * 14, y: Math.sin((i / 6) * Math.PI * 2) * 14 }}
                  transition={{ duration: 0.5 }}
                />
              ))}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className="tabular-nums">{optimistic.count}</span>
    </button>
  );
}
