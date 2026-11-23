/**
 * Real photos supplied by Empowerwell Support (Lual Chol, email 20 Nov 2026) for community access.
 *
 * Rules for every photo on this site:
 * - Written consent from each identifiable person (or their guardian) must be held by Empowerwell
 *   before the photo is published. Remove a photo immediately if consent is withdrawn.
 * - Files are re-encoded with ALL metadata removed (no EXIF, no GPS) before they are committed.
 * - Alt text and captions describe the activity, never a person's name, diagnosis or exact location.
 */
import type { ImageMetadata } from "astro";
import shoppingCentreOuting from "../assets/photos/shopping-centre-outing.jpg";
import communityOuting from "../assets/photos/community-outing.jpg";
import cafeOuting from "../assets/photos/cafe-outing.jpg";
import swimming from "../assets/photos/swimming.jpg";

export interface Photo {
  src: ImageMetadata;
  alt: string;
  caption: string;
}

export const PHOTOS = {
  shoppingCentreOuting: {
    src: shoppingCentreOuting,
    alt: "A smiling support worker and a participant enjoying cold drinks together at a shopping centre food court",
    caption: "A drink and a chat at the shops",
  },
  communityOuting: {
    src: communityOuting,
    alt: "A support worker beside a participant in a wheelchair outside a local venue on a sunny day",
    caption: "Visiting places you enjoy",
  },
  cafeOuting: {
    src: cafeOuting,
    alt: "A participant relaxing at an outdoor café table under a shaded pergola",
    caption: "Time out at a local café",
  },
  swimming: {
    src: swimming,
    alt: "Two support workers helping a participant float in a hydrotherapy pool with flotation supports",
    caption: "Hydrotherapy with support",
  },
} satisfies Record<string, Photo>;

/** Photos shown in the home page "Life in the community" section, in order. */
export const COMMUNITY_GALLERY: Photo[] = [PHOTOS.cafeOuting, PHOTOS.communityOuting, PHOTOS.swimming];
