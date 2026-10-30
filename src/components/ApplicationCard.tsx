"use client";

import { useState } from "react";
import { daysUntil, formatDate } from "@/lib/dates";
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
  const done = app.requirements.filter((r) => r.done).length;
  const total = app.requirements.length;
  const label = deadlineLabel(app);

  function toggleRequirement(id: string) {
    onChange({
      requirements: app.requirements.map((r) => (r.id === id ? { ...r, done: !r.done } : r)),
    });
  }

  function removeRequirement(id: string) {
    onChange({ requirements: app.requirements.filter((r) => r.id !== id) });
  }

  function addRequirement(e: React.FormEvent) {
    e.preventDefault();
    const text = newRequirement.trim();
    if (!text) return;
    onChange({ requirements: [...app.requirements, { id: crypto.randomUUID(), text, done: false }] });
    setNewRequirement("");
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{app.college}</h3>
          {app.program && <p className="text-sm text-slate-600">{app.program}</p>}
          <p className={`mt-1 text-sm ${label.color}`}>Deadline: {label.text}</p>
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

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>Requirements</span>
          <span>
            {done} / {total}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded bg-slate-100">
          <div className="h-full bg-blue-500" style={{ width: total ? `${(done / total) * 100}%` : "0%" }} />
        </div>

        <ul className="mt-3 space-y-1">
          {app.requirements.map((r) => (
            <li key={r.id} className="group flex items-center gap-2 text-sm">
              <input type="checkbox" checked={r.done} onChange={() => toggleRequirement(r.id)} />
              <span className={r.done ? "text-slate-400 line-through" : ""}>{r.text}</span>
              <button
                onClick={() => removeRequirement(r.id)}
                aria-label={`Remove ${r.text}`}
                className="ml-auto text-slate-300 hover:text-red-600"
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={addRequirement} className="mt-3 flex gap-2">
          <input
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            placeholder="Add a requirement"
            className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100">Add</button>
        </form>
      </div>

      {app.notes && <p className="mt-4 whitespace-pre-wrap text-sm text-slate-600">{app.notes}</p>}

      <div className="mt-4 flex gap-3 text-sm">
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
