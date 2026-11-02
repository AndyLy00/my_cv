"use client";

import { useActionState } from "react";
import { Loader2, Lock } from "lucide-react";
import { adminLogin, type FormState } from "@/lib/actions";

export function AdminLogin({ labels }: { labels: { login: string; password: string; wrong: string } }) {
  const [state, action, pending] = useActionState<FormState, FormData>(adminLogin, { ok: false });
  return (
    <form action={action} className="card mx-auto grid max-w-sm gap-4 p-8">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand">
        <Lock className="size-5" />
      </span>
      <label className="grid gap-1.5 text-sm font-medium">
        {labels.password}
        <input type="password" name="password" required autoComplete="current-password" className="field" autoFocus />
      </label>
      {state.error && <p className="text-sm text-rose-500" role="alert">{labels.wrong}</p>}
      <button className="btn btn-primary" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} {labels.login}
      </button>
    </form>
  );
}
