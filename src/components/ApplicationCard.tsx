"use client";

import { useState } from "react";
import { daysUntil, formatDate } from "@/lib/dates";
import { formatApplicationDetails } from "@/lib/applicationExport";
import { STATUSES, type Application, type Status } from "@/lib/types";

type Props = {
  app: Application;
  onChange: (changes: Partial<Application>) => void;
  onEdit: () => void;
  onDelete: () => void;
};

const statusColors: Record<Status, string> = {
  "Not Started": "bg-slate-100 text-slate-700",
  "In Progress": "bg-blue-100 text-blue-800",
  Submitted: "bg-purple-100 text-purple-800",
  Accepted: "bg-green-100 text-green-800",
  Waitlisted: "bg-amber-100 text-amber-800",
  Rejected: "bg-red-100 text-red-800",
};

// Statuses where the deadline no longer matters.
const finished: Status[] = ["Submitted", "Accepted", "Waitlisted", "Rejected"];

function DetailSection({ title, entries }: { title: string; entries: [string, string | undefined][] }) {
  const visible = entries.filter(([, value]) => value);
  if (!visible.length) return null;
  return (
    <details className="mt-5 border-t border-slate-200 pt-4">
      <summary className="cursor-pointer py-1 text-sm font-semibold">{title}</summary>
      <dl className="mt-4 grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
        {visible.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="font-medium text-slate-700">{label}</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words text-slate-600">{value}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

function deadlineLabel(app: Application) {
  const days = daysUntil(app.deadline);
  if (finished.includes(app.status)) return { text: formatDate(app.deadline), color: "text-slate-500" };
  if (days < 0) return { text: `${formatDate(app.deadline)} (overdue)`, color: "text-red-600 font-semibold" };
  if (days === 0) return { text: `${formatDate(app.deadline)} (today!)`, color: "text-red-600 font-semibold" };
  if (days <= 7) return { text: `${formatDate(app.deadline)} (${days} days left)`, color: "text-amber-600 font-semibold" };
  return { text: `${formatDate(app.deadline)} (${days} days left)`, color: "text-slate-600" };
}

export default function ApplicationCard({ app, onChange, onEdit, onDelete }: Props) {
  const [newRequirement, setNewRequirement] = useState("");
  const [editingRequirementId, setEditingRequirementId] = useState<string | null>(null);
  const [editingRequirementText, setEditingRequirementText] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const done = app.requirements.filter((r) => r.done).length;
  const total = app.requirements.length;
  const label = app.deadline ? deadlineLabel(app) : null;

  function toggleRequirement(id: string) {
    onChange({
      requirements: app.requirements.map((r) => (r.id === id ? { ...r, done: !r.done } : r)),
    });
  }

  function removeRequirement(id: string) {
    onChange({ requirements: app.requirements.filter((r) => r.id !== id) });
  }

  function saveRequirement(e: React.FormEvent) {
    e.preventDefault();
    const text = editingRequirementText.trim();
    if (!editingRequirementId || !text) return;
    onChange({ requirements: app.requirements.map((r) => r.id === editingRequirementId ? { ...r, text } : r) });
    setEditingRequirementId(null);
    setEditingRequirementText("");
  }

  function addRequirement(e: React.FormEvent) {
    e.preventDefault();
    const text = newRequirement.trim();
    if (!text) return;
    onChange({ requirements: [...app.requirements, { id: crypto.randomUUID(), text, done: false }] });
    setNewRequirement("");
  }

  async function copyDetails() {
    try {
      await navigator.clipboard.writeText(formatApplicationDetails(app));
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  return (
    <div className="min-w-0 break-words rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 basis-48">
          <h3 className="text-lg font-semibold">{app.college}</h3>
          {app.program && <p className="text-sm text-slate-600">{app.program}</p>}
          {app.url && /^https?:\/\//i.test(app.url) && (
            <a href={app.url} target="_blank" rel="noopener noreferrer" className="mt-2 block break-all text-sm text-blue-600 underline underline-offset-2 hover:text-blue-800">{app.url}</a>
          )}
          {label && <p className={`mt-2 text-sm ${label.color}`}>Deadline: {label.text}</p>}
        </div>
        <select
          value={app.status}
          onChange={(e) => onChange({ status: e.target.value as Status })}
          className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[app.status]}`}
        >
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {(app.tuitionFees != null || app.acceptanceChance) && (
        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          {app.tuitionFees != null && (
            <div>
              <dt className="text-xs text-slate-500">Annual tuition</dt>
              <dd className="font-medium">{app.tuitionCurrency || "GBP"} {app.tuitionFees.toLocaleString(undefined, { maximumFractionDigits: 2 })}</dd>
            </div>
          )}
          {app.acceptanceChance && (
            <div>
              <dt className="text-xs text-slate-500">Acceptance chance</dt>
              <dd className={`font-medium ${app.acceptanceChance === "Safe" ? "text-green-700" : app.acceptanceChance === "Medium" ? "text-amber-700" : "text-red-700"}`}>{app.acceptanceChance}</dd>
            </div>
          )}
        </dl>
      )}

      {app.nextAction && <p className="mt-3 whitespace-pre-wrap text-sm"><span className="font-medium">Next action: </span>{app.nextAction}</p>}
      {app.responseDeadline && <p className={`mt-2 text-sm ${daysUntil(app.responseDeadline) <= 7 ? "font-semibold text-red-600" : "text-slate-600"}`}>Response deadline: {formatDate(app.responseDeadline)}{daysUntil(app.responseDeadline) < 0 ? " (overdue)" : ""}</p>}

      <div className="mt-6">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>Requirements</span>
          <span>
            {done} / {total}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded bg-slate-100">
          <div className="h-full bg-blue-500" style={{ width: total ? `${(done / total) * 100}%` : "0%" }} />
        </div>

        <ul className="mt-3 space-y-2">
          {app.requirements.map((r) => (
            <li key={r.id} className="group flex items-center gap-3 py-1 text-sm">
              <input type="checkbox" checked={r.done} onChange={() => toggleRequirement(r.id)} />
              {editingRequirementId === r.id ? (
                <form onSubmit={saveRequirement} className="flex min-w-0 flex-1 items-center gap-2">
                  <input
                    autoFocus
                    value={editingRequirementText}
                    onChange={(e) => setEditingRequirementText(e.target.value)}
                    aria-label={`Edit ${r.text}`}
                    className="min-w-0 flex-1 rounded border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none"
                  />
                  <button type="submit" aria-label="Save requirement" className="text-blue-600 hover:text-blue-800">Save</button>
                  <button type="button" onClick={() => setEditingRequirementId(null)} aria-label="Cancel editing" className="text-slate-500 hover:text-slate-700">Cancel</button>
                </form>
              ) : (
                <>
                  <span className={`min-w-0 flex-1 ${r.done ? "text-slate-400 line-through" : ""}`}>{r.text}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRequirementId(r.id);
                      setEditingRequirementText(r.text);
                    }}
                    aria-label={`Edit ${r.text}`}
                    title="Edit requirement"
                    className="text-slate-400 hover:text-blue-600"
                  >
                    <span className="inline-block rotate-180">✎</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => removeRequirement(r.id)}
                aria-label={`Remove ${r.text}`}
                className="ml-auto text-slate-300 hover:text-red-600"
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={addRequirement} className="mt-4 flex gap-3">
          <input
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            placeholder="Add a requirement"
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100">Add</button>
        </form>
      </div>

      <DetailSection title="People and follow-ups" entries={[
        ["Counselor / admissions contact", app.contactName],
        ["Contact email / phone", app.contactDetails],
        ["Recommendation requests", app.recommendationRequests],
        ["Last contact", app.lastContact ? formatDate(app.lastContact) : undefined],
      ]} />
      <DetailSection title="Outcome" entries={[
        ["Decision date", app.decisionDate ? formatDate(app.decisionDate) : undefined],
        ["Admission result", app.admissionResult],
        ["Offered program", app.offeredProgram],
        ["Next steps", app.nextSteps],
      ]} />
      <DetailSection title="Notes" entries={[
        ["Pros", app.pros],
        ["Cons", app.cons],
        ["Questions to ask", app.questionsToAsk],
      ]} />

      {app.notes && <p className="mt-4 whitespace-pre-wrap text-sm text-slate-600">{app.notes}</p>}

      <div className="mt-6 flex gap-5 border-t border-slate-200 pt-4 text-sm">
        <button onClick={copyDetails} className="text-blue-600 hover:underline">
          {copyState === "copied" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy details"}
        </button>
        <button onClick={onEdit} className="text-blue-600 hover:underline">
          Edit
        </button>
        <button
          onClick={() => confirm(`Delete ${app.college}?`) && onDelete()}
          className="text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
