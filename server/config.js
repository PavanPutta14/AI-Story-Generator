import dotenv from 'dotenv';
dotenv.config();

export const config = {
  openaiKey: process.env.OPENAI_KEY,
  mongoUri: process.env.MONGO_URI
};