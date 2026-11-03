"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import { gallery } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n/en";

const layout = [
  { rotate: -5, x: "17%", y: 20 },
  { rotate: 4, x: "55%", y: 0 },
];

/** A wall of polaroids you can drag around; hovering restores the colour. */
export function Gallery({ dict }: { dict: Dictionary["gallery"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState<string | null>(null);

  return (
    <>
      {/* Desktop: free-form draggable wall */}
      <div ref={ref} className="relative mt-12 hidden h-[560px] md:block">
        {gallery.map((g, i) => (
          <motion.figure
            key={g.key}
            drag
            dragConstraints={ref}
            dragElastic={0.2}
            onPointerDown={() => setTop(g.key)}
            initial={{ opacity: 0, y: 80, rotate: 0 }}
            whileInView={{ opacity: 1, y: layout[i].y, rotate: layout[i].rotate }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.35, delay: i * 0.1 }}
            whileHover={{ scale: 1.04, rotate: 0 }}
            whileDrag={{ scale: 1.08, cursor: "grabbing" }}
            style={{ left: layout[i].x, zIndex: top === g.key ? 20 : 10 - i }}
            className="group absolute w-[28%] cursor-grab touch-none rounded-sm bg-white p-3 pb-12 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.45)]"
          >
            <Polaroid g={g} caption={dict.captions[g.key]} />
          </motion.figure>
        ))}
      </div>

      {/* Mobile: swipeable strip */}
      <div className="-mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 md:hidden">
        {gallery.map((g, i) => (
          <figure
            key={g.key}
            className="group relative w-[70%] shrink-0 snap-center rounded-sm bg-white p-3 pb-12 shadow-xl"
            style={{ rotate: `${layout[i].rotate / 2}deg` }}
          >
            <Polaroid g={g} caption={dict.captions[g.key]} />
          </figure>
        ))}
      </div>
    </>
  );
}

function Polaroid({ g, caption }: { g: (typeof gallery)[number]; caption: string }) {
  return (
    <>
      {/* Explicit sizes instead of `fill`: one of the two layouts is always display:none,
          and `fill` images inside a hidden parent trigger a zero-height warning. */}
      <div className="pointer-events-none relative aspect-[4/5] overflow-hidden bg-neutral-200">
        <Image src={`${g.src}-duo.webp`} alt="" width={900} height={1125} sizes="(max-width: 768px) 70vw, 340px" className="size-full object-cover" draggable={false} />
        <Image
          src={`${g.src}.webp`}
          alt={caption}
          width={900}
          height={1125}
          sizes="(max-width: 768px) 70vw, 340px"
          className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-active:opacity-100"
          draggable={false}
        />
      </div>
      <figcaption className="absolute inset-x-0 bottom-3 text-center font-serif text-lg italic text-neutral-700">{caption}</figcaption>
    </>
  );
}
