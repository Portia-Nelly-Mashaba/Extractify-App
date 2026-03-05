"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

function calculateAge(dateOfBirth: string): string {
  if (!dateOfBirth) return "-";

  const date = new Date(dateOfBirth);
  if (Number.isNaN(date.getTime())) return "-";

  const now = new Date();
  let years = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
    years -= 1;
  }

  return years >= 0 ? String(years) : "-";
}

export default function ResultPage() {
  const params = useSearchParams();

  const firstName = params.get("firstName") || "";
  const lastName = params.get("lastName") || "";
  const fullName = `${firstName} ${lastName}`.trim() || "Not provided";
  const dateOfBirth = params.get("dateOfBirth") || "";
  const rawExtractedText = params.get("rawExtractedText") || "No extracted text available yet.";

  const age = useMemo(() => calculateAge(dateOfBirth), [dateOfBirth]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-cyan-300 via-emerald-200 to-teal-500 px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-white/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-4 h-80 w-80 rounded-full bg-teal-50/35 blur-3xl" />

      <section className="mx-auto w-full max-w-4xl rounded-3xl border border-white/35 bg-white/20 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-900/70">
              OMS Assessment
            </p>
            <h1 className="mt-2 text-3xl font-bold text-teal-950">Result Display Page</h1>
          </div>
          <Link
            href="/"
            className="rounded-xl bg-teal-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-900/30 transition hover:bg-teal-950"
          >
            Back to Upload
          </Link>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-white/40 bg-white/45 p-5">
            <p className="text-xs uppercase tracking-wide text-teal-800/80">Full Name</p>
            <p className="mt-2 text-lg font-semibold text-teal-950">{fullName}</p>
          </article>

          <article className="rounded-xl border border-white/40 bg-white/45 p-5">
            <p className="text-xs uppercase tracking-wide text-teal-800/80">Age</p>
            <p className="mt-2 text-lg font-semibold text-teal-950">{age}</p>
          </article>

          <article className="rounded-xl border border-white/40 bg-white/45 p-5 sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-teal-800/80">Raw Extracted Text</p>
            <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap text-sm leading-6 text-teal-950">
              {rawExtractedText}
            </pre>
          </article>
        </div>
      </section>
    </main>
  );
}
