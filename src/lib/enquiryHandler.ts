/**
 * Server side of the enquiry form: checks a submission and emails it to the business inbox.
 *
 * Runs in the Vercel function `api/enquiry.ts`, which sends through Zoho Mail (Australian data
 * centre), so participant details go only to Empowerwell's own mailbox, never to a third party.
 *
 * Kept free of nodemailer and of `import.meta.env` so it can be unit-tested with a fake sender.
 * Relative imports carry `.js` because Vercel runs this file as a native ES module.
 *
 * Privacy: never log names, contact details or message text. Errors are logged by code only.
 */
import { BUSINESS_EMAIL, EMAIL_COLORS as C } from "../content/contact.js";
import {
  FEEDBACK_OPTION,
  MESSAGE_MAX_LENGTH,
  PLAN_LABELS,
  ROLE_LABELS,
  validateEnquiryForm,
  type EnquiryFormData,
} from "./submitEnquiry.js";

/** Largest request body accepted, in bytes (a full form is about 2 kB). */
export const MAX_BODY_BYTES = 16_000;
/** Submissions allowed per IP address in RATE_WINDOW_MS (per function instance). */
export const RATE_LIMIT = 5;
export const RATE_WINDOW_MS = 10 * 60 * 1000;

const ROLES = ["participant", "carer_family", "support_coordinator", "other"] as const;
const PLANS = ["self", "plan", "ndia", "exploring"] as const;
const CONTACT_METHODS = ["phone", "email", "either"] as const;

export interface OutgoingEmail {
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}

export interface HandlerDeps {
  /** Sends one email; throws on failure. */
  send: (email: OutgoingEmail) => Promise<void>;
  /** True when SMTP credentials are configured. */
  configured: boolean;
  /** Inbox that receives enquiries. Defaults to the business email. */
  to?: string;
  /** Sender address (must be the Zoho mailbox or one of its aliases). Defaults to the business email. */
  from?: string;
  now?: () => Date;
  /** Shared rate-limit store; a fresh Map disables carry-over (used in tests). */
  rateStore?: Map<string, number[]>;
}

const defaultRateStore = new Map<string, number[]>();

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

const str = (value: unknown, max: number): string => (typeof value === "string" ? value.trim().slice(0, max) : "");
const oneOf = <T extends string>(value: unknown, allowed: readonly T[]): T | "" =>
  typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : "";

/** Turns an untrusted JSON body into form data, dropping unknown fields and capping lengths. */
export function parseEnquiry(body: unknown): EnquiryFormData | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;
  return {
    fullName: str(b.fullName, 120),
    phone: str(b.phone, 40),
    email: str(b.email, 200),
    role: oneOf(b.role, ROLES),
    planType: oneOf(b.planType, PLANS),
    serviceOfInterest: str(b.serviceOfInterest, 120),
    ndisNumber: str(b.ndisNumber, 20),
    preferredContact: oneOf(b.preferredContact, CONTACT_METHODS) || "either",
    // Keep one character over the limit so validation reports "too long" instead of silently cutting.
    message: typeof b.message === "string" ? b.message.trim().slice(0, MESSAGE_MAX_LENGTH + 1) : "",
    consent: b.consent === true,
    honeypot: str(b.honeypot, 200),
  };
}

const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
/** Header values must never contain line breaks (header injection). */
const oneLine = (value: string): string => value.replace(/[\r\n]+/g, " ").trim();

const CONTACT_LABELS: Record<string, string> = { phone: "Phone", email: "Email", either: "Phone or email" };

/** Builds the email the Empowerwell team receives for one enquiry. */
export function buildEnquiryEmail(data: EnquiryFormData, opts: { to: string; from: string; receivedAt: Date }): OutgoingEmail {
  const isFeedback = data.serviceOfInterest === FEEDBACK_OPTION;
  const received = opts.receivedAt.toLocaleString("en-AU", { timeZone: "Australia/Sydney", dateStyle: "full", timeStyle: "short" });
  const rows: [string, string][] = [
    ["Name", data.fullName],
    ["Phone", data.phone],
    ["Email", data.email],
    ["I am", ROLE_LABELS[data.role] ?? data.role],
    ["Plan management", PLAN_LABELS[data.planType] ?? (data.planType || "Not given")],
    ["Service", data.serviceOfInterest],
    ["NDIS number", data.ndisNumber || "Not given"],
    ["Contact me by", CONTACT_LABELS[data.preferredContact] ?? data.preferredContact],
    ["Received", received],
  ];

  const subject = oneLine(
    `${isFeedback ? "Website feedback" : "New website enquiry"}: ${data.fullName} (${data.serviceOfInterest || "General enquiry"})`,
  );

  const text = [
    isFeedback ? "FEEDBACK OR COMPLAINT FROM THE WEBSITE" : "NEW ENQUIRY FROM THE WEBSITE",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Message:",
    data.message,
    "",
    "---",
    "The sender agreed to the privacy notice and to be contacted about this enquiry.",
    "Reply to this email to answer them directly.",
  ].join("\n");

  const td = "padding:6px 12px;border-bottom:1px solid ${C.border};vertical-align:top;";
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:${C.page};font-family:Arial,Helvetica,sans-serif;color:${C.text};">
<div style="max-width:640px;margin:0 auto;background:${C.card};border-radius:12px;border-top:6px solid ${C.brand};padding:24px;">
<h1 style="margin:0 0 4px;font-size:20px;color:${C.brand};">${isFeedback ? "Feedback or complaint" : "New enquiry"} from the website</h1>
<p style="margin:0 0 16px;font-size:14px;color:${C.muted};">${escapeHtml(received)}</p>
<table style="width:100%;border-collapse:collapse;font-size:15px;">
${rows
  .slice(0, -1)
  .map(([k, v]) => `<tr><th style="${td}text-align:left;width:38%;color:${C.muted};font-weight:normal;">${escapeHtml(k)}</th><td style="${td}font-weight:bold;">${escapeHtml(v)}</td></tr>`)
  .join("\n")}
</table>
<h2 style="margin:20px 0 8px;font-size:16px;color:${C.brand};">Message</h2>
<p style="margin:0;font-size:15px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
<p style="margin:24px 0 0;font-size:13px;color:${C.muted};">The sender agreed to the privacy notice and to be contacted about this enquiry. Reply to this email to answer them directly.</p>
</div></body></html>`;

  return {
    to: opts.to,
    from: opts.from,
    replyTo: oneLine(data.email),
    subject,
    text,
    html,
  };
}

function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function rateLimited(store: Map<string, number[]>, ip: string, now: number): boolean {
  const recent = (store.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    store.set(ip, recent);
    return true;
  }
  recent.push(now);
  store.set(ip, recent);
  if (store.size > 5000) store.clear(); // keep memory bounded on long-lived instances
  return false;
}

/** Handles POST /api/enquiry. Responds 200 only when the email was handed to Zoho. */
export async function handleEnquiry(request: Request, deps: HandlerDeps): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }

  // Same-origin only: browsers always send Origin on a cross-site POST.
  const origin = request.headers.get("origin");
  if (origin) {
    let originHost = "";
    try {
      originHost = new URL(origin).host;
    } catch {
      /* invalid origin falls through to the 403 */
    }
    if (originHost !== new URL(request.url).host) return json(403, { ok: false, error: "forbidden" });
  }

  if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    return json(415, { ok: false, error: "unsupported_media_type" });
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json(413, { ok: false, error: "too_large" });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  const data = parseEnquiry(body);
  if (!data) return json(400, { ok: false, error: "invalid_body" });

  // Bots fill the hidden field: answer as if it worked, send nothing.
  if (data.honeypot) return json(200, { ok: true });

  const errors = validateEnquiryForm(data);
  if (Object.keys(errors).length > 0) return json(422, { ok: false, error: "invalid", errors });

  const now = (deps.now ?? (() => new Date()))();
  if (rateLimited(deps.rateStore ?? defaultRateStore, clientIp(request), now.getTime())) {
    return json(429, { ok: false, error: "rate_limited" });
  }

  if (!deps.configured) {
    console.error("enquiry: SMTP is not configured (ZOHO_SMTP_USER / ZOHO_SMTP_PASSWORD)");
    return json(503, { ok: false, error: "not_configured" });
  }

  const email = buildEnquiryEmail(data, { to: deps.to || BUSINESS_EMAIL, from: deps.from || BUSINESS_EMAIL, receivedAt: now });
  try {
    await deps.send(email);
  } catch (error) {
    const code = (error as { code?: string; responseCode?: number })?.code ?? (error as { responseCode?: number })?.responseCode;
    console.error("enquiry: sending failed", code ?? "unknown");
    return json(502, { ok: false, error: "send_failed" });
  }
  return json(200, { ok: true });
}
