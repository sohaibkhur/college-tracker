"use client";

import { useState } from "react";
import { ACCEPTANCE_CHANCES, DEFAULT_REQUIREMENTS, STATUSES, type AcceptanceChance, type Application, type Status } from "@/lib/types";

type Props = {
  initial?: Application;
  onSave: (app: Application) => void;
  onCancel: () => void;
};

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

const detailSections = [
  {
    title: "People and follow-ups",
    fields: [
      { name: "contactName", label: "Counselor / admissions contact", type: "text" },
      { name: "contactDetails", label: "Contact email / phone", type: "text" },
      { name: "recommendationRequests", label: "Recommendation requests", type: "textarea" },
      { name: "lastContact", label: "Last contact", type: "date" },
      { name: "nextAction", label: "Next action", type: "textarea" },
    ],
  },
  {
    title: "Outcome",
    fields: [
      { name: "decisionDate", label: "Decision date", type: "date" },
      { name: "admissionResult", label: "Admission result", type: "text" },
      { name: "offeredProgram", label: "Offered program", type: "text" },
      { name: "responseDeadline", label: "Response deadline", type: "date" },
      { name: "nextSteps", label: "Next steps", type: "textarea" },
    ],
  },
  {
    title: "Notes",
    fields: [
      { name: "pros", label: "Pros", type: "textarea" },
      { name: "cons", label: "Cons", type: "textarea" },
      { name: "questionsToAsk", label: "Questions to ask", type: "textarea" },
    ],
  },
] as const;

export default function ApplicationForm({ initial, onSave, onCancel }: Props) {
  const [college, setCollege] = useState(initial?.college ?? "");
  const [program, setProgram] = useState(initial?.program ?? "");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [status, setStatus] = useState<Status>(initial?.status ?? "Not Started");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const tuition = String(formData.get("tuitionFees") ?? "");
    const details = Object.fromEntries(detailSections.flatMap((section) =>
      section.fields.map((field) => [field.name, String(formData.get(field.name) ?? "").trim()])
    ));
    onSave({
      ...initial,
      ...details,
      id: initial?.id ?? crypto.randomUUID(),
      college: college.trim(),
      program: program.trim(),
      deadline,
      status,
      notes,
      tuitionFees: tuition === "" ? undefined : Number(tuition),
      tuitionCurrency: String(formData.get("tuitionCurrency") ?? "GBP").trim().toUpperCase(),
      acceptanceChance: (formData.get("acceptanceChance") || undefined) as AcceptanceChance | undefined,
      requirements:
        initial?.requirements ??
        DEFAULT_REQUIREMENTS.map((text) => ({ id: crypto.randomUUID(), text, done: false })),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="min-w-0 space-y-5 border-y border-slate-200 bg-white py-5">
      <h2 className="text-lg font-semibold">{initial ? "Edit application" : "New application"}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">College</span>
          <input required className={inputClass} value={college} onChange={(e) => setCollege(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Program / major</span>
          <input className={inputClass} value={program} onChange={(e) => setProgram(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Deadline</span>
          <input required type="date" className={inputClass} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Status</span>
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as Status)}>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="min-w-0 border-t border-slate-200 pt-4">
        <legend className="pr-2 text-sm font-semibold">Fees and chances</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block min-w-0 text-sm">
            <span className="mb-1 block font-medium">Annual tuition fees</span>
            <input name="tuitionFees" type="number" min="0" step="0.01" defaultValue={initial?.tuitionFees ?? ""} className={inputClass} />
          </label>
          <label className="block min-w-0 text-sm">
            <span className="mb-1 block font-medium">Currency code</span>
            <input name="tuitionCurrency" pattern="[A-Za-z]{3}" title="Three-letter currency code, such as GBP, USD, or EUR" maxLength={3} defaultValue={initial?.tuitionCurrency ?? "GBP"} className={inputClass} />
          </label>
          <label className="block min-w-0 text-sm">
            <span className="mb-1 block font-medium">Acceptance chance</span>
            <select name="acceptanceChance" defaultValue={initial?.acceptanceChance ?? ""} className={inputClass}>
              <option value="">Not assessed</option>
              {ACCEPTANCE_CHANCES.map((chance) => <option key={chance}>{chance}</option>)}
            </select>
          </label>
        </div>
      </fieldset>

      {detailSections.map((section) => (
        <fieldset key={section.title} className="min-w-0 border-t border-slate-200 pt-4">
          <legend className="pr-2 text-sm font-semibold">{section.title}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {section.fields.map((field) => (
              <label key={field.name} className="block min-w-0 text-sm">
                <span className="mb-1 block font-medium">{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea name={field.name} rows={2} defaultValue={initial?.[field.name] ?? ""} className={inputClass} />
                ) : (
                  <input name={field.name} type={field.type} defaultValue={initial?.[field.name] ?? ""} className={inputClass} />
                )}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <label className="block text-sm">
        <span className="mb-1 block font-medium">General notes</span>
        <textarea rows={2} className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      <div className="flex gap-2">
        <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Save
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100">
          Cancel
        </button>
      </div>
    </form>
  );
}
