import React, { useEffect } from 'react';

// Type declaration for the Furnisher widget
declare global {
  interface Window {
    Furnisher?: {
      init: (selector: string) => void;
    };
  }
}

export default function Furnisher() {
  useEffect(() => {
    // Load CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = '/furnisher.css';
    document.head.appendChild(cssLink);

    // Load JS
    const script = document.createElement('script');
    script.src = '/furnisher-widget.js';
    script.onload = () => {
      // Initialize the widget once the script is loaded
      if (window.Furnisher) {
        window.Furnisher.init('#furnisher-root');
      }
    };
    document.head.appendChild(script);

    // Cleanup
    return () => {
      document.head.removeChild(cssLink);
      document.head.removeChild(script);
    };
  }, []);

  return <div id="furnisher-root"></div>;
}