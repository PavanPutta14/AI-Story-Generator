import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStories } from '../api';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './SavedStoriesPage.css';

export default function SavedStoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      setError('');
      try {
        const fetchedStories = await getStories();
        setStories(fetchedStories);
      } catch (err) {
        console.error('Failed to fetch saved stories:', err);
        setError('Failed to load saved stories. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  const handleViewStory = (story) => {
    navigate('/book', { state: { ...story, isSaved: true } });
  };

  return (
    <div className="story-app-container"> 
      <nav className="navbar bg-dark justify-content-center title-bar">
        <h1 className="navbar-brand mb-0 text-white" onClick={() => navigate('/')}>
          AI Story Generator 
        </h1>
      </nav>

      <div className="saved-stories-content-wrap"> 
        <div className="saved-stories-header">
          <h2>Your Saved Stories</h2>
        </div>

        {loading && (
          <div className="loading-indicator">
            <div className="spinner-border text-primary" role="status" />
            <p>Loading saved stories…</p>
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && stories.length === 0 && !error && (
          <div className="no-stories-message">
            <p>No stories saved yet. Generate one and click 'Save Story'!</p>
          </div>
        )}

        <div className="story-cards-grid">
          {!loading && !error && stories.map(story => (
            <div className="story-card" key={story._id} onClick={() => handleViewStory(story)}>
              <h3 className="card-title">{story.title || 'Untitled Story'}</h3>
              <p className="card-prompt">Prompt: "{story.prompt.substring(0, 70)}..."</p>
              <p className="card-moral">Moral: {story.moral || 'N/A'}</p>
              <button className="btn btn-primary view-story-btn">View Story</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
