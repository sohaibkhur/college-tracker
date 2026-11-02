"use client";

import { useState } from "react";
import ApplicationCard from "@/components/ApplicationCard";
import ApplicationForm from "@/components/ApplicationForm";
import { STATUSES, type Application, type Status } from "@/lib/types";
import { useApplications } from "@/lib/useApplications";

export default function Home() {
  const { applications, loaded, error, addApplication, updateApplication, deleteApplication } = useApplications();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [filter, setFilter] = useState<Status | "All">("All");

  const visible = applications
    .filter((a) => filter === "All" || a.status === filter)
    .sort((a, b) => a.deadline.localeCompare(b.deadline));

  function handleSave(app: Application) {
    if (editing) updateApplication(app.id, app);
    else addApplication(app);
    setShowForm(false);
    setEditing(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">College Application Tracker</h1>
          <p className="text-sm text-slate-600">{applications.length} applications</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            disabled={!loaded}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            + Add application
          </button>
        )}
      </header>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      {showForm && (
        <ApplicationForm key={editing?.id ?? "new"} initial={editing ?? undefined} onSave={handleSave} onCancel={closeForm} />
      )}

      <div className="flex flex-wrap gap-2">
        {(["All", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1 text-sm ${
              filter === s ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white hover:bg-slate-100"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loaded && visible.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No applications yet. Click &quot;Add application&quot; to start.
        </p>
      )}

      <div className="space-y-6">
        {visible.map((app) => (
          <ApplicationCard
            key={app.id}
            app={app}
            onChange={(changes) => updateApplication(app.id, changes)}
            onEdit={() => {
              setEditing(app);
              setShowForm(true);
            }}
            onDelete={() => deleteApplication(app.id)}
          />
        ))}
      </div>
    </main>
  );
}
