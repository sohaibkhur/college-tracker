"use client";

import { useEffect, useState } from "react";
import type { Application } from "./types";

const API_URL = "/api/applications";
const OLD_STORAGE_KEY = "college-applications";

// Keeps the list in React state and saves it on the server, so it's shared across browsers.
export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((saved: Application[]) => {
        // One-time move of data saved by the older browser-only version.
        const old = localStorage.getItem(OLD_STORAGE_KEY);
        if (saved.length === 0 && old) {
          setApplications(JSON.parse(old));
        } else {
          setApplications(saved);
        }
        setLoaded(true);
      })
      .catch((err) => console.error("Could not load applications", err));
  }, []);

  // Wait until loading finishes so we never overwrite saved data with an empty list.
  useEffect(() => {
    if (!loaded) return;
    fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(applications),
    })
      .then((res) => res.ok && localStorage.removeItem(OLD_STORAGE_KEY))
      .catch((err) => console.error("Could not save applications", err));
  }, [applications, loaded]);

  const addApplication = (app: Application) => setApplications((prev) => [...prev, app]);

  const updateApplication = (id: string, changes: Partial<Application>) =>
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));

  const deleteApplication = (id: string) =>
    setApplications((prev) => prev.filter((a) => a.id !== id));

  return { applications, loaded, addApplication, updateApplication, deleteApplication };
}
