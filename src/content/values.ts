/**
 * Empowerwell Support Pty Ltd — core values (from the client's business plan:
 * Empowerment · Dignity · Respect · Trust · Integrity · Innovation), in plain English.
 */

export interface ValueItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
}

export const VALUES: ValueItem[] = [
  {
    id: "empowerment",
    name: "Empowerment",
    tagline: "Your life, your choices",
    description: "We help you build the skills and confidence to make your own decisions.",
  },
  {
    id: "dignity",
    name: "Dignity",
    tagline: "Valuing every person",
    description: "We give you privacy, patience and respect, especially with personal care.",
  },
  {
    id: "respect",
    name: "Respect",
    tagline: "Listening to you",
    description: "We listen to you and respect your culture, your experiences and your boundaries.",
  },
  {
    id: "trust",
    name: "Trust",
    tagline: "Reliable and honest",
    description: "We turn up when we say we will, and we talk to you and your family openly and honestly.",
  },
  {
    id: "integrity",
    name: "Integrity",
    tagline: "Doing what is right",
    description: "We follow the NDIS Code of Conduct and the NDIS Practice Standards, and we are clear about our prices.",
  },
  {
    id: "innovation",
    name: "Innovation",
    tagline: "Open to new ideas",
    description: "We keep looking for better ways to support you, including new activities and helpful technology.",
  },
];
