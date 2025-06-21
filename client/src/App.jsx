import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StoryInput from './components/StoryInput'; 
import SavedStoriesPage from './components/SavedStoriesPage'; 
import BookView from './components/BookView'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StoryInput />} />
        <Route path="/saved" element={<SavedStoriesPage />} />
        <Route path="/book" element={<BookView />} />
      </Routes>
    </Router>
  );
}

export default App;