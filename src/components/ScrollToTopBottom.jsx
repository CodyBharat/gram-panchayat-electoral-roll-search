import React, { useState, useEffect } from 'react';

export default function ScrollToTopBottom() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  return (
    <div className="scroll-buttons-container">
      {isVisible && (
        <>
          <button className="scroll-btn scroll-top-btn" onClick={scrollToTop}>
            ↑
          </button>
          <button className="scroll-btn scroll-bottom-btn" onClick={scrollToBottom}>
            ↓
          </button>
        </>
      )}
    </div>
  );
}
