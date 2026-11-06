/**
 * Empowerwell Support Pty Ltd — Referral & Enquiry Submission Pipeline
 * 
 * Includes comprehensive client-side validation (Australian phone format, email, required fields),
 * a honeypot spam guard, an extensible POST stub targeting import.meta.env.PUBLIC_FORM_ENDPOINT,
 * and a guaranteed fallback generating a prefilled mailto link.
 */

import { FORM_EXAMPLES } from "../content/forms";

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

  if (!data.planType) {
    errors.planType = "Please select how your NDIS plan is managed.";
  }

  if (!data.serviceOfInterest) {
    errors.serviceOfInterest = "Please choose the primary service you are interested in.";
  }

  if (!data.message.trim()) {
    errors.message = "Please write a brief message or describe how we can assist you.";
  } else if (data.message.trim().length < 10) {
    errors.message = "Please provide a few more details (minimum 10 characters).";
  }

  if (!data.consent) {
    errors.consent = "You must agree to allow Empowerwell Support to contact you regarding this enquiry.";
  }

  return errors;
}

/**
 * Builds a pre-filled mailto URL for the enquiry (used when no endpoint is configured or it fails).
 */
export function generateEnquiryMailto(data: EnquiryFormData, recipient: string): string {
  const subject = encodeURIComponent(`New NDIS Referral: ${data.fullName} (${data.serviceOfInterest || "General Enquiry"})`);

  const bodyText = [
    "NEW NDIS ENQUIRY / REFERRAL",
    "----------------------------------------------------",
    `Full Name: ${data.fullName}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email}`,
    `Relationship / Role: ${data.role}`,
    `Plan Management: ${data.planType}`,
    `Service of Interest: ${data.serviceOfInterest}`,
    `NDIS Number: ${data.ndisNumber || "Not provided / Exploring"}`,
    `Preferred Contact: ${data.preferredContact}`,
    "",
    "Message / Needs:",
    data.message,
    "",
    "----------------------------------------------------",
    "Consent: the sender agreed to the privacy notice and to be contacted about this enquiry.",
  ].join("\n");

  return `mailto:${recipient}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
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
