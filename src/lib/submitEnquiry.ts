/**
 * Empowerwell Support Pty Ltd — Referral & Enquiry Submission Pipeline
 * 
 * Includes comprehensive client-side validation (Australian phone format, email, required fields),
 * a honeypot spam guard, an extensible POST stub targeting import.meta.env.PUBLIC_FORM_ENDPOINT,
 * and a guaranteed fallback generating a prefilled mailto link.
 */

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

export interface SubmissionResult {
  success: boolean;
  errors?: ValidationErrors;
  message?: string;
  mailtoUrl?: string;
}

/**
 * Validate Australian phone number format
 * Accepts local numbers: (02) 9831 0000, 0298310000, 0400000000, 0400 000 000, +61 400 000 000
 */
export function isValidAustralianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, "");
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
    errors.phone = "Please enter a valid Australian phone number (e.g., 0400 000 000 or (02) 9831 0000).";
  }

  if (!data.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Please enter a valid email address (e.g., name@example.com).";
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
 * Generates a prefilled mailto URL with enquiry parameters
 */
export function generateEnquiryMailto(data: EnquiryFormData): string {
  const recipient = "info@empowerwell.com.au";
  const subject = encodeURIComponent(`New NDIS Referral: ${data.fullName} (${data.serviceOfInterest || "General Enquiry"})`);
  
  const bodyText = [
    `NEW NDIS ENQUIRY / REFERRAL`,
    `----------------------------------------------------`,
    `Full Name: ${data.fullName}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email}`,
    `Relationship / Role: ${data.role}`,
    `Plan Management: ${data.planType}`,
    `Service of Interest: ${data.serviceOfInterest}`,
    `NDIS Number: ${data.ndisNumber || "Not provided / Exploring"}`,
    `Preferred Contact: ${data.preferredContact}`,
    ``,
    `Message / Needs:`,
    `${data.message}`,
    ``,
    `----------------------------------------------------`,
    `Consent: User agreed to privacy terms and contact authorisation.`,
    `Submitted from empowerwell.com.au`,
  ].join("\n");

  return `mailto:${recipient}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
}

/**
 * Submit Enquiry Handler
 * Validates, checks honeypot, attempts POST if endpoint provided, and returns fallback mailto
 */
export async function submitEnquiry(data: EnquiryFormData): Promise<SubmissionResult> {
  // 1. Check honeypot (silent bot trap)
  if (data.honeypot && data.honeypot.trim() !== "") {
    // Return fake success to bots without processing
    return { success: true, message: "Thank you for your referral." };
  }

  // 2. Validate fields
  const errors = validateEnquiryForm(data);
  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const mailtoUrl = generateEnquiryMailto(data);
  const endpoint = import.meta.env.PUBLIC_FORM_ENDPOINT || "";

  // 3. Optional POST to configured backend (Formspree, Resend, or Webhook)
  // TODO: Configure Formspree or Resend API key in .env when live backend is ready
  if (endpoint && endpoint.trim() !== "") {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          ...data,
          submittedAt: new Date().toISOString(),
          source: "Empowerwell Support Website",
        }),
      });

      if (response.ok) {
        return {
          success: true,
          message: "Thank you! Your referral has been received. Our team will contact you within 24 business hours.",
          mailtoUrl,
        };
      }
    } catch (err) {
      console.warn("Backend endpoint submission error, falling back to mailto", err);
    }
  }

  // 4. Default clean success with mailto draft fallback
  return {
    success: true,
    message: "Thank you! Your enquiry has been prepared. A confirmation draft will open in your email client, and our team will be in touch within 24 business hours.",
    mailtoUrl,
  };
}
