import express from "express";
import { SpotifyService } from "../services/spotify.js";
import { RSSGenerator } from "../services/rss.js";
import Feed from "../models/Feed.js";
import config from "../config/config.js";

const router = express.Router();

const spotifyService = new SpotifyService(
  config.spotify.clientId,
  config.spotify.clientSecret,
);

await spotifyService.initialize();

const rssGenerator = new RSSGenerator(spotifyService);

router.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === "") {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }
    
    const shows = await spotifyService.searchShows(query);
    res.json({
      success: true,
      shows: shows.map(show => ({
        id: show.id,
        name: show.name,
        description: show.description?.substring(0, 100) + (show.description?.length > 100 ? "..." : ""),
        image: show.images?.[0]?.url,
        publisher: show.publisher
      }))
    });
  } catch (error) {
    console.error("Error searching shows:", error);
    res.status(500).json({ success: false, message: "Error searching for podcasts" });
  }
});

router.post("/api/feeds", async (req, res) => {
  try {
    const { showId } = req.body;
    let feed = await Feed.findOne({ showId });

    const needsUpdate = true; // const needsUpdate = !feed || Date.now() - feed.lastUpdated >= feed.updateFrequency;

    if (!needsUpdate) {
      console.log("Feed already exists in db.");
      return res.json({
        success: true,
        feedId: feed._id,
        showId: feed.showId,
      });
    }

    const rssFeed = await rssGenerator.generateFeed(showId);
    const show = await spotifyService.getShow(showId);

    if (!feed) {
      // If feed doesn't exist, create new one
      feed = new Feed({
        showId,
        title: show.name,
        description: show.description,
        show_link: show.external_urls.spotify,
        language: show.languages[0],
        image: show.images[0].url,
        copyright: show.copyrights?.[0]?.text ?? "no copyright information",
        rssFeed,
        lastUpdated: new Date(),
        episodes: show.episodes.items,
      });
    } else {
      // If feed exists, update its fields
      feed.title = show.name;
      feed.description = show.description;
      feed.show_link = show.external_urls.spotify;
      feed.language = show.languages[0];
      feed.image = show.images[0].url;
      feed.copyright = show.copyrights?.[0]?.text ?? "no copyright information";
      feed.rssFeed = rssFeed;
      feed.lastUpdated = new Date();
      feed.episodes = show.episodes.items;
    }

    await feed.save();

    res.json({
      success: true,
      feedId: feed._id,
      showId: feed.showId,
    });
  } catch (error) {
    console.log("Error generating feed:", error);
  }
});

router.get("/feed/:showId", async (req, res) => {
  try {
    const { showId } = req.params;
    const feed = await Feed.findOne({ showId });

    if (!feed) {
      return res.status(404).send("Oopsie, looks we couldn't find this feed.");
    }

    // render feed ejs template
    res.render("feed", {
      show_name: feed.title,
      show_description: feed.description,
      cover_image: feed.image,
      spotify_url: feed.show_link,
      showId: feed.showId,
      episodes: feed.episodes,
    });
  } catch (error) {
    console.error(error);
  }
});

router.get("/feed/:showId/rss", async (req, res) => {
  try {
    const { showId } = req.params;
    const feed = await Feed.findOne({ showId });

    if (!feed) {
      return res.status(404).send("Feed not found");
    }

    res.header("Content-Type", "application/xml");
    res.send(feed.rssFeed);
  } catch (error) {
    console.error("Error serving feed:", error);
    res.status(500).send("Error serving feed");
  }
});

export default router;
