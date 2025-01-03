import mongoose from "mongoose";
import config from "../config/config.js";

class DatabaseService {
  constructor() {
    this.connect();
  }

  async connect() {
    try {
      mongoose.connect(config.mongodb.uri);
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    }
  }
}

export default new DatabaseService();
