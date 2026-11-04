"use client";

import { useEffect, useRef, useState } from "react";
import ApplicationCard from "@/components/ApplicationCard";
import ApplicationForm from "@/components/ApplicationForm";
import { formatAllApplicationDetails } from "@/lib/applicationExport";
import { STATUSES, type Application, type Status } from "@/lib/types";
import { useApplications } from "@/lib/useApplications";

export default function Home() {
  const { applications, loaded, error, addApplication, updateApplication, deleteApplication } = useApplications();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [filter, setFilter] = useState<Status | "All">("All");
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showForm && editing) formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [showForm, editing]);

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

  function exportAll() {
    const file = new Blob([formatAllApplicationDetails(applications)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `college-applications-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">College Application Tracker</h1>
          <p className="text-sm text-slate-600">{applications.length} applications</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportAll}
            disabled={!loaded || applications.length === 0}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-50"
          >
            Export all
          </button>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              disabled={!loaded}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              + Add application
            </button>
          )}
        </div>
      </header>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      {showForm && (
        <div ref={formRef}>
          <ApplicationForm key={editing?.id ?? "new"} initial={editing ?? undefined} onSave={handleSave} onCancel={closeForm} />
        </div>
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
