import SpotifyWebApi from "spotify-web-api-node";

export class SpotifyService {
  spotify;

  constructor(clientId, clientSecret) {
    this.spotify = new SpotifyWebApi({
      clientId,
      clientSecret,
    });
  }

  async initialize() {
    const data = await this.spotify.clientCredentialsGrant();
    this.spotify.setAccessToken(data.body.access_token);
  }

  async getShow(showId) {
    const data = await this.spotify.getShow(showId);
    return data.body;
  }

  async getEpisodes(showId) {
    const data = await this.spotify.getShowEpisodes(showId);
    return data.body;
  }
  
  async searchShows(query, limit = 5) {
    const data = await this.spotify.searchShows(query, { limit });
    return data.body.shows.items;
  }
}
