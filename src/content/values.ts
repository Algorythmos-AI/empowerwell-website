/**
 * Empowerwell Support Pty Ltd — Core Values
 * 
 * Defined with plain-English practical meanings that reflect real day-to-day care.
 */

export interface ValueItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
}

export const VALUES: ValueItem[] = [
  {
    id: "empowerment",
    name: "Empowerment",
    tagline: "Your life, your choices",
    description: "We equip you with the skills, tools, and confidence to make your own decisions and take charge of your everyday journey.",
    iconName: "Zap",
  },
  {
    id: "dignity",
    name: "Dignity",
    tagline: "Valuing every person",
    description: "Every individual deserves unconditional privacy, patience, and honor in every aspect of daily life and personal care.",
    iconName: "Heart",
  },
  {
    id: "respect",
    name: "Respect",
    tagline: "Listening with empathy",
    description: "We listen actively to your cultural beliefs, lived experiences, and personal boundaries, honouring your individuality.",
    iconName: "Smile",
  },
  {
    id: "trust",
    name: "Trust",
    tagline: "Reliable, open relationships",
    description: "We show up on time, communicate honestly, and build lasting, dependable relationships that you and your family can count on 24/7.",
    iconName: "ShieldCheck",
  },
  {
    id: "integrity",
    name: "Integrity",
    tagline: "Doing what is right",
    description: "We adhere strictly to the NDIS Code of Conduct and Australian standards, ensuring complete transparency in all our pricing and operations.",
    iconName: "CheckCircle",
  },
  {
    id: "innovation",
    name: "Innovation",
    tagline: "Fresh, flexible solutions",
    description: "We continuously evolve our support methods, adopting creative programs and assistive technology that foster genuine social inclusion.",
    iconName: "Sparkle",
  },
];
