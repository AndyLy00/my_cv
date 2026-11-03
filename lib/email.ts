import "server-only";
import { profile } from "./content";

type Alert = { subject: string; text: string; replyTo?: string };

/**
 * Sends the site owner an email through Resend. Submissions are saved before this runs, and it
 * never throws, so a mail problem can't fail a form. Does nothing unless RESEND_API_KEY is set.
 * The default sender works without a verified domain; set ALERT_EMAIL_FROM once you have one.
 */
async function sendAlert({ subject, text, replyTo }: Alert) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.ALERT_EMAIL_FROM ?? "CV website <onboarding@resend.dev>",
        to: process.env.ALERT_EMAIL_TO ?? profile.email,
        subject,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("Email alert rejected", res.status, await res.text());
  } catch (e) {
    console.error("Email alert failed", e);
  }
}

const adminUrl = () => `${profile.siteUrl}/en/admin`;
const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();

export function alertNewMessage(m: { name: string; email: string; subject: string; body: string }) {
  return sendAlert({
    subject: oneLine(`New message from ${m.name}${m.subject ? `: ${m.subject}` : ""}`),
    replyTo: m.email,
    text: [`From: ${m.name} <${m.email}>`, ...(m.subject ? [`Subject: ${m.subject}`] : []), "", m.body, "", `Admin: ${adminUrl()}`].join("\n"),
  });
}

export function alertNewNote(n: { name: string; role: string; message: string }) {
  return sendAlert({
    subject: oneLine(`New guestbook note from ${n.name}`),
    text: [`From: ${n.name}${n.role ? ` (${n.role})` : ""}`, "", n.message, "", `Hidden until you approve it: ${adminUrl()}`].join("\n"),
  });
}
