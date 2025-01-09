import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import staticRoutes from "./routes/routes.js";
import feedRoutes from "./routes/feedRoutes.js";
import dbService from "./services/database.js";
import startScheduler from "./services/scheduler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/", staticRoutes);
app.use("/", feedRoutes);

try {
  await dbService.connect();
  await startScheduler();
  app.listen(PORT, () => {
    console.log(`Spotify RSS Feed Generator listening on port ${PORT}`);
  });
} catch (error) {
  console.error("Failed to initialize app:", error);
  process.exit(1);
}

export default app;
