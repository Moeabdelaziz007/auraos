
import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

const IMAGE_OPTIMIZATION_BASE_URL = 'https://firebasestorage.googleapis.com/v0/b/aios-97581.appspot.com/o/';

const OptimizedImage: React.FC<OptimizedImageProps> = ({ src, alt, width, height, className }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const optimizedSrc = `${IMAGE_OPTIMIZATION_BASE_URL}${encodeURIComponent(src)}?alt=media`;

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setError(true);
  };

  return (
    <div
      className={`relative ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {!loaded && !error && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width: `${width}px`, height: `${height}px` }}
        ></div>
      )}
      {error && (
        <div
          className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          Image not available
        </div>
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${error ? 'hidden' : ''}`}
      />
    </div>
  );
};

export default OptimizedImage;
