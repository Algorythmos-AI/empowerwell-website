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
    title: "Empowerwell Support · NDIS Provider in Western Sydney",
    description:
      "Registered NDIS provider in Western Sydney offering person-centred disability support, SIL, personal care and community participation.",
  },
  about: {
    title: "About Us · Empowerwell Support",
    description:
      "Meet Empowerwell Support Pty Ltd: our story, mission, vision and values, and our directors Aiwen Kuel and Lual Chol.",
  },
  services: {
    title: "Our NDIS Services · Empowerwell Support",
    description:
      "Our 11 registered NDIS supports, including Supported Independent Living, personal care, community participation and life skills.",
  },
  whoWeSupport: {
    title: "Who We Support · Empowerwell Support",
    description:
      "Person-centred care for people living with autism, intellectual disability, ageing-related needs and complex support needs.",
  },
  ndisInfo: {
    title: "NDIS Guide & FAQs · Empowerwell Support",
    description:
      "Plain-English answers about the NDIS: plan management types, choosing a provider, and how our intake process works.",
  },
  contact: {
    title: "Contact Us & Make a Referral · Empowerwell Support",
    description:
      "Call, email or send an NDIS referral online to Empowerwell Support. We support participants across Western Sydney and regional NSW.",
  },
  privacy: {
    title: "Privacy Policy · Empowerwell Support",
    description:
      "How Empowerwell Support collects, stores and protects personal and health information under the Privacy Act 1988 and the APPs.",
  },
  feedback: {
    title: "Feedback & Complaints · Empowerwell Support",
    description:
      "How to give feedback, raise a concern or make a complaint to Empowerwell Support or the NDIS Quality and Safeguards Commission.",
  },
  notFound: {
    title: "Page Not Found · Empowerwell Support",
    description:
      "The page you were looking for could not be found. Return to the Empowerwell Support homepage or browse our NDIS services.",
  },
} satisfies Record<string, PageMeta>;
