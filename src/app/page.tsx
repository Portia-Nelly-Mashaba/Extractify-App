"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const firstName = String(form.get("firstName") || "").trim();
    const lastName = String(form.get("lastName") || "").trim();
    const dateOfBirth = String(form.get("dateOfBirth") || "").trim();

    // Step 2 UI flow only: pass preview data to the result page.
    const query = new URLSearchParams({
      firstName,
      lastName,
      dateOfBirth,
      rawExtractedText: "Raw extracted text will appear here after backend integration.",
    });

    router.push(`/result?${query.toString()}`);
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
                Submit a PDF or image with personal details to process and review extraction results.
              </p>
            </div>
            <div className="hidden rounded-2xl border border-white/40 bg-white/25 px-4 py-3 text-right text-xs text-teal-900 sm:block">
              <p className="font-semibold">Step 2 of 5</p>
              <p>Frontend Pages</p>
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
                className="w-full rounded-xl border border-white/45 bg-white/55 px-4 py-3 text-sm text-teal-950 outline-none focus:ring-2 focus:ring-teal-500/50"
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

            <div className="sm:col-span-2 mt-2 flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-teal-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/30 transition hover:bg-teal-950"
              >
                Continue to Result Page
              </button>
            </div>
          </form>
        </section>

        <aside className="rounded-3xl border border-white/35 bg-teal-950/35 p-6 text-white shadow-2xl backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-semibold">Processing Overview</h2>
          <p className="mt-2 text-sm text-teal-100/90">
            Review the output fields that will be populated after document processing.
          </p>

          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-teal-100/70">Full Name</p>
              <p className="mt-1 text-sm font-medium">Awaiting input</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-teal-100/70">Age</p>
              <p className="mt-1 text-sm font-medium">Calculated on result page</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-teal-100/70">Raw Extracted Text</p>
              <p className="mt-1 text-sm font-medium text-teal-50/90">
                Shown after upload is processed in backend step.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
