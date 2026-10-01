import React, { useState } from 'react';
import MainPage from './pages/MainPage';

/**
 * Root Application Component
 * Manages active screen state ('main' | 'investigation' | 'rank')
 * and global detective clearance level.
 */
export default function App() {
  const [currentScreen, _setCurrentScreen] = useState('main');
  const [level, _setLevel] = useState(1);
  const [rank, _setRank] = useState('Rookie');

  return (
    <>
      {currentScreen === 'main' && (
        <MainPage 
          level={level} 
          rank={rank} 
          onStartCase={(target) => {
            console.log('Selected target repo:', target);
            // Will transition to 'investigation' once Section 2 and Case screen are wired
          }} 
        />
      )}
    </>
  );
}
