import axios from 'axios';
import Story from '../models/Story.js';

const cleanMarkdown = (text) => {
  if (!text) return ''; 
  let cleanText = text;
  cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, '$1');
  cleanText = cleanText.replace(/\*(.*?)\*/g, '$1');
  cleanText = cleanText.replace(/###?\s*/g, '');
  cleanText = cleanText.replace(/^-+\s*$/gm, '');
  cleanText = cleanText.replace(/^-?\s*[*-]\s*/gm, '');
  cleanText = cleanText.replace(/\n\s*\n/g, '\n\n');
  cleanText = cleanText.trim();
  return cleanText;
};

export const generateStory = async (req, res) => {
  const { prompt } = req.body;

  const detailedPrompt = `Generate a captivating story with a clear title and a moral.
Start your response with "Story Title: [Your Story Title Here]".
Then, on a new line, write a compelling and engaging short story based on the following premise. Focus on character development, a clear plot with a beginning, middle, and end, and a consistent tone. The story should be at least 300 words long. Ensure the story is suitable for all ages.

Premise: "${prompt}"

After the story, on a completely new line, provide a clear and concise "Moral of the Story: [Your Moral Here]".

Please ensure the output is a coherent narrative and not just a list of ideas or random text. Do not use any Markdown formatting characters like asterisks (*), hash symbols (#), or underscores (_) in the story text itself. Keep the language simple and direct.`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1:free',
        messages: [{ role: 'user', content: detailedPrompt }],
        temperature: 0.7,
        max_tokens: 1500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Title': 'AI-Story-Generator',
        },
      }
    );

    const fullContent = response.data.choices[0].message.content;
    console.log("--- Full AI Response Start ---");
    console.log(fullContent);
    console.log("--- Full AI Response End ---");

    const titleSeparator = "Story Title:";
    const moralSeparator = "Moral of the Story:";

    let storyTitle = 'A Generated Story';
    let storyText = '';
    let moralText = 'No specific moral provided.';

    let contentToParse = fullContent;

    const titleRegex = new RegExp(`^${titleSeparator}\\s*(.*?)(?=\\n\\n|\\n${moralSeparator}|$)`, 'm');
    let titleMatch = contentToParse.match(titleRegex);

    if (titleMatch && titleMatch[1]) {
      storyTitle = titleMatch[1].trim();
      contentToParse = contentToParse.replace(titleMatch[0], '').trim();
    } else {
      const firstLine = contentToParse.split('\n')[0];
      const secondLineStarts = contentToParse.indexOf('\n\n');

      if (firstLine && secondLineStarts !== -1 && secondLineStarts < (firstLine.length + 5) && firstLine.length < 100) {
        storyTitle = firstLine.trim();
        contentToParse = contentToParse.substring(firstLine.length).trim();
      } else {
        storyText = contentToParse;
        contentToParse = '';
      }
    }
    console.log("DEBUG: Extracted raw title:", storyTitle);
    console.log("DEBUG: Content after initial title extraction (start):\n", contentToParse.substring(0, Math.min(100, contentToParse.length)) + '...');

    if (contentToParse.includes(moralSeparator)) {
      const parts = contentToParse.split(moralSeparator, 2);
      storyText = parts[0].trim();
      moralText = parts[1].trim();
    } else if (storyText === '') {
        storyText = contentToParse.trim();
    }
    console.log("DEBUG: Extracted raw story (start):\n", storyText.substring(0, Math.min(100, storyText.length)) + '...');
    console.log("DEBUG: Extracted raw moral:", moralText);

    storyTitle = cleanMarkdown(storyTitle);
    storyText = cleanMarkdown(storyText);
    moralText = cleanMarkdown(moralText);

    if (!storyTitle || storyTitle.toLowerCase().includes('your story title here') || storyTitle.length < 5) {
      storyTitle = 'A Generated Story';
    }

    console.log("DEBUG: Cleaned title:", storyTitle);
    console.log("DEBUG: Cleaned story (start):", storyText.substring(0, Math.min(100, storyText.length)));
    console.log("DEBUG: Cleaned moral:", moralText);

    if (!storyText || storyText.trim().length < 100) {
      console.warn('Generated story is too short or empty. Consider adjusting prompt or model parameters.');
      return res.status(500).json({ error: 'Failed to generate a meaningful story. Please try a different prompt.' });
    }

    res.status(200).json({ title: storyTitle, story: storyText, moral: moralText });
  } catch (error) {
    console.error('OpenRouter API Error:', error.message);
    if (error.response) {
      console.error('OpenRouter API Response Data:', error.response.data);
      console.error('OpenRouter API Response Status:', error.response.status);
    }
    res.status(500).json({ error: 'Failed to generate story. Please check API key, ensure the backend is running, and try again.' });
  }
};

export const getStories = async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.status(200).json(stories);
  } catch (error) {
    console.error('Failed to fetch stories:', error.message);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
};

export const saveStory = async (req, res) => {
  const { prompt, title, story, moral } = req.body;
  try {
    const newStory = new Story({ prompt, title, story, moral });
    await newStory.save();
    res.status(201).json({ message: 'Story saved successfully!', story: newStory });
  } catch (error) {
      console.error('Failed to save story:', error.message);
      if (error.code === 11000) { 
          res.status(409).json({ error: 'Story with this title and prompt already exists.' });
      } else {
          res.status(500).json({ error: 'Failed to save story' });
      }
  }
};


