import feedUpdater from "./updateFeeds.js";
import dbService from "./database.js";

try {
  await dbService.connect();
  console.log("Initializing Feed Updater Service...");
  await feedUpdater.initialize();
  const result = await feedUpdater.updateAllFeeds();
  console.log("Feed update job completed:", result);
} catch (error) {
  console.error("Error while running Feed Updater Service:", error);
}
