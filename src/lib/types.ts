export const STATUSES = [
  "Not Started",
  "In Progress",
  "Submitted",
  "Accepted",
  "Waitlisted",
  "Rejected",
] as const;

export type Status = (typeof STATUSES)[number];

export type Requirement = {
  id: string;
  text: string;
  done: boolean;
};

export type Application = {
  id: string;
  college: string;
  program: string;
  deadline: string; // YYYY-MM-DD
  status: Status;
  requirements: Requirement[];
  notes: string;
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
