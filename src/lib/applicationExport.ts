import type { Application } from "@/lib/types";

function formatSection(title: string, fields: [string, string | number | undefined][]) {
  const lines = fields
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([label, value]) => `${label}: ${value}`);
  return lines.length ? `${title}\n${lines.join("\n")}` : "";
}

export function formatApplicationDetails(app: Application) {
  const sections = [
    formatSection("Application", [
      ["College", app.college],
      ["Program / major", app.program],
      ["Status", app.status],
      ["Application deadline", app.deadline || undefined],
      ["Application URL", app.url],
      ["Annual tuition", app.tuitionFees == null ? undefined : `${app.tuitionCurrency || "GBP"} ${app.tuitionFees}`],
      ["Acceptance chance", app.acceptanceChance],
    ]),
    app.requirements.length
      ? `Requirements\n${app.requirements.map((requirement) => `- [${requirement.done ? "x" : " "}] ${requirement.text}`).join("\n")}`
      : "",
    formatSection("People and follow-ups", [
      ["Counselor / admissions contact", app.contactName],
      ["Contact email / phone", app.contactDetails],
      ["Recommendation requests", app.recommendationRequests],
      ["Last contact", app.lastContact],
      ["Next action", app.nextAction],
    ]),
    formatSection("Outcome", [
      ["Decision date", app.decisionDate],
      ["Admission result", app.admissionResult],
      ["Offered program", app.offeredProgram],
      ["Response deadline", app.responseDeadline],
      ["Next steps", app.nextSteps],
    ]),
    formatSection("Notes", [
      ["General notes", app.notes],
      ["Pros", app.pros],
      ["Cons", app.cons],
      ["Questions to ask", app.questionsToAsk],
    ]),
  ];

  return sections.filter(Boolean).join("\n\n");
}

export function formatAllApplicationDetails(applications: Application[]) {
  return applications.map(formatApplicationDetails).join("\n\n---\n\n");
}
