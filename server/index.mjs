import cors from "cors";
import express from "express";
import multer from "multer";

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

app.post("/api/upload", upload.single("file"), (req, res) => {
  const { firstName, lastName, dateOfBirth } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "File is required." });
  }

  if (!firstName || !lastName || !dateOfBirth) {
    return res.status(400).json({
      error: "firstName, lastName, and dateOfBirth are required.",
    });
  }

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
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Extractify API running on http://localhost:${port}`);
});
