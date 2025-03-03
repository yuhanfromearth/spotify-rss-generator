import { Feed } from "feed";
import dotenv from "dotenv";
export class RSSGenerator {
  #spotifyService;

  constructor(spotifyService) {
    dotenv.config();
    this.spotifyService = spotifyService;
  }

  async generateFeed(showId) {
    const spotify_show = await this.spotifyService.getShow(showId);
    if (!spotify_show) {
      throw new Error(`Failed to fetch show data for ID: ${showId}`);
    }
    const title = spotify_show.name;
    const description = spotify_show.description;
    const link = spotify_show.href;
    const language = spotify_show.languages[0];
    const image = spotify_show.images[0].url;
    const copyright =
      spotify_show.copyrights?.[0]?.text ?? "no copyright information";

    const feed = new Feed({
      title: title,
      description: description,
      id: link,
      link: link,
      language: language, // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
      image: image,
      copyright: copyright,
    });

    const episodes_response = await this.spotifyService.getEpisodes(showId);
    if (!episodes_response || !episodes_response.items) {
      throw new Error(`Failed to fetch episodes for show ID: ${showId}`);
    }
    console.log(
      `Number of episodes found for show ${showId}: ${episodes_response.total}`,
    );
    const episodes = episodes_response.items;

    for (const episode of episodes) {
      if (!episode) {
        console.warn(`Skipping null episode in show ${showId}`);
        continue;
      }
      // Verify all required properties exist
      if (
        !episode.name ||
        !episode.description ||
        !episode.uri ||
        !episode.release_date
      ) {
        console.warn(`Skipping invalid episode in show ${showId}:`, {
          hasName: !!episode.name,
          hasDescription: !!episode.description,
          hasUri: !!episode.uri,
          hasReleaseDate: !!episode.release_date,
        });
        continue;
      }
      // Convert spotify:episode:xyz URI to proper web URL
      const episodeId = episode.uri.split(':').pop();
      const episodeUrl = `https://open.spotify.com/episode/${episodeId}`;
      
      const newItem = {
        title: episode.name,
        description: episode.description,
        link: episodeUrl,
        date: this.spotifyDateToJsDate(
          episode.release_date,
          episode.release_date_precision,
        ),
        image: episode.images && episode.images.length > 0 ? episode.images[0].url : undefined
      };
      feed.addItem(newItem);
    }

    const rss_feed = feed.rss2();

    return rss_feed;
  }

  spotifyDateToJsDate(release_date, precision) {
    switch (precision) {
      case "year":
        return new Date(release_date + "-01-01");
      case "month":
        return new Date(release_date + "-01");
      case "day":
        return new Date(release_date);
      default:
        throw new Error("Invalid precision: " + precision);
    }
  }

  async generateArtistAlbums() {
    console.log("rss generate artist album");
  }
}
