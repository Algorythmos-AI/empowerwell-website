/**
 * Per-page SEO metadata. Titles stay under ~60 characters and descriptions between 110 and 160,
 * so search results are not truncated. scripts/verify-dist.mjs checks each value is unique.
 */
export interface PageMeta {
  title: string;
  description: string;
}

export const PAGES = {
  home: {
    title: "Empowerwell Support · Registered NDIS Provider, Sydney",
    description:
      "Registered NDIS provider in Dharruk NSW. Person-centred SIL, personal care and community support across Greater Sydney and regional NSW.",
  },
  about: {
    title: "About Us · Empowerwell Support",
    description:
      "Meet Empowerwell Support Pty Ltd: our story, mission, vision and values, and our directors Aiwen Kuel and Lual Chol.",
  },
  services: {
    title: "Our NDIS Services · Empowerwell Support",
    description:
      "The 11 NDIS supports we are registered for, including Supported Independent Living, personal care, community participation and life skills.",
  },
  whoWeSupport: {
    title: "Who We Support · Empowerwell Support",
    description:
      "Support for autistic people, people with intellectual disability and NDIS participants who are getting older, on any plan type.",
  },
  ndisInfo: {
    title: "NDIS FAQs · Empowerwell Support",
    description:
      "Plain-English answers about the NDIS: plan management types, choosing a provider, and how our intake process works.",
  },
  contact: {
    title: "Contact Us & Make a Referral · Empowerwell Support",
    description:
      "Call, email or send an NDIS referral to Empowerwell Support. We support participants across Greater Sydney and regional NSW.",
  },
  privacy: {
    title: "Privacy Policy · Empowerwell Support",
    description:
      "How Empowerwell Support collects, stores and protects personal and health information under the Privacy Act 1988 and the APPs.",
  },
  feedback: {
    title: "Feedback & Complaints · Empowerwell Support",
    description:
      "How to give feedback or make a complaint to Empowerwell Support or the NDIS Quality and Safeguards Commission, plus free advocacy and help lines.",
  },
  notFound: {
    title: "Page Not Found · Empowerwell Support",
    description:
      "The page you were looking for could not be found. Return to the Empowerwell Support homepage or browse our NDIS services.",
  },
} satisfies Record<string, PageMeta>;
