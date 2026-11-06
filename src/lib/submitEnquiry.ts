/**
 * Empowerwell Support Pty Ltd — Referral & Enquiry Submission Pipeline
 * 
 * Includes comprehensive client-side validation (Australian phone format, email, required fields),
 * a honeypot spam guard, an extensible POST stub targeting import.meta.env.PUBLIC_FORM_ENDPOINT,
 * and a guaranteed fallback generating a prefilled mailto link.
 */

import { FORM_EXAMPLES } from "../content/forms";

/** Value used for the "feedback or complaint" choice (also selected by /contact?service=feedback). */
export const FEEDBACK_OPTION = "Feedback or a complaint";

/** Longest message accepted; keeps the mailto fallback under common 2,000-character URL limits. */
export const MESSAGE_MAX_LENGTH = 1200;

const ROLE_LABELS: Record<string, string> = {
  participant: "NDIS participant (for myself)",
  carer_family: "Family member or carer",
  support_coordinator: "Support coordinator or LAC",
  other: "Health professional, advocate or other",
};

const PLAN_LABELS: Record<string, string> = {
  plan: "Plan-managed",
  self: "Self-managed",
  ndia: "Agency-managed (NDIA)",
  exploring: "Not sure / still applying",
};

export interface EnquiryFormData {
  fullName: string;
  phone: string;
  email: string;
  role: "participant" | "carer_family" | "support_coordinator" | "other" | "";
  planType: "self" | "plan" | "ndia" | "exploring" | "";
  serviceOfInterest: string;
  ndisNumber?: string;
  preferredContact: "phone" | "email" | "either";
  message: string;
  consent: boolean;
  honeypot?: string; // Bot trap: must be empty
}

export interface ValidationErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  role?: string;
  planType?: string;
  serviceOfInterest?: string;
  message?: string;
  consent?: string;
  general?: string;
}

/**
 * delivery:
 *  - "sent":   the configured endpoint accepted the enquiry (HTTP 2xx).
 *  - "mailto": nothing was sent; the user must send the pre-filled email themselves.
 *  - "ignored": honeypot tripped; bots get a neutral response and nothing is sent.
 */
export interface SubmissionResult {
  success: boolean;
  delivery?: "sent" | "mailto" | "ignored";
  errors?: ValidationErrors;
  message?: string;
  mailtoUrl?: string;
}

export interface SubmitOptions {
  /** Inbox that receives the mailto fallback (SITE.email). */
  recipient: string;
  /** POST endpoint (SITE.formEndpoint). Empty string disables the POST. */
  endpoint: string;
  /** Abort the POST after this many milliseconds. */
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

/**
 * Validate Australian phone number format
 * Accepts mobiles (04xx xxx xxx), landlines ((02) xxxx xxxx), +61 formats and 1300/1800 numbers.
 */
export function isValidAustralianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().]/g, "");
  // Australian mobile (04...) or landline (02, 03, 07, 08) or 1300/1800 or international +61
  const ausPhoneRegex = /^(?:\+?61|0)[2-478](?:[0-9]{8})$|^(?:1300|1800)[0-9]{6}$/;
  return ausPhoneRegex.test(cleaned);
}

/**
 * Validate standard email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate form input data
 */
export function validateEnquiryForm(data: EnquiryFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.fullName.trim()) {
    errors.fullName = "Please enter your full name.";
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = "Name must be at least 2 characters long.";
  }

  if (!data.phone.trim()) {
    errors.phone = "Please enter your contact phone number.";
  } else if (!isValidAustralianPhone(data.phone)) {
    errors.phone = `Please enter a valid Australian phone number (e.g. ${FORM_EXAMPLES.mobile} or ${FORM_EXAMPLES.landline}).`;
  }

  if (!data.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!isValidEmail(data.email)) {
    errors.email = `Please enter a valid email address (e.g. ${FORM_EXAMPLES.email}).`;
  }

  if (!data.role) {
    errors.role = "Please select who you are completing this form for.";
  }

  if (!data.planType && data.serviceOfInterest !== FEEDBACK_OPTION) {
    errors.planType = "Please select how your NDIS plan is managed.";
  }

  if (!data.serviceOfInterest) {
    errors.serviceOfInterest = "Please choose the primary service you are interested in.";
  }

  if (!data.message.trim()) {
    errors.message = "Please write a brief message or describe how we can assist you.";
  } else if (data.message.trim().length < 10) {
    errors.message = "Please provide a few more details (minimum 10 characters).";
  } else if (data.message.length > MESSAGE_MAX_LENGTH) {
    errors.message = `Please keep your message under ${MESSAGE_MAX_LENGTH} characters, or call us.`;
  }

  if (!data.consent) {
    errors.consent = "You must agree to allow Empowerwell Support to contact you regarding this enquiry.";
  }

  return errors;
}

/**
 * Builds a pre-filled mailto URL for the enquiry (used when no endpoint is configured or it fails).
 */
/** Many mail apps (notably on Windows) truncate or reject mailto links much longer than this. */
const MAILTO_MAX_LENGTH = 1900;
const SHORTENED_NOTE = "… [shortened: please add the rest of your message in the email]";

export function generateEnquiryMailto(data: EnquiryFormData, recipient: string): string {
  const subject = encodeURIComponent(`New NDIS enquiry: ${data.fullName} (${data.serviceOfInterest || "General enquiry"})`);

  const build = (message: string) =>
    [
      "NEW NDIS ENQUIRY",
      "--------------------------------",
      `Name: ${data.fullName}`,
      `Phone: ${data.phone}`,
      `Email: ${data.email}`,
      `I am: ${ROLE_LABELS[data.role] ?? data.role}`,
      `Plan management: ${PLAN_LABELS[data.planType] ?? (data.planType || "Not given")}`,
      `Service: ${data.serviceOfInterest}`,
      `NDIS number: ${data.ndisNumber || "Not given"}`,
      `Contact me by: ${data.preferredContact}`,
      "",
      "Message:",
      message,
      "",
      "--------------------------------",
      "The sender agreed to the privacy notice and to be contacted about this enquiry.",
    ].join("\n");

  const toUrl = (message: string) => `mailto:${recipient}?subject=${subject}&body=${encodeURIComponent(build(message))}`;

  const full = toUrl(data.message);
  if (full.length <= MAILTO_MAX_LENGTH) return full;

  // Keep as much of the message as fits (URL encoding inflates characters, so measure the encoded URL).
  let lo = 0;
  let hi = data.message.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (toUrl(data.message.slice(0, mid) + SHORTENED_NOTE).length <= MAILTO_MAX_LENGTH) lo = mid;
    else hi = mid - 1;
  }
  return toUrl(data.message.slice(0, lo) + SHORTENED_NOTE);
}

/**
 * Validates, checks the honeypot, POSTs to the endpoint when configured, and otherwise (or on any
 * failure) returns a mailto fallback. Never reports "sent" unless the endpoint returned 2xx.
 */
export async function submitEnquiry(data: EnquiryFormData, options: SubmitOptions): Promise<SubmissionResult> {
  const { recipient, endpoint, timeoutMs = 10_000, fetchImpl = fetch } = options;

  if (data.honeypot && data.honeypot.trim() !== "") {
    return { success: true, delivery: "ignored", message: "Thank you for your enquiry." };
  }

  const errors = validateEnquiryForm(data);
  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const mailtoUrl = generateEnquiryMailto(data, recipient);
  const mailtoResult: SubmissionResult = {
    success: true,
    delivery: "mailto",
    mailtoUrl,
    message: `Your enquiry is ready but has not been sent yet. Open the pre-filled email and press send, or email ${recipient} directly.`,
  };

  if (!endpoint.trim()) return mailtoResult;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { honeypot, ...payload } = data;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...payload, submittedAt: new Date().toISOString(), source: "Empowerwell Support website" }),
      signal: controller.signal,
    });
    if (response.ok) {
      return {
        success: true,
        delivery: "sent",
        mailtoUrl,
        message: "Thank you. Your enquiry has been received and our team will contact you soon.",
      };
    }
    return {
      ...mailtoResult,
      message: `We could not send your enquiry online (error ${response.status}). Please open the pre-filled email and press send, or call us.`,
    };
  } catch {
    return {
      ...mailtoResult,
      message: "We could not reach our enquiry service. Please open the pre-filled email and press send, or call us.",
    };
  } finally {
    clearTimeout(timer);
  }
}
