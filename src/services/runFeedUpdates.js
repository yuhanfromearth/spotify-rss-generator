import feedUpdater from "./updateFeeds.js";
import dbService from "./database.js";
import { configDotenv } from "dotenv";

// Load environment variables
configDotenv();

// Set a timeout for the entire script (25 minutes)
const TIMEOUT_MS = 25 * 60 * 1000;
const timeout = setTimeout(() => {
  console.error("Script timeout reached (25 minutes). Exiting...");
  process.exit(1);
}, TIMEOUT_MS);

try {
  await dbService.connect();
  console.log("Initializing Feed Updater Service...");
  await feedUpdater.initialize();
  const result = await feedUpdater.updateAllFeeds();
  console.log("Feed update job completed:", JSON.stringify(result, null, 2));
  clearTimeout(timeout);
  process.exit(0);
} catch (error) {
  console.error("Error while running Feed Updater Service:", error);
  clearTimeout(timeout);
  process.exit(1);
}
