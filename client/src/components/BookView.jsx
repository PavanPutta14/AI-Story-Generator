import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { saveStory } from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './BookView.css';
import './StoryInput.css';

export default function BookView({ title: propTitle, story: propStory, moral: propMoral, prompt: propPrompt, isSaved: propIsSaved, onSave: onSaveProp }) {
  const location = useLocation();

  const isFromLocation = !!location.state && !!location.state.story;
  const currentTitle = isFromLocation ? location.state.title : propTitle;
  const currentStory = isFromLocation ? location.state.story : propStory;
  const currentMoral = isFromLocation ? location.state.moral : propMoral;
  const currentPrompt = isFromLocation ? location.state.prompt : propPrompt;
  const currentIsSaved = isFromLocation ? location.state.isSaved : propIsSaved;

  const [index, setIndex] = useState(0);
  const [pages, setPages] = useState([]);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [isSavedLocally, setIsSavedLocally] = useState(currentIsSaved);

  useEffect(() => {
    if (currentStory) {
      const rawParagraphs = currentStory.split('\n\n').filter(p => p.trim() !== '');
      const formattedPages = rawParagraphs.map((para) => `<p>${para.trim()}</p>`);
      setPages(formattedPages);
      setIndex(0);
    }
  }, [currentStory]);

  const leftPageIndex = index;
  const rightPageIndex = index + 1;

  const isFirstBookPage = index === 0;
  const isLastBookPage = rightPageIndex >= pages.length;

  function turnForward() {
    if (rightPageIndex < pages.length) {
      setIndex(i => i + 2);
    } else if (leftPageIndex < pages.length - 1) {
      setIndex(i => i + 1);
    }
  }

  function turnBackward() {
    if (index > 0) {
      setIndex(i => Math.max(0, i - 2));
    }
  }

  const handleSave = async () => {
    if (isSavedLocally) {
      alert('This story is already saved!');
      return;
    }
    if (!currentStory || !currentPrompt) {
      alert('Cannot save: Story or Prompt data is missing.');
      return;
    }

    try {
      if (onSaveProp) {
        await onSaveProp();
      } else {
        await saveStory({ prompt: currentPrompt, title: currentTitle, story: currentStory, moral: currentMoral });
        setShowSaveMessage(true);
        setIsSavedLocally(true);
        setTimeout(() => setShowSaveMessage(false), 3000);
      }
    } catch (e) {
      console.error('Save error', e);
      alert('Failed to save story. Please try again.');
    }
  };

  const renderPageContent = (pageIdx) => {
    if (pageIdx < 0 || pageIdx >= pages.length) {
      return '';
    }
    return <div dangerouslySetInnerHTML={{ __html: pages[pageIdx] }} className="story-text" />;
  };

  if (!currentStory) {
    return (
      <div className="book-error-message story-app-container">
        <nav className="navbar bg-dark justify-content-center title-bar">
          <h1 className="navbar-brand mb-0 text-white">AI Story Generator</h1>
        </nav>
        <div className="error-content">
          <p>No story data found. Please generate a story or select a saved story.</p>
          <button className="btn btn-primary generate-btn" onClick={() => window.location.href = '/'}>
            Go to Generator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="story-app-container">
      {isFromLocation && (
        <nav className="navbar bg-dark justify-content-center title-bar">
          <h1 className="navbar-brand mb-0 text-white" onClick={() => window.history.back()}>
            AI Story Generator
          </h1>
        </nav>
      )}

      {isFromLocation && (
        <div className="back-button-container-bookview" />
      )}

      <div className="book-wrap">
        <div className={`page left-page ${isFirstBookPage ? 'active' : ''}`} onClick={turnBackward}>
          {isFirstBookPage ? (
            <>
              <h2 className="story-title">{currentTitle || 'Your AI Story'}</h2>
              {renderPageContent(leftPageIndex)}
            </>
          ) : (
            renderPageContent(leftPageIndex)
          )}
        </div>

        <div className={`page right-page ${isLastBookPage ? 'last' : ''}`} onClick={turnForward}>
          {isLastBookPage ? (
            <>
              <h2 className="story-title">The End</h2>
              <div className="final-page-content">
                {pages[leftPageIndex + 1] && (
                  <div dangerouslySetInnerHTML={{ __html: pages[leftPageIndex + 1] }} className="story-text last-page-text" />
                )}
                <div className="moral-box">
                  <h3>Moral of the Story</h3>
                  <p>{currentMoral || 'No specific moral provided for this story.'}</p>
                  {!isSavedLocally && !isFromLocation && (
                    <button className="btn btn-success save-btn" onClick={handleSave}>Save Story</button>
                  )}
                </div>
              </div>
            </>
          ) : (
            renderPageContent(rightPageIndex)
          )}
        </div>
      </div>

      {showSaveMessage && (
        <div className="save-message">
          Story saved successfully!
        </div>
      )}
    </div>
  );
}
