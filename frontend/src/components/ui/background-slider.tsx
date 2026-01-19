'use client';

import { useEffect, useState } from 'react';
import type React from 'react';

import Image from 'next/image';
import type { StaticImageData } from 'next/image';

interface BackgroundSliderProps {
  images: (string | StaticImageData)[];
  duration?: number;
  fadeDuration?: number;
  className?: string;
}

const BackgroundSlider = ({
  images,
  duration = 3000,
  fadeDuration = 2000,
  className = '',
}: BackgroundSliderProps) => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, duration);

    return () => clearInterval(interval);
  }, [images.length, duration]);

  if (images.length === 0) return null;

  return (
    <div className={`fixed inset-0 w-full h-screen -z-10 ${className}`}>
      {/* <div className="absolute inset-0 bg-black/60 z-10" /> */}

      {images.map((image, index) => (
        <div
          key={`slider-image-${index}`}
          className={`absolute inset-0 w-full h-full transition-opacity ease-in-out ${
            index === currentImage ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transitionDuration: `${fadeDuration}ms`,
          }}
        >
          <Image
            src={image}
            alt={`Background slide ${index + 1}`}
            fill
            priority={index === 0}
            className="object-cover w-full h-full"
            sizes="100vw"
          />
        </div>
      ))}
    </div>
  );
};

export default BackgroundSlider;
