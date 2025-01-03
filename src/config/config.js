import { configDotenv } from "dotenv";
configDotenv();

const requiredEnvVars = [
  "SPOTIFY_CLIENT_ID",
  "SPOTIFY_CLIENT_SECRET",
  "MONGODB_CLUSTER_PASSWORD",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const config = Object.freeze({
  mongodb: {
    uri: `mongodb+srv://mailyuhanmeyer:${process.env.MONGODB_CLUSTER_PASSWORD}@maincluster.w5v3s.mongodb.net/?retryWrites=true&w=majority&appName=MainCluster`,
  },
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  },
});

export default config;
