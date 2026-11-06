/**
 * Empowerwell Support Pty Ltd — master business details, navigation and placeholders.
 *
 * CONVENTION: every business fact, contact detail, registration number, link label and placeholder
 * lives in this file (or a sibling file in src/content/). Components never hard-code them.
 * scripts/verify-dist.mjs fails the build if these values appear hard-coded in components.
 */

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  imageAlt: string;
}

export interface NavLink {
  href: string;
  label: string;
}

const phoneDisplay = "0401 712 914";
const email = "info@empowerwell.com.au";

export const SITE = {
  legalName: "Empowerwell Support Pty Ltd",
  brandName: "Empowerwell Support",
  tagline: "Empowering You to Thrive",
  ndisRegistration: "4-LCYP0SK",
  abn: "88 681 094 342",
  directors: ["Aiwen Kuel", "Lual Chol"],

  // Contact & location (street address intentionally not published until the client confirms it)
  phone: phoneDisplay,
  phoneHref: `tel:+61${phoneDisplay.replace(/\s/g, "").replace(/^0/, "")}`,
  phoneE164: `+61${phoneDisplay.replace(/\s/g, "").replace(/^0/, "")}`,
  phoneLabel: "Call or text",
  email,
  emailHref: `mailto:${email}`,
  websiteUrl: "https://empowerwell.com.au",
  suburb: "Dharruk",
  state: "NSW",
  postcode: "2770",
  country: "Australia",
  serviceAreas: "Western Sydney, Greater Sydney and regional NSW",

  // Operating hours
  officeHours: "Monday to Friday: 9:00 am – 6:00 pm",
  supportHours: "Support services available 24 hours a day, 7 days a week",

  // Core statements
  mission:
    "To empower, encourage and enable people who are ageing or living with disability to enhance their quality of life with dignity and respect, through holistic, person-centred care.",
  vision:
    "A resilient, empowered community supporting people with disability to live a great life with choice.",

  acknowledgementOfCountry:
    "We acknowledge the Traditional Custodians of the land on which we live and work, and pay our deep respects to Elders past and present. We celebrate the ongoing culture and connection of First Nations peoples to Australian land, waters, and community.",

  footerBlurb:
    "Delivering compassionate, person-centred disability support and SIL services across Western Sydney and regional NSW.",

  // Social profiles: null until the client supplies verified URLs. Components render only non-null entries.
  socials: {
    facebook: null as string | null,
    instagram: null as string | null,
    linkedin: null as string | null,
  },

  // External regulator links
  ndisCommissionUrl: "https://www.ndiscommission.gov.au",
  ndisCommissionPhone: "1800 035 544",
  ndisCommissionPhoneHref: "tel:1800035544",

  // Form submission endpoint (Formspree / Web3Forms / custom). Empty = mailto fallback.
  formEndpoint: (import.meta.env.PUBLIC_FORM_ENDPOINT as string | undefined) || "",

  /**
   * What still needs client input before launch. Keep this accurate: it is the audit list.
   */
  PLACEHOLDERS: {
    phone: "0401 712 914 is from our client records; the business plan lists 0413 955 269. Confirm which is public.",
    email: "info@empowerwell.com.au does not exist until the domain is registered and Zoho Mail is set up.",
    domain: "https://empowerwell.com.au is the preferred domain; not registered yet.",
    address: "Only the suburb (Dharruk NSW 2770) is shown until the client approves publishing the street address.",
    socialUrls: "null until the client supplies verified Facebook / Instagram / Google Business profiles.",
    formEndpoint: "Set PUBLIC_FORM_ENDPOINT (Formspree / Web3Forms) in Vercel; until then the form opens a pre-filled email.",
    directorPhotos: "public/images/team-aiwen-kuel.svg & public/images/team-lual-chol.svg are illustrated placeholders.",
    directorBios: "TEAM bios below are draft copy awaiting client approval.",
    photography: "SVG illustrations in public/images/ are placeholders for client or licensed stock photography.",
  },
};

/**
 * Colours needed outside CSS (meta theme-color, web manifest). Must mirror the @theme tokens in
 * src/styles/global.css; this is the only place outside global.css allowed to hold hex values.
 */
export const BRAND_COLORS = {
  themeColor: "#00613A", // --color-green-900
  background: "#FAFAF7", // --color-surface
};

/** Primary navigation (header, mobile menu, no-JS fallback). */
export const NAV: NavLink[] = [
  { href: "/services", label: "Services" },
  { href: "/who-we-support", label: "Who We Support" },
  { href: "/ndis-info", label: "NDIS Guide & FAQs" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export const CTA = {
  referral: { href: "/contact", label: "Make a Referral" },
};

/** Footer link groups. */
export const FOOTER = {
  exploreHeading: "Explore",
  explore: [
    { href: "/", label: "Home" },
    { href: "/services", label: "Our 11 Services" },
    { href: "/who-we-support", label: "Who We Support" },
    { href: "/ndis-info", label: "NDIS Info & FAQs" },
    { href: "/about", label: "About Empowerwell" },
    { href: "/contact", label: "Make a Referral / Contact" },
  ] satisfies NavLink[],
  contactHeading: "Get in Touch",
  safetyHeading: "Feedback & Safety",
  safetyBlurb:
    "Your voice and safety matter. We welcome all compliments, suggestions, and complaints to continually improve our supports.",
  safetyLinks: [
    { href: "/feedback", label: "Feedback & Complaints Procedure" },
    { href: "/privacy", label: "Privacy Policy" },
  ] satisfies NavLink[],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/feedback", label: "NDIS Safeguards" },
    { href: "/sitemap-index.xml", label: "Sitemap" },
  ] satisfies NavLink[],
};

export const TEAM: TeamMember[] = [
  {
    name: "Aiwen Kuel",
    role: "Director & Support Specialist",
    bio: "Passionate about building inclusive communities and ensuring every person with disability has the voice, choice, and dedicated guidance they deserve.",
    image: "/images/team-aiwen-kuel.svg",
    imageAlt: "Illustrated placeholder portrait for Aiwen Kuel, Director of Empowerwell Support",
  },
  {
    name: "Lual Chol",
    role: "Director & Operations Lead",
    bio: "Dedicated to holistic, person-centred service delivery that prioritises dignity, respect, and reliable 24/7 care for participants and their families.",
    image: "/images/team-lual-chol.svg",
    imageAlt: "Illustrated placeholder portrait for Lual Chol, Director of Empowerwell Support",
  },
];
