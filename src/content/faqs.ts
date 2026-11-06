/**
 * Empowerwell Support Pty Ltd — NDIS Frequently Asked Questions
 * 
 * Written in clear, accessible Australian English (Year 8 reading level).
 * Explains NDIS terminology the first time it is introduced.
 */

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "ndis_basics" | "plan_management" | "services_process";
}

export const FAQS: FAQItem[] = [
  {
    id: "what-is-ndis",
    question: "What is the NDIS?",
    answer: "The National Disability Insurance Scheme (NDIS) is an Australian Government initiative that provides funding directly to people living with significant and permanent disability. This funding enables you to access the supports, therapies, and services you need to live a healthy, independent, and fulfilling life.",
    category: "ndis_basics",
  },
  {
    id: "plan-types",
    question: "What are the three ways an NDIS plan can be managed?",
    answer: "There are three ways your NDIS funding can be managed:\n\n1. Self-Managed: You or your nominee manage the budget and pay service providers directly.\n2. Plan-Managed: A registered Plan Manager handles your invoices and claim paperwork on your behalf at no out-of-pocket cost to you.\n3. NDIA-Managed (Agency Managed): The National Disability Insurance Agency (NDIA) pays your providers directly from your plan.\n\nBecause Empowerwell Support is a fully Registered NDIS Provider (Registration: 4-LCYP0SK), we can support participants across all three management types.",
    category: "plan_management",
  },
  {
    id: "registered-provider-benefit",
    question: "Why does it matter that Empowerwell Support is a Registered NDIS Provider?",
    answer: "Being registered with the NDIS Quality and Safeguards Commission means we have met strict government quality, safety, worker screening, and governance standards. It also means we can support NDIA-managed participants who are legally required to use registered providers for high-intensity and SIL supports.",
    category: "ndis_basics",
  },
  {
    id: "choosing-provider",
    question: "How do I choose the right provider for my needs?",
    answer: "Look for a provider who listens to your goals, respects your cultural background, and communicates openly. You should feel comfortable asking about their staff qualifications, how they match support workers to your interests, and how they handle feedback. At Empowerwell Support, we offer an obligation-free meet and greet so you can decide if we are the right fit.",
    category: "services_process",
  },
  {
    id: "what-happens-after-enquire",
    question: "What happens after I make an enquiry or referral?",
    answer: "Our intake process is simple, friendly, and transparent:\n\nStep 1: Quick Friendly Call — We phone you within 24 business hours to discuss your goals, interests, and current NDIS plan.\nStep 2: Free Meet & Greet — We meet in person (at your home, in Dharruk, or in the community) so you can meet our team with zero obligation.\nStep 3: Tailored Service Agreement — Together, we create a clear service schedule tailored to your budget with no hidden costs.",
    category: "services_process",
  },
  {
    id: "pricing-rates",
    question: "How much do your services cost?",
    answer: "We charge strictly in line with the official NDIS Pricing Arrangements and Price Limits set by the National Disability Insurance Agency. There are no surprise out-of-pocket fees for covered supports. All costs are itemised and agreed upon in your Service Agreement before supports commence.",
    category: "services_process",
  },
  {
    id: "service-coverage",
    question: "Which areas do you service across Sydney and NSW?",
    answer: "Our head office is in Dharruk NSW 2770 in Western Sydney. We provide regular daily supports across Blacktown, Penrith, Parramatta, Liverpool, Campbelltown, Greater Western Sydney, and regional New South Wales communities.",
    category: "services_process",
  },
  {
    id: "worker-compatibility",
    question: "Can I choose my support worker or request a change?",
    answer: "Yes, absolutely. Choice and control are fundamental to our mission. We carefully match support workers based on shared interests, language preferences, and cultural background. If at any time you feel a match is not quite right, we will happily transition to another member of our care team with complete respect and no awkwardness.",
    category: "services_process",
  },
];
