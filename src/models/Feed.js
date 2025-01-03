import mongoose from "mongoose";
const { Schema, model } = mongoose;

const FeedSchema = new mongoose.Schema({
  showId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  show_link: {
    type: String,
  },
  language: {
    type: String,
  },
  image: {
    type: String,
  },
  copyright: {
    type: String,
  },
  episodes: [
    {
      type: Object,
    },
  ],
  rssFeed: {
    type: String,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  updateFrequency: {
    type: Number,
    default: 7200000, // 2 hours in milliseconds
  },
  lastEpisodeDate: {
    type: Date,
  },
});

const Feed = model("Feed", FeedSchema);
export default Feed;
