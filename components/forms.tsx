"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Loader2, Send } from "lucide-react";
import { sendMessage, signGuestbook, type FormState } from "@/lib/actions";
import type { Dictionary } from "@/lib/i18n/en";
import { confetti } from "./confetti";

const initial: FormState = { ok: false };

/** Hidden field that only bots fill in. */
function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

function useCelebrate(state: FormState, formRef: React.RefObject<HTMLFormElement | null>) {
  const last = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (state.ok && state.stamp && state.stamp !== last.current) {
      last.current = state.stamp;
      formRef.current?.reset();
      const r = formRef.current?.getBoundingClientRect();
      confetti(r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined);
    }
  }, [state, formRef]);
}

function Status({ state, errors, success }: { state: FormState; errors: Dictionary["errors"]; success: string }) {
  return (
    <div aria-live="polite" className="min-h-6 text-sm">
      <AnimatePresence mode="wait">
        {state.error ? (
          <motion.p key="e" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-rose-500">
            {errors[state.error]}
          </motion.p>
        ) : state.ok ? (
          <motion.p key="s" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Check className="size-4" /> {success}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function ContactForm({ dict, errors }: { dict: Dictionary["contact"]; errors: Dictionary["errors"] }) {
  const [state, action, pending] = useActionState(sendMessage, initial);
  const formRef = useRef<HTMLFormElement>(null);
  useCelebrate(state, formRef);
  const v = state.ok ? {} : (state.values ?? {});

  return (
    <form ref={formRef} action={action} className="card relative grid gap-4 p-6 sm:p-8" noValidate>
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          {dict.name} *
          <input name="name" required maxLength={80} autoComplete="name" defaultValue={v.name} className="field" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          {dict.email} *
          <input name="email" type="email" required maxLength={160} autoComplete="email" defaultValue={v.email} className="field" />
        </label>
      </div>
      <label className="grid gap-1.5 text-sm font-medium">
        {dict.subject}
        <input name="subject" maxLength={140} defaultValue={v.subject} className="field" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        {dict.message} *
        <textarea name="body" required rows={5} maxLength={4000} defaultValue={v.body} className="field resize-y" />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Status state={state} errors={errors} success={dict.success} />
        <button type="submit" disabled={pending} className="btn btn-primary group">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}
          {pending ? dict.sending : dict.submit}
        </button>
      </div>
    </form>
  );
}

const EMOJIS = ["✨", "💜", "🚀", "🌸", "👏", "☕", "🔥", "🌿"];

export function GuestbookForm({ dict, errors }: { dict: Dictionary["guestbook"]; errors: Dictionary["errors"] }) {
  const [state, action, pending] = useActionState(signGuestbook, initial);
  const [emoji, setEmoji] = useState("✨");
  const formRef = useRef<HTMLFormElement>(null);
  useCelebrate(state, formRef);
  const v = state.ok ? {} : (state.values ?? {});

  return (
    <form ref={formRef} action={action} className="card relative grid gap-4 p-6" noValidate>
      <Honeypot />
      <input type="hidden" name="emoji" value={emoji} />
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Emoji">
        {EMOJIS.map((e) => (
          <motion.button
            key={e}
            type="button"
            role="radio"
            aria-checked={emoji === e}
            whileTap={{ scale: 0.8 }}
            onClick={() => setEmoji(e)}
            className={`grid size-9 place-items-center rounded-full text-lg transition ${emoji === e ? "bg-brand/15 ring-2 ring-brand" : "hover:bg-bg-2"}`}
          >
            {e}
          </motion.button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required maxLength={60} placeholder={dict.name} aria-label={dict.name} defaultValue={v.name} className="field" />
        <input name="role" maxLength={80} placeholder={dict.role} aria-label={dict.role} defaultValue={v.role} className="field" />
      </div>
      <textarea name="message" required maxLength={280} rows={3} placeholder={dict.message} aria-label={dict.message} defaultValue={v.message} className="field resize-none" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Status state={state} errors={errors} success={dict.thanks} />
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <span>{emoji}</span>}
          {pending ? dict.sending : dict.submit}
        </button>
      </div>
    </form>
  );
}

export function CopyEmail({ email, label, done }: { email: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className="btn btn-ghost !py-2"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={String(copied)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="inline-flex items-center gap-2">
          {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
          {copied ? done : label}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
