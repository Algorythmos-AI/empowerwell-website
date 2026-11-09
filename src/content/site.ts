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

  // Contact & location. Street address approved for publication by the client (email, 8 Nov 2026).
  phone: phoneDisplay,
  phoneHref: `tel:+61${phoneDisplay.replace(/\s/g, "").replace(/^0/, "")}`,
  phoneE164: `+61${phoneDisplay.replace(/\s/g, "").replace(/^0/, "")}`,
  phoneLabel: "Call or text",
  email,
  emailHref: `mailto:${email}`,
  // Public origin from astro.config (site-url.mjs): the Vercel production domain, or the custom domain once attached.
  websiteUrl: ((import.meta.env.SITE as string | undefined) ?? "https://empowerwell.com.au").replace(/\/$/, ""),
  streetAddress: "62 Eloura St",
  suburb: "Dharruk",
  state: "NSW",
  postcode: "2770",
  country: "Australia",
  serviceAreas: "Greater Sydney and regional NSW",

  // Operating hours
  // Days not yet confirmed by the client (brief gives hours only).
  officeHours: "9:00 am – 6:00 pm",
  supportHours: "Supports can be arranged 24 hours a day, 7 days a week, if you need them",

  // Core statements
  // Mission and vision: client's business plan wording (Rev.2, 20 Apr 2026), verbatim.
  mission:
    "To empower, encourage and enable people who are ageing or living with disability to enhance their quality of life with dignity and respect; to meet and exceed stakeholders' expectations; and to provide care focused on a holistic view of each person.",
  vision:
    "A resilient, empowered community, working in partnership to support people with disability to live a great life with choice.",

  acknowledgementOfCountry:
    "We acknowledge the Traditional Custodians of the land on which we live and work, and pay our deep respects to Elders past and present. We celebrate the ongoing culture and connection of First Nations peoples to Australian land, waters, and community.",

  footerBlurb:
    "Person-centred NDIS supports across Greater Sydney and regional NSW.",

  // Social profiles: null until the client supplies verified URLs. Components render only non-null entries.
  socials: {
    facebook: null as string | null,
    instagram: null as string | null,
    linkedin: null as string | null,
  },

  // External regulator links (checked 2026-11-07)
  ndisCommissionUrl: "https://www.ndiscommission.gov.au",
  ndisCommissionComplaintsUrl: "https://www.ndiscommission.gov.au/complaints",
  ndisProviderRegisterUrl: "https://www.ndiscommission.gov.au/provider-registration/find-registered-provider",
  ndisCommissionPhone: "1800 035 544",
  ndisCommissionPhoneHref: "tel:1800035544",
  advocacyUrl: "https://www.disabilitygateway.gov.au/legal/advocacy",
  oaicComplaintsUrl: "https://www.oaic.gov.au/privacy/privacy-complaints",
  oaicPhone: "1300 363 992",
  oaicPhoneHref: "tel:1300363992",

  // Form submission endpoint (Formspree / Web3Forms / custom). Empty = mailto fallback.
  formEndpoint: (import.meta.env.PUBLIC_FORM_ENDPOINT as string | undefined) || "",

  /**
   * What still needs client input before launch. Keep this accurate: it is the audit list.
   */
  PLACEHOLDERS: {
    phone: "0401 712 914 is from our client records; the business plan lists 0413 955 269. Confirm which is public.",
    email: "info@empowerwell.com.au does not exist until the domain is registered and Zoho Mail is set up.",
    domain: "https://empowerwell.com.au is the preferred domain; not registered yet.",
    socialUrls: "No Facebook; Instagram exists but the client wants a professional one set up first. null until then.",
    formEndpoint: "Set PUBLIC_FORM_ENDPOINT (Formspree / Web3Forms) in Vercel; until then the form opens a pre-filled email.",
    directorPhotos: "public/images/team-aiwen-kuel.svg & public/images/team-lual-chol.svg are illustrated placeholders.",
    directorBios: "TEAM bios below are draft copy awaiting client approval.",
    photography: "SVG illustrations in public/images/ are placeholders for client or licensed stock photography.",
    vanPhoto: "public/images/wheelchair-accessible-van.svg is an illustration; replace with a photo of the client's own van (client sending photos).",
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

/**
 * Independent help and access services shown on the contact, feedback and privacy pages.
 * Public national numbers; re-check them yearly.
 */
export const HELP_CONTACTS = {
  heading: "Need help now, or help to talk to us?",
  items: [
    {
      name: "Emergency",
      detail: "If someone is in danger or needs urgent medical help, call Triple Zero.",
      phone: "000",
      href: "tel:000",
    },
    {
      name: "National Disability Abuse and Neglect Hotline",
      detail: "Free, confidential help to report abuse or neglect of a person with disability.",
      phone: "1800 880 052",
      href: "tel:1800880052",
    },
    {
      name: "NDIS Quality and Safeguards Commission",
      detail: "Make a complaint about any NDIS provider. You can complain at any time, and you can stay anonymous.",
      phone: "1800 035 544",
      href: "tel:1800035544",
    },
    {
      name: "Translating and Interpreting Service (TIS National)",
      detail: "Need an interpreter? Call TIS and ask them to call us.",
      phone: "131 450",
      href: "tel:131450",
    },
    {
      name: "National Relay Service",
      detail: "If you are deaf, or find it hard hearing or speaking, call the NRS and ask for our number.",
      phone: "1300 555 727",
      href: "tel:1300555727",
    },
  ],
};

/** Primary navigation (header, mobile menu, no-JS fallback). */
export const NAV: NavLink[] = [
  { href: "/services", label: "Services" },
  { href: "/who-we-support", label: "Who We Support" },
  { href: "/ndis-info", label: "NDIS FAQs" },
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
    { href: "/ndis-info", label: "NDIS FAQs" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Make a Referral / Contact" },
  ] satisfies NavLink[],
  contactHeading: "Get in Touch",
  safetyHeading: "Feedback & Safety",
  safetyBlurb:
    "Your voice and safety matter. We welcome all compliments, suggestions, and complaints to continually improve our supports.",
  safetyLinks: [
    { href: "/feedback", label: "Feedback & Complaints" },
  ] satisfies NavLink[],
  registerLabel: "Check our registration on the NDIS Provider Register",
  legal: [{ href: "/privacy", label: "Privacy Policy" }] satisfies NavLink[],
};

export const TEAM: TeamMember[] = [
  {
    name: "Aiwen Kuel",
    role: "Director",
    bio: "Passionate about building inclusive communities and ensuring every person with disability has the voice, choice, and dedicated guidance they deserve.",
    image: "/images/team-aiwen-kuel.svg",
    imageAlt: "Illustrated placeholder portrait for Aiwen Kuel, Director of Empowerwell Support",
  },
  {
    name: "Lual Chol",
    role: "Director & Operations Manager",
    bio: "Focused on reliable, respectful supports that fit each participant's routine, and on clear communication with families.",
    image: "/images/team-lual-chol.svg",
    imageAlt: "Illustrated placeholder portrait for Lual Chol, Director of Empowerwell Support",
  },
];
