/**
 * Empowerwell Support Pty Ltd — the 11 NDIS supports we are registered for.
 *
 * Titles and registration groups come from the client's NDIS Certificate of Registration (see the brief).
 * Copy is plain English. Do not add equipment, vehicles, housing, qualifications or capacity the client
 * has not confirmed.
 */

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  /** NDIS registration group number and name. */
  ndisGroup: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  /** Shown on the home page as a featured support. */
  featured?: boolean;
  /** Optional picture shown with the service. */
  image?: { src: string; alt: string; caption: string };
}

export const SERVICES: ServiceItem[] = [
  {
    id: "personal-care",
    slug: "personal-care",
    title: "Personal Care & Daily Living",
    ndisGroup: "0107 Assist-Personal Activities",
    shortDescription: "Help with your morning and evening routines, showering, dressing and meals, in your own home.",
    fullDescription: "Our support workers help you with everyday personal tasks. We respect your privacy, your choices and the way you like things done.",
    features: [
      "Showering, dressing and personal hygiene",
      "Preparing meals and eating well",
      "Reminders to take your medication",
      "Moving around your home safely",
    ],
    featured: true,
  },
  {
    id: "sil",
    slug: "sil",
    title: "Supported Independent Living (SIL)",
    ndisGroup: "0138 Supported Independent Living",
    shortDescription: "Support in your home so you can live as independently as possible, with help when you need it.",
    fullDescription: "SIL is help with daily tasks in a shared or individual home. Supports can be arranged day and night if you need them, and you stay in charge of your lifestyle.",
    features: [
      "Help with daily tasks at home",
      "Support with shopping, cooking and budgeting",
      "Help to get to health appointments",
      "Building the skills to do more on your own",
    ],
    featured: true,
  },
  {
    id: "shared-living",
    slug: "shared-living",
    title: "Shared Living Support",
    ndisGroup: "0115 Daily Tasks/Shared Living",
    shortDescription: "Help with daily tasks when you live with housemates, so the home runs smoothly for everyone.",
    fullDescription: "If you live with other people, we support you with daily tasks and help everyone in the home get along, while each person's plan stays their own.",
    features: [
      "Help with shared routines and household jobs",
      "Support to sort out problems between housemates",
      "Cooking and activities together",
      "Support that follows your own NDIS plan",
    ],
  },
  {
    id: "household-tasks",
    slug: "household-tasks",
    title: "Household Tasks",
    ndisGroup: "0120 Household Tasks",
    shortDescription: "Help to keep your home clean, tidy and comfortable.",
    fullDescription: "We help with the jobs around the house that you need a hand with, so your home stays safe and pleasant to live in.",
    features: [
      "Cleaning, vacuuming and mopping",
      "Washing, ironing and changing bed sheets",
      "Grocery shopping and putting things away",
      "Light garden jobs and taking out the rubbish",
    ],
    featured: true,
  },
  {
    id: "transport",
    slug: "transport",
    title: "Transport & Travel Assistance",
    ndisGroup: "0108 Assist-Travel/Transport",
    shortDescription: "Help to get to appointments, shops, work, study and social activities, including in our wheelchair-accessible van.",
    fullDescription: "We help you get where you need to go. Our wheelchair-accessible van has a ramp, so you can travel in your own wheelchair. We can also help you build the confidence to travel on your own.",
    features: [
      "Wheelchair-accessible van with a ramp",
      "Getting to medical and therapy appointments",
      "Trips to the shops, work and social activities",
      "Learning to use buses and trains",
    ],
    featured: true,
    image: {
      src: "/images/wheelchair-accessible-van.svg",
      alt: "Illustration of a wheelchair-accessible van with its rear ramp lowered",
      caption: "Our wheelchair-accessible van has a ramp at the back.",
    },
  },
  {
    id: "community-participation",
    slug: "community-participation",
    title: "Community Participation",
    ndisGroup: "0125 Participate Community",
    shortDescription: "One-on-one support to join clubs, go to events, try new hobbies and meet people.",
    fullDescription: "We support you to take part in the sport, culture and leisure activities you enjoy, in your local area.",
    features: [
      "Going to sport, libraries and classes",
      "Joining social groups and cultural events",
      "Visiting cafes, parks and community gardens",
      "Feeling more confident when you are out and about",
    ],
    featured: true,
  },
  {
    id: "innovative-community",
    slug: "innovative-community",
    title: "Innovative Community Participation",
    ndisGroup: "0116 Innov Community Participation",
    shortDescription: "New kinds of activities that help you build skills and connections in your community.",
    fullDescription: "This is support for activities that go beyond the usual, like creative projects, volunteering and learning to speak up for yourself.",
    features: [
      "Creative and digital projects",
      "Volunteering that matches your interests",
      "Learning to speak up for yourself",
      "Building friendships and connections",
    ],
  },
  {
    id: "group-activities",
    slug: "group-activities",
    title: "Group & Centre-Based Activities",
    ndisGroup: "0136 Group/Centre Activities",
    shortDescription: "Group activities where you can learn, have fun and make friends.",
    fullDescription: "Group activities are a chance to make friends, practise social skills and try new things with other people.",
    features: [
      "Cooking, arts and crafts",
      "Gentle exercise and wellbeing activities",
      "Day trips and outings",
      "Celebrating special days together",
    ],
  },
  {
    id: "life-skills",
    slug: "life-skills",
    title: "Life Skills Development",
    ndisGroup: "0117 Development-Life Skills",
    shortDescription: "Learn skills like cooking, managing money and using technology, so you can do more for yourself.",
    fullDescription: "We teach you step by step, at your own pace, so you can manage more of your own life.",
    features: [
      "Budgeting and managing your money",
      "Planning meals and cooking safely",
      "Using phones, email and assistive technology",
      "Communicating and making decisions",
    ],
    featured: true,
  },
  {
    id: "life-transition",
    slug: "life-transition",
    title: "Life Transition Support",
    ndisGroup: "0106 Assist-Life Stage, Transition",
    shortDescription: "Help during big changes, like moving house, leaving school or a change in your health.",
    fullDescription: "Big changes can feel hard. We work with you and the people who support you to plan each step.",
    features: [
      "Leaving school and starting study or work",
      "Moving into a new home",
      "Changes in your health or support needs",
      "Ways to cope with change",
    ],
  },
  {
    id: "employment-support",
    slug: "employment-support",
    title: "Employment Support",
    ndisGroup: "0102 Assist Access/Maintain Employ",
    shortDescription: "Help to get ready for work, find a job and keep it.",
    fullDescription: "We help you find out what work suits you, prepare to apply for jobs, and settle into a new job.",
    features: [
      "Writing your resume and applying for jobs",
      "Practising for interviews",
      "Support in your first weeks at work",
      "Regular check-ins once you are working",
    ],
  },
];
