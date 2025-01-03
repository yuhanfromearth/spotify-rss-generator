import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

router.get("/feed/:showId", (req, res) => {
  res.sendFile(path.join(__dirname), "../public/feed.html");
});

export default router;
