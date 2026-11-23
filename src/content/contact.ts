/**
 * The public business email (Zoho Mail, Australian data centre). It has its own module, free of
 * `import.meta.env`, so the server-side enquiry function (`api/enquiry.ts`) can import it too.
 * Never use empowerwell.com.au: that domain belongs to another company.
 */
export const BUSINESS_EMAIL = "info@empowerwellsupport.com.au";

/** Colours for the enquiry notification email (email clients can't use the site's CSS tokens). */
export const EMAIL_COLORS = {
  brand: "#00613A",
  text: "#1f2a24",
  muted: "#555555",
  border: "#e5e7eb",
  page: "#f6f8f7",
  card: "#ffffff",
};
