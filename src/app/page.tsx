"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function Home() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        body: form,
      });

      const payload = await response.json();

      if (!response.ok) {
        setSubmitError(payload?.error || "Upload failed. Please try again.");
        return;
      }

      sessionStorage.setItem("extractifyUploadResult", JSON.stringify(payload));
      router.push("/result");
    } catch {
      setSubmitError("Could not reach API server. Ensure backend is running on port 4000.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-300 via-cyan-200 to-teal-400 px-4 py-10">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-cyan-100/40 blur-3xl" />

      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-white/35 bg-white/20 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-900/70">
                Extractify
              </p>
              <h1 className="mt-2 text-3xl font-bold text-teal-950">Document Upload</h1>
              <p className="mt-2 max-w-md text-sm text-teal-900/80">
                Upload your document, validate your profile details, and get extraction results instantly.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-1">
              <span className="mb-2 block text-sm font-semibold text-teal-950">First Name</span>
              <input
                name="firstName"
                required
                className="w-full rounded-xl border border-white/45 bg-white/55 px-4 py-3 text-sm text-teal-950 outline-none placeholder:text-teal-700/60 focus:ring-2 focus:ring-teal-500/50"
                placeholder="Enter first name"
                type="text"
              />
            </label>

            <label className="sm:col-span-1">
              <span className="mb-2 block text-sm font-semibold text-teal-950">Last Name</span>
              <input
                name="lastName"
                required
                className="w-full rounded-xl border border-white/45 bg-white/55 px-4 py-3 text-sm text-teal-950 outline-none placeholder:text-teal-700/60 focus:ring-2 focus:ring-teal-500/50"
                placeholder="Enter last name"
                type="text"
              />
            </label>

            <label className="sm:col-span-1">
              <span className="mb-2 block text-sm font-semibold text-teal-950">Date of Birth</span>
              <input
                name="dateOfBirth"
                required
                className="w-full appearance-auto rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-teal-500/40"
                type="date"
              />
            </label>

            <label className="sm:col-span-1">
              <span className="mb-2 block text-sm font-semibold text-teal-950">File (PDF or Image)</span>
              <input
                name="file"
                required
                accept=".pdf,image/*"
                className="w-full rounded-xl border border-white/45 bg-white/55 px-3 py-2 text-sm text-teal-900 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-teal-800"
                type="file"
              />
            </label>

            <div className="sm:col-span-2 mt-2 flex flex-col items-end gap-3">
              {submitError ? (
                <p className="w-full rounded-xl border border-red-300/60 bg-red-50/70 px-4 py-2 text-sm text-red-700">
                  {submitError}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-teal-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/30 transition hover:bg-teal-950 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Processing..." : "Process Document"}
              </button>
            </div>
          </form>
        </section>

        <aside className="rounded-3xl border border-white/35 bg-teal-950/35 p-6 text-white shadow-2xl backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-semibold">What You Get</h2>
          <p className="mt-2 text-sm text-teal-100/90">The result page returns these verified outputs.</p>

          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-teal-100/70">Full Name</p>
              <p className="mt-1 text-sm font-medium">Generated from first and last name</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-teal-100/70">Age</p>
              <p className="mt-1 text-sm font-medium">Calculated from date of birth</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-teal-100/70">Raw Extracted Text</p>
              <p className="mt-1 text-sm font-medium text-teal-50/90">Extracted using OCR or PDF parsing.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
