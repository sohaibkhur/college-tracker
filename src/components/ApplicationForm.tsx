"use client";

import { useState } from "react";
import { DEFAULT_REQUIREMENTS, STATUSES, type Application, type Status } from "@/lib/types";

type Props = {
  initial?: Application;
  onSave: (app: Application) => void;
  onCancel: () => void;
};

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

export default function ApplicationForm({ initial, onSave, onCancel }: Props) {
  const [college, setCollege] = useState(initial?.college ?? "");
  const [program, setProgram] = useState(initial?.program ?? "");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [status, setStatus] = useState<Status>(initial?.status ?? "Not Started");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      college: college.trim(),
      program: program.trim(),
      deadline,
      status,
      notes,
      requirements:
        initial?.requirements ??
        DEFAULT_REQUIREMENTS.map((text) => ({ id: crypto.randomUUID(), text, done: false })),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
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

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Notes</span>
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
