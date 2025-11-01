import { useState, useEffect } from 'react';

export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}