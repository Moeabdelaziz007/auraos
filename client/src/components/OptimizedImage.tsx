
import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: React.ReactNode;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ src, alt, className, placeholder }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [src]);

  return isLoaded ? (
    <img src={src} alt={alt} className={className} />
  ) : (
    <div className={`placeholder ${className}`}>{placeholder}</div>
  );
};

export default OptimizedImage;
