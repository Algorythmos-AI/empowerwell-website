/**
 * Empowerwell Support Pty Ltd — Master Business Details & Placeholders
 * 
 * IMPORTANT CONVENTION:
 * All business copy, contact details, registration numbers, and placeholder values
 * MUST live in this file or sibling content files. Never hardcode copy inside components.
 */

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  imageAlt: string;
}

export const SITE = {
  legalName: "Empowerwell Support Pty Ltd",
  brandName: "Empowerwell Support",
  tagline: "Empowering You to Thrive",
  ndisRegistration: "4-LCYP0SK",
  abn: "88 681 094 342",
  directors: ["Aiwen Kuel", "Lual Chol"],
  
  // Contact & Locations
  phone: "(02) 9831 0000", // Western Sydney local landline (also supports 0400 000 000)
  phoneHref: "tel:0298310000",
  email: "info@empowerwell.com.au",
  emailHref: "mailto:info@empowerwell.com.au",
  websiteUrl: "https://empowerwell.com.au",
  suburb: "Dharruk",
  state: "NSW",
  postcode: "2770",
  country: "Australia",
  serviceAreas: "Western Sydney, Greater Sydney, and regional NSW",
  
  // Operating Hours
  officeHours: "Monday to Friday: 9:00 am – 6:00 pm",
  supportHours: "Support services available 24 hours a day, 7 days a week",
  
  // Core Statements
  mission:
    "To empower, encourage and enable people who are ageing or living with disability to enhance their quality of life with dignity and respect, through holistic, person-centred care.",
  vision:
    "A resilient, empowered community supporting people with disability to live a great life with choice.",
  
  // Indigenous Acknowledgement of Country
  acknowledgementOfCountry:
    "We acknowledge the Traditional Custodians of the land on which we live and work, and pay our deep respects to Elders past and present. We celebrate the ongoing culture and connection of First Nations peoples to Australian land, waters, and community.",
  
  // Social media placeholders
  socials: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
  },
  
  // Form submission endpoint (from environment variable or fallback)
  formEndpoint: import.meta.env.PUBLIC_FORM_ENDPOINT || "",
  
  // Placeholders dictionary for quick audit
  PLACEHOLDERS: {
    phone: "0400 000 000 (DUMMY mobile placeholder; primary active is (02) 9831 0000)",
    email: "info@empowerwell.com.au",
    domain: "https://empowerwell.com.au",
    socialUrls: "Set to '#' until client supplies verified social profiles",
    formEndpoint: "PUBLIC_FORM_ENDPOINT in .env (configure Formspree / Resend)",
    directorPhotos: "public/images/team-aiwen-kuel.svg & public/images/team-lual-chol.svg",
    photography: "SVGs in public/images/ with TODO markers to swap with licensed photography",
  },
};

export const TEAM: TeamMember[] = [
  {
    name: "Aiwen Kuel",
    role: "Director & Support Specialist",
    bio: "Passionate about building inclusive communities and ensuring every person with disability has the voice, choice, and dedicated guidance they deserve.",
    image: "/images/team-aiwen-kuel.svg",
    imageAlt: "Aiwen Kuel, Director of Empowerwell Support Pty Ltd",
  },
  {
    name: "Lual Chol",
    role: "Director & Operations Lead",
    bio: "Dedicated to holistic, person-centred service delivery that prioritises dignity, respect, and reliable 24/7 care for participants and their families.",
    image: "/images/team-lual-chol.svg",
    imageAlt: "Lual Chol, Director of Empowerwell Support Pty Ltd",
  },
];
