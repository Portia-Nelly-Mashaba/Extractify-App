import cors from "cors";
import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import sharp from "sharp";
import { PSM, createWorker } from "tesseract.js";

const app = express();
const port = Number(process.env.API_PORT || 4000);

const upload = multer({
  storage: multer.memoryStorage(),
});

app.use(cors());
app.use(express.json());

let ocrWorkerPromise = null;

function calculateAge(dateOfBirth) {
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

function isPdf(file) {
  return file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");
}

function isImage(file) {
  return file.mimetype.startsWith("image/");
}

function scoreExtractedText(text) {
  const normalized = (text || "").replace(/\s+/g, " ").trim();
  if (!normalized) return 0;

  const alphaNumericChars = (normalized.match(/[A-Za-z0-9]/g) || []).length;
  const wordCount = normalized.split(" ").filter(Boolean).length;
  const lineBreakBonus = ((text || "").match(/\n/g) || []).length;

  return alphaNumericChars + wordCount * 2 + lineBreakBonus;
}

function hasMeaningfulText(text, confidence) {
  const normalized = (text || "").replace(/\s+/g, " ").trim();
  if (!normalized) return false;

  const alphaNumericChars = (normalized.match(/[A-Za-z0-9]/g) || []).length;
  const wordsWithLetters = normalized
    .split(" ")
    .filter((word) => /[A-Za-z]{2,}/.test(word)).length;
  const wordsWithVowels = normalized
    .split(" ")
    .filter((word) => /[A-Za-z]{3,}/.test(word) && /[aeiouAEIOU]/.test(word)).length;
  const longWordCount = normalized
    .split(" ")
    .filter((word) => /[A-Za-z]{4,}/.test(word)).length;
  const hasDateLikePattern = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/.test(normalized);
  const hasEmailLikePattern = /\b\S+@\S+\.\S+\b/.test(normalized);
  const hasLongNumber = /\b\d{6,}\b/.test(normalized);

  const hasStrongSignal = hasDateLikePattern || hasEmailLikePattern || hasLongNumber;

  // Reject noisy OCR that is mostly short token fragments.
  if (alphaNumericChars < 25) return false;
  if (confidence < 40 && !hasStrongSignal) return false;

  return (
    hasStrongSignal ||
    (wordsWithLetters >= 5 && wordsWithVowels >= 2 && longWordCount >= 1)
  );
}

async function preprocessImageForOcr(buffer, mode) {
  const pipeline = sharp(buffer)
    .rotate()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .grayscale()
    .normalize();

  if (mode === "threshold") {
    return pipeline.threshold(150).toBuffer();
  }

  return pipeline.sharpen().toBuffer();
}

async function getOcrWorker() {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = (async () => {
      const worker = await createWorker("eng");
      await worker.setParameters({
        preserve_interword_spaces: "1",
      });
      return worker;
    })();
  }

  return ocrWorkerPromise;
}

async function runOcr(buffer, psmMode) {
  const worker = await getOcrWorker();
  await worker.setParameters({
    tessedit_pageseg_mode: String(psmMode),
    preserve_interword_spaces: "1",
  });

  const result = await worker.recognize(buffer);

  return {
    text: result?.data?.text?.trim() || "",
    confidence: Number(result?.data?.confidence || 0),
  };
}

async function extractTextFromImage(fileBuffer) {
  const baseBuffer = await preprocessImageForOcr(fileBuffer, "base");
  const primary = await runOcr(baseBuffer, PSM.SINGLE_BLOCK);

  // Fast path: keep latency low when first pass is already good.
  if (hasMeaningfulText(primary.text, primary.confidence) && primary.confidence >= 55) {
    return primary.text;
  }

  const thresholdBuffer = await preprocessImageForOcr(fileBuffer, "threshold");
  const fallbackCandidates = [
    primary,
    await runOcr(baseBuffer, PSM.SPARSE_TEXT),
    await runOcr(thresholdBuffer, PSM.SINGLE_BLOCK),
  ];

  const bestCandidate =
    fallbackCandidates.sort((a, b) => {
      const aScore = scoreExtractedText(a.text) + a.confidence * 2;
      const bScore = scoreExtractedText(b.text) + b.confidence * 2;
      return bScore - aScore;
    })[0] || null;

  if (!bestCandidate) return "";
  if (!hasMeaningfulText(bestCandidate.text, bestCandidate.confidence)) return "";

  return bestCandidate.text;
}

async function extractRawText(file) {
  if (isPdf(file)) {
    const result = await pdfParse(file.buffer);
    return result.text?.trim() || "";
  }

  if (isImage(file)) {
    return extractTextFromImage(file.buffer);
  }

  throw new Error("Unsupported file type. Please upload a PDF or image file.");
}

app.post("/api/upload", upload.single("file"), async (req, res) => {
  const { firstName, lastName, dateOfBirth } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "File is required." });
  }

  if (!firstName || !lastName || !dateOfBirth) {
    return res.status(400).json({
      error: "firstName, lastName, and dateOfBirth are required.",
    });
  }

  const age = calculateAge(dateOfBirth);
  if (age === null) {
    return res.status(400).json({
      error: "dateOfBirth must be a valid date in YYYY-MM-DD format.",
    });
  }

  try {
    const rawExtractedText = await extractRawText(req.file);
    const fullName = `${String(firstName).trim()} ${String(lastName).trim()}`.trim();

    return res.status(200).json({
      fullName,
      age,
      rawExtractedText,
    });
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to extract text from file.",
    });
  }
});

app.listen(port, () => {
  console.log(`Extractify API running on http://localhost:${port}`);
});
