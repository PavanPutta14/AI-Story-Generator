import express from 'express';
import { generateStory, getStories, saveStory } from '../controllers/storyController.js';

const router = express.Router();

router.post('/generate', generateStory);
router.get('/all', getStories);
router.post('/save', saveStory);

export default router;