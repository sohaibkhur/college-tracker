export const STATUSES = [
  "Not Started",
  "In Progress",
  "Submitted",
  "Accepted",
  "Waitlisted",
  "Rejected",
] as const;

export type Status = (typeof STATUSES)[number];

export const ACCEPTANCE_CHANCES = ["Safe", "Medium", "Hard"] as const;
export type AcceptanceChance = (typeof ACCEPTANCE_CHANCES)[number];

export type Requirement = {
  id: string;
  text: string;
  done: boolean;
};

export type Application = {
  id: string;
  college: string;
  program: string;
  url?: string;
  deadline: string; // YYYY-MM-DD
  status: Status;
  requirements: Requirement[];
  notes: string;
  tuitionFees?: number;
  tuitionCurrency?: string;
  acceptanceChance?: AcceptanceChance;
  contactName?: string;
  contactDetails?: string;
  recommendationRequests?: string;
  lastContact?: string;
  nextAction?: string;
  decisionDate?: string;
  admissionResult?: string;
  offeredProgram?: string;
  nextSteps?: string;
  responseDeadline?: string;
  pros?: string;
  cons?: string;
  questionsToAsk?: string;
};

// Starter checklist for every new application; edit freely afterwards.
export const DEFAULT_REQUIREMENTS = [
  "Application form",
  "Essay / personal statement",
  "Transcripts",
  "Recommendation letters",
  "Test scores",
  "Application fee",
];
