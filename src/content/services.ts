/**
 * Empowerwell Support Pty Ltd — 11 Core NDIS Services
 * 
 * Each service includes a slug, plain-English description (Year 8 reading level),
 * key benefits, and deep-link destination for pre-selecting the referral form.
 */

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  features: string[];
  isHighlight?: boolean;
}

export const SERVICES: ServiceItem[] = [
  {
    id: "personal-care",
    slug: "personal-care",
    title: "Personal Care & Daily Living",
    shortDescription: "Friendly, dignified help with morning routines, showering, grooming, meals, and mobility in your own home.",
    fullDescription: "Our qualified support workers support you with your everyday personal tasks while respecting your privacy, independence, and personal preferences at all times.",
    iconName: "HeartHandshake",
    features: [
      "Assistance with bathing, dressing, and personal hygiene",
      "Meal preparation and nutrition support",
      "Medication reminders and routine assistance",
      "Safe hoist transfers and mobility support",
    ],
    isHighlight: true,
  },
  {
    id: "sil",
    slug: "sil",
    title: "Supported Independent Living (SIL)",
    shortDescription: "Around-the-clock home support designed to help you live independently, build practical skills, and feel safe.",
    fullDescription: "Supported Independent Living (SIL) offers 24/7 care in a shared or individual home, ensuring you have constant support while retaining full control over your lifestyle.",
    iconName: "Home",
    features: [
      "24/7 on-site support workers and overnight care",
      "Support with meal planning, cooking, and budgeting",
      "Medication administration and health appointment coordination",
      "Warm, supportive, and accessible living environments",
    ],
    isHighlight: true,
  },
  {
    id: "shared-living",
    slug: "shared-living",
    title: "Shared Living Support",
    shortDescription: "Co-living accommodation assistance that connects housemates, fosters friendships, and shares household duties.",
    fullDescription: "Live together with compatible housemates in a warm, welcoming home while receiving tailored daily assistance tailored to each resident's individual plan.",
    iconName: "Users",
    features: [
      "Matching with compatible housemates who share similar interests",
      "Shared household routine coordination and conflict resolution",
      "Communal cooking, gardening, and leisure activities",
      "Individualised private bedrooms with shared accessible areas",
    ],
  },
  {
    id: "household-tasks",
    slug: "household-tasks",
    title: "Household Tasks",
    shortDescription: "Practical assistance keeping your living space clean, hygienic, comfortable, and well-organised.",
    fullDescription: "We assist with essential domestic duties so you can enjoy a safe, healthy, and stress-free home environment without burning out.",
    iconName: "Sparkles",
    features: [
      "Cleaning, vacuuming, mopping, and dusting",
      "Laundry, ironing, and changing bed linen",
      "Grocery shopping and pantry organisation",
      "Basic yard maintenance and rubbish disposal",
    ],
    isHighlight: true,
  },
  {
    id: "transport",
    slug: "transport",
    title: "Transport & Travel Assistance",
    shortDescription: "Safe, dependable rides to medical appointments, shopping centres, work, study, and social gatherings.",
    fullDescription: "Gain greater freedom to move around Greater Sydney and regional NSW with our experienced, fully licensed drivers and accessible transport options.",
    iconName: "Car",
    features: [
      "Door-to-door transport for medical and therapy appointments",
      "Travel training to build confidence on buses and trains",
      "Rides to weekly grocery shopping and social clubs",
      "Assistance with wheelchair-accessible vehicle transit",
    ],
  },
  {
    id: "community-participation",
    slug: "community-participation",
    title: "Community Participation",
    shortDescription: "One-on-one companionship to help you join local clubs, attend events, try new hobbies, and meet friends.",
    fullDescription: "Stay active and connected in your local neighbourhood. We support you to take part in cultural, sporting, and leisure activities that you enjoy.",
    iconName: "Compass",
    features: [
      "Attending local sports games, libraries, and art classes",
      "Joining recreational social groups and cultural gatherings",
      "Visiting cafes, parks, and community gardens",
      "Building confidence in public spaces and social settings",
    ],
    isHighlight: true,
  },
  {
    id: "innovative-community",
    slug: "innovative-community",
    title: "Innovative Community Participation",
    shortDescription: "Creative programs and mentoring designed to expand your horizons, build networks, and try new opportunities.",
    fullDescription: "Go beyond standard activities with tailored programs that focus on personal leadership, self-advocacy, creative arts, and community enterprise projects.",
    iconName: "Lightbulb",
    features: [
      "Creative workshops, digital literacy, and multimedia projects",
      "Mentoring for peer support and community leadership",
      "Volunteering placements matched to your passions",
      "Tailored programs that build social confidence",
    ],
  },
  {
    id: "group-activities",
    slug: "group-activities",
    title: "Group & Centre-Based Activities",
    shortDescription: "Fun, structured group sessions where you can learn new crafts, exercise, share stories, and celebrate milestones.",
    fullDescription: "Our group programs provide a safe, inclusive hub to make lasting friendships, develop social skills, and engage in stimulating group projects.",
    iconName: "CalendarDays",
    features: [
      "Cooking classes, arts and crafts, and trivia sessions",
      "Gentle exercise, movement, and wellness groups",
      "Day excursions to Sydney landmarks, museums, and beaches",
      "Holiday and festive celebration events",
    ],
    isHighlight: true,
  },
  {
    id: "life-skills",
    slug: "life-skills",
    title: "Life Skills Development",
    shortDescription: "Practical coaching in cooking, money management, communication, and digital technology for independent living.",
    fullDescription: "Develop lifelong confidence through step-by-step guidance that empowers you to manage your personal affairs and achieve your individual goals.",
    iconName: "GraduationCap",
    features: [
      "Budgeting, banking, and managing everyday expenses",
      "Meal planning, cooking, and safe food storage",
      "Using smart devices, email, and assistive technology",
      "Effective communication and decision-making skills",
    ],
    isHighlight: true,
  },
  {
    id: "life-transition",
    slug: "life-transition",
    title: "Life Transition Support",
    shortDescription: "Coordinated guidance during major changes, like moving homes, leaving school, or entering a new stage of life.",
    fullDescription: "Major life transitions can feel overwhelming. We walk alongside you and your support network to create calm, structured transition roadmaps.",
    iconName: "Footprints",
    features: [
      "Transitioning from school to tertiary education or work",
      "Moving into independent or shared accommodation",
      "Navigating changes in health or support requirements",
      "Developing resilience and coping strategies for change",
    ],
  },
  {
    id: "employment-support",
    slug: "employment-support",
    title: "Employment Support",
    shortDescription: "Guidance to help you prepare your resume, practice interviews, find fulfilling work, and thrive on the job.",
    fullDescription: "We assist you to discover your career strengths, connect with disability-confident employers, and maintain sustainable, rewarding employment.",
    iconName: "Briefcase",
    features: [
      "Resume writing, cover letters, and job application assistance",
      "Interview practice and workplace etiquette coaching",
      "On-the-job support and workplace adjustment coordination",
      "Ongoing check-ins to ensure workplace success and wellbeing",
    ],
  },
];
