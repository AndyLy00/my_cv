import Image from "next/image";
import type { ProjectMeta } from "@/lib/content";

/** Fake browser window. Tall screenshots scroll inside it on hover (see .preview-scroll). */
export function BrowserFrame({
  project,
  height = 240,
  priority,
}: {
  project: ProjectMeta;
  height?: number;
  priority?: boolean;
}) {
  const host = project.live ? new URL(project.live).host : "github.com";

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_60px_-30px_rgb(0_0_0/0.35)]">
      <div className="flex items-center gap-2 border-b border-line bg-bg-2/60 px-3 py-2">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="mx-auto truncate rounded-md bg-surface px-3 py-0.5 font-mono text-[10px] text-muted">{host}</span>
      </div>
      <div className="relative overflow-hidden" style={{ height, ["--frame-h" as string]: `${height}px` }}>
        {project.image ? (
          <Image
            src={project.image}
            alt=""
            width={1200}
            height={2400}
            priority={priority}
            sizes="(max-width: 768px) 100vw, 560px"
            className="preview-scroll h-auto w-full"
          />
        ) : null}
      </div>
    </div>
  );
}

export function PhoneFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mx-auto w-[220px] rounded-[2.2rem] border-[6px] border-ink bg-ink p-1 shadow-2xl">
      <div className="absolute left-1/2 top-2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-ink" />
      <div className="overflow-hidden rounded-[1.7rem]">
        {/* Only rendered in the case-study header, i.e. always above the fold. */}
        <Image src={src} alt={alt} width={420} height={910} loading="eager" className="h-auto w-full" />
      </div>
    </div>
  );
}
