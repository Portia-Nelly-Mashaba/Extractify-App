"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

type UploadResult = {
  fullName?: string;
  age?: number;
  rawExtractedText?: string;
};

function looksLikeSectionHeader(line: string): boolean {
  return /^[A-Z0-9\s/&(),.-]{3,}$/.test(line) && line.length <= 42;
}

function formatStructuredPreview(text: string): string {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return "No extracted text returned.";

  const output: string[] = [];
  let paragraph = "";

  for (const line of lines) {
    const isHeader = looksLikeSectionHeader(line);
    const startsNewSentence = /^[A-Z][a-z]/.test(line);
    const currentEndsStrong = /[.:;!?)]$/.test(paragraph);

    if (isHeader) {
      if (paragraph) {
        output.push(paragraph.trim());
        paragraph = "";
      }
      output.push(line);
      continue;
    }

    if (!paragraph) {
      paragraph = line;
      continue;
    }

    if (currentEndsStrong || startsNewSentence) {
      output.push(paragraph.trim());
      paragraph = line;
      continue;
    }

    paragraph = `${paragraph} ${line}`;
  }

  if (paragraph) output.push(paragraph.trim());

  return output.join("\n\n");
}

function readUploadResultSnapshot(): string {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem("extractifyUploadResult") || "";
}

export default function ResultPage() {
  const snapshot = useSyncExternalStore(() => () => {}, readUploadResultSnapshot, () => "");
  const result = useMemo<UploadResult | null>(() => {
    if (!snapshot) return null;

    try {
      return JSON.parse(snapshot) as UploadResult;
    } catch {
      return null;
    }
  }, [snapshot]);

  const fullName = result?.fullName || "Not provided";
  const age = typeof result?.age === "number" ? String(result.age) : "-";
  const rawExtractedText = result?.rawExtractedText || "";
  const normalizedText = rawExtractedText.replace(/\r\n/g, "\n").trim();
  const hasExtractedText = normalizedText.length > 0;
  const structuredText = hasExtractedText ? formatStructuredPreview(normalizedText) : "";
  const lineCount = hasExtractedText ? normalizedText.split("\n").length : 0;
  const charCount = hasExtractedText ? normalizedText.length : 0;
  const hasResult = Boolean(result);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-cyan-300 via-emerald-200 to-teal-500 px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-white/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-4 h-80 w-80 rounded-full bg-teal-50/35 blur-3xl" />

      <section className="mx-auto w-full max-w-4xl rounded-3xl border border-white/35 bg-white/20 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-900/70">
              Extractify
            </p>
            <h1 className="mt-2 text-3xl font-bold text-teal-950">Processing Results</h1>
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
            {!hasResult ? (
              <p className="rounded-lg border border-amber-300/50 bg-amber-50/70 px-3 py-2 text-sm text-amber-800">
                No processed result found. Upload a document first to view extracted text.
              </p>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-wide text-teal-800/80">Raw Extracted Text</p>
              {hasExtractedText ? (
                <div className="flex items-center gap-2 text-[11px] font-medium text-teal-900/80">
                  <span className="rounded-full border border-teal-800/15 bg-white/55 px-2 py-1">
                    {lineCount} lines
                  </span>
                  <span className="rounded-full border border-teal-800/15 bg-white/55 px-2 py-1">
                    {charCount} chars
                  </span>
                </div>
              ) : null}
            </div>

            <div className="mt-3 rounded-xl border border-teal-900/10 bg-white/55 p-4 shadow-inner">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-teal-800/70">
                Document Preview
              </p>
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-teal-950/5 p-3 font-mono text-[13px] leading-6 text-teal-950">
                {hasExtractedText
                  ? structuredText
                  : "No readable text detected. Try a clearer image or upload a PDF document."}
              </pre>
            </div>

            {hasExtractedText ? (
              <details className="mt-3 rounded-xl border border-teal-900/10 bg-white/45 p-3">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.12em] text-teal-900/70">
                  View Raw OCR Text
                </summary>
                <pre className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap rounded-lg bg-teal-950/5 p-3 font-mono text-[12px] leading-5 text-teal-950">
                  {normalizedText}
                </pre>
              </details>
            ) : null}
          </article>
        </div>
      </section>
    </main>
  );
}
