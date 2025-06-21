import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/story';

export const generateStory = async (prompt) => {
  const res = await axios.post(`${BASE_URL}/generate`, { prompt });
  return res.data;
};

export const saveStory = async ({ prompt, title, story, moral }) => {
  const res = await axios.post(`${BASE_URL}/save`, { prompt, title, story, moral });
  return res.data;
};

export const getStories = async () => {
  const res = await axios.get(`${BASE_URL}/all`);
  return res.data;
};