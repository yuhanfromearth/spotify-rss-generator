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
    const episodes = episodes_response.items;

    for (const episode of episodes) {
      const newItem = {
        title: episode.name,
        description: episode.description,
        link: episode.uri,
        date: this.spotifyDateToJsDate(
          episode.release_date,
          episode.release_date_precision,
        ),
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
