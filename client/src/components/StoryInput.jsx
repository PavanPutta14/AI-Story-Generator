import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateStory, saveStory } from '../api';
import BookView from './BookView';
import 'bootstrap/dist/css/bootstrap.min.css';
import './StoryInput.css';

export default function StoryInput() {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [moral, setMoral] = useState('');
  const [submitError, setSubmitError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  const navigate = useNavigate();

  async function handleGenerate() {
    if (!prompt.trim()) {
      setSubmitError(true);
      return;
    }

    setSubmitError(false);
    setLoading(true);
    setGenerationError('');
    setTitle('');
    setStory('');
    setMoral('');

    try {
      const res = await generateStory(prompt);
      setTitle(res.title || 'A Generated Story');
      setStory(res.story);
      setMoral(res.moral || 'No specific moral provided.');
    } catch (e) {
      console.error('Generate error', e);
      setGenerationError('Failed to generate story. Please try again.');
      setTitle('');
      setStory('');
      setMoral('');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveGeneratedStory = async () => {
    if (!story || !prompt) {
      alert('Cannot save: No story generated yet.');
      return;
    }
    try {
      await saveStory({ prompt, title, story, moral });
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 3000);
    } catch (e) {
      console.error('Save error', e);
      alert('Failed to save story. Please try again.');
    }
  };

  return (
    <div className="story-app-container">
      <nav className="navbar bg-dark justify-content-center title-bar">
        <h1 className="navbar-brand mb-0 text-white">AI Story Generator</h1>
      </nav>

      <div className="input-area-container">
        <textarea
          className={`form-control ${submitError ? 'is-invalid' : ''}`}
          placeholder="Enter your story prompt..."
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            if (submitError) setSubmitError(false);
          }}
        />
        {submitError && <div className="invalid-feedback">Please enter your prompt</div>}

        <div className="button-group">
          <button className="btn btn-primary generate-btn" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Story'}
          </button>
          <button className="btn btn-secondary saved-stories-btn" onClick={() => navigate('/saved')} disabled={loading}>
            Saved Stories
          </button>
        </div>

        {loading && (
          <div className="loading-indicator">
            <div className="spinner-border text-primary" role="status" />
            <p>Generating story…</p>
          </div>
        )}

        {generationError && (
          <div className="generation-error-message">
            <p>{generationError}</p>
          </div>
        )}
      </div>

      {!loading && story && !generationError && (
        <BookView
          title={title}
          story={story}
          moral={moral}
          prompt={prompt}
          isSaved={false}
          onSave={handleSaveGeneratedStory}
        />
      )}

      {showSaveMessage && (
        <div className="save-message">
          Story saved successfully!
        </div>
      )}
    </div>
  );
}
