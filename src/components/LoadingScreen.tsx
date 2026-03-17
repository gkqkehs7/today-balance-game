'use client';

import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  isLoaded: boolean;
}

export default function LoadingScreen({ isLoaded }: LoadingScreenProps) {
  const [hidden, setHidden] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setFading(true);
      const timer = setTimeout(() => {
        setHidden(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  if (hidden) return null;

  return (
    <div
      id="loading-screen"
      className={fading ? 'loading-screen-hidden' : ''}
    >
      <div className="loading-scene">
        <div className="loader-character">
          <div className="char-body">
            <div className="char-eye left"></div>
            <div className="char-eye right"></div>
            <div className="char-mouth"></div>
          </div>
          <div className="char-shadow"></div>
        </div>
        <p className="loading-text">
          불러오는 중
          <span className="dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      </div>
    </div>
  );
}
