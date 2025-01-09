import Feed from "../models/Feed.js";
import { SpotifyService } from "./spotify.js";
import { RSSGenerator } from "./rss.js";
import config from "../config/config.js";
import { setTimeout } from "timers/promises";

class FeedUpdaterService {
  constructor() {
    this.isRunning = false;
    this.updateInterval = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    this.spotifyService = new SpotifyService(
      config.spotify.clientId,
      config.spotify.clientSecret,
    );
    this.rssGenerator = new RSSGenerator(this.spotifyService);
  }

  async initialize() {
    await this.spotifyService.initialize();
  }

  async updateFeed(feed) {
    try {
      const show = await this.spotifyService.getShow(feed.showId);
      const rssFeed = await this.rssGenerator.generateFeed(feed.showId);

      // Update feed data
      feed.title = show.name;
      feed.description = show.description;
      feed.show_link = show.external_urls.spotify;
      feed.language = show.languages[0];
      feed.image = show.images[0].url;
      feed.copyright = show.copyrights?.[0]?.text ?? "no copyright information";
      feed.rssFeed = rssFeed;
      feed.lastUpdated = new Date();
      feed.episodes = show.episodes.items;

      // Save updated feed
      await feed.save();

      console.log(`Updated feed for show: ${feed.showId}`);
      return feed;
    } catch (error) {
      console.error(`Error updating feed ${feed.showId}:`, error);
      throw error;
    }
  }

  async updateAllFeeds() {
    if (this.isRunning) {
      console.log("Update job is already running");
      return { success: false, message: "Update job is already running" };
    }

    this.isRunning = true;
    console.log("Starting feed update job");

    try {
      // Find all feeds that need updating
      const feeds = await Feed.find({
        $or: [
          { lastUpdated: { $lt: new Date(Date.now() - 2 * 60 * 60 * 1000) } },
          { lastUpdated: { $exists: false } },
        ],
      });

      console.log(`Found ${feeds.length} feeds to update`);

      const results = {
        total: feeds.length,
        updated: 0,
        failed: 0,
        errors: [],
      };

      // Update feeds with a small delay between each to avoid rate limiting
      for (const feed of feeds) {
        try {
          await this.updateFeed(feed);
          results.updated++;
          await setTimeout(1000); // 1 second delay between updates
        } catch (error) {
          results.failed++;
          results.errors.push({
            showId: feed.showId,
            error: error.message,
          });
        }
      }

      console.log("Completed feed update job");
      return { success: true, results };
    } catch (error) {
      console.error("Error in feed update job:", error);
      return { success: false, error: error.message };
    } finally {
      this.isRunning = false;
    }
  }

  async updateSingleShow(showId) {
    try {
      // Find the specific feed
      const feed = await Feed.findOne({ showId: showId });

      if (!feed) {
        throw new Error(`No feed found for show ID: ${showId}`);
      }

      // Update the feed
      await this.updateFeed(feed);

      console.log(`Successfully updated feed for show: ${showId}`);
      return feed;
    } catch (error) {
      console.error(`Error updating show ${showId}:`, error);
      throw error;
    }
  }

  startUpdateJob() {
    // Run initial update
    this.updateAllFeeds();

    // Schedule recurring updates
    setInterval(() => {
      this.updateAllFeeds();
    }, this.updateInterval);

    console.log("Feed update job scheduled");
  }
}

export default new FeedUpdaterService();
