import cors from "cors";
import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import Tesseract from "tesseract.js";

const app = express();
const port = Number(process.env.API_PORT || 4000);

const upload = multer({
  storage: multer.memoryStorage(),
});

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

function isPdf(file) {
  return file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");
}

function isImage(file) {
  return file.mimetype.startsWith("image/");
}

async function extractRawText(file) {
  if (isPdf(file)) {
    const result = await pdfParse(file.buffer);
    return result.text?.trim() || "";
  }

  if (isImage(file)) {
    const result = await Tesseract.recognize(file.buffer, "eng");
    return result.data?.text?.trim() || "";
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

  try {
    const rawExtractedText = await extractRawText(req.file);

    return res.status(200).json({
      message: "Upload received successfully.",
      file: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
      input: {
        firstName,
        lastName,
        dateOfBirth,
      },
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
