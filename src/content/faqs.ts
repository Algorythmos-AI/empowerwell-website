/**
 * Empowerwell Support Pty Ltd — NDIS frequently asked questions.
 *
 * Plain English for people with intellectual disability, families and carers:
 * short sentences, everyday words, and a short explanation the first time an NDIS term is used.
 * Do not add promises (response times, capacity, staff numbers) the client has not confirmed.
 */
import { SITE } from "./site";

export interface FAQItem {
  id: string;
  question: string;
  /** Opening paragraph(s). */
  answer: string[];
  /** Optional list shown after the opening paragraph(s). */
  points?: { label?: string; text: string }[];
  /** Optional closing paragraph. */
  after?: string;
}

export const FAQS: FAQItem[] = [
  {
    id: "what-is-ndis",
    question: "What is the NDIS?",
    answer: [
      "The NDIS is the National Disability Insurance Scheme. It is an Australian scheme that gives funding to people with a permanent and significant disability.",
      "You use this funding to pay for the supports you need to live your life and reach your goals.",
    ],
  },
  {
    id: "plan-types",
    question: "What are the ways an NDIS plan can be managed?",
    answer: ["There are three ways to manage the money in your NDIS plan:"],
    points: [
      { label: "Self-managed", text: "You (or someone you trust) pay your providers yourself, then claim the money back from the NDIS." },
      { label: "Plan-managed", text: "A plan manager pays your providers for you. The NDIS pays for the plan manager." },
      { label: "Agency-managed (NDIA-managed)", text: "The NDIA (the agency that runs the NDIS) pays your providers directly." },
    ],
    after: `We are a registered NDIS provider (${SITE.ndisRegistration}), so we can support you with any of these three.`,
  },
  {
    id: "registered-provider-benefit",
    question: "Why does it matter that you are a registered NDIS provider?",
    answer: [
      "Registered providers are checked by the NDIS Quality and Safeguards Commission. They must meet the NDIS Practice Standards and follow the NDIS Code of Conduct, and their workers must pass an NDIS Worker Screening Check.",
      "If your plan is agency-managed, you can only use registered providers.",
    ],
    after: "You can check our registration on the NDIS Provider Register.",
  },
  {
    id: "choosing-provider",
    question: "How do I choose the right provider?",
    answer: ["Choose a provider who listens to you and respects your culture. Good questions to ask:"],
    points: [
      { text: "How will you match me with a support worker?" },
      { text: "Can I meet my worker before supports start?" },
      { text: "What happens if I want to change something or make a complaint?" },
    ],
    after: "We offer a free meet and greet, with no obligation, so you can decide if we are right for you.",
  },
  {
    id: "what-happens-after-enquire",
    question: "What happens after I contact you?",
    answer: ["Here is what happens next:"],
    points: [
      { label: "We call you", text: "We talk about your goals, your routine and your NDIS plan." },
      { label: "We meet", text: "We meet you at home or somewhere in the community. It is free and there is no obligation." },
      { label: "We agree a plan", text: "We write a service agreement with you. It shows the supports, the times and the costs." },
    ],
  },
  {
    id: "pricing-rates",
    question: "How much do your services cost?",
    answer: [
      "Our prices follow the NDIS Pricing Arrangements and Price Limits. These are the prices the NDIA sets.",
      "Before any supports start, we agree the costs with you in writing, in your service agreement.",
    ],
  },
  {
    id: "service-coverage",
    question: "Which areas do you cover?",
    answer: [
      `We are based in ${SITE.suburb}, ${SITE.state}. We support participants across ${SITE.serviceAreas}.`,
      "Call us to check if we can support you where you live.",
    ],
  },
  {
    id: "worker-compatibility",
    question: "Can I choose my support worker, or change them?",
    answer: [
      "Yes. You have choice and control. We try to match you with a worker who suits your interests, language and culture.",
      "If a match does not feel right, tell us and we will work with you to find a better one.",
    ],
  },
];
