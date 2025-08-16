'use client';
import React, { useEffect, useState } from 'react';
import { FaArrowUp } from 'react-icons/fa';

export default function ScrollToTop({}) {
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const pageHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent = (scrollY / pageHeight) * 100;

      setScrollPercent(percent);
      setShowScrollToTop(scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      onClick={scrollToTop}
      className={`fixed cursor-pointer z-40 bottom-6 right-6 sm:bottom-8 sm:right-8 
    overflow-visible text-white p-[2px] rounded-full
    ${
      showScrollToTop
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-full'
    } transition-all duration-500`}
    >
      <div className="relative w-14 h-14">
        {/* Scroll ring */}
        <svg
          className="absolute top-0 left-0 rotate-[-90deg]"
          width="56"
          height="56"
        >
          <circle
            cx="28"
            cy="28"
            r="25"
            stroke={'#b5e761'}
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx="28"
            cy="28"
            r="25"
            stroke={'#08bcc7'}
            strokeWidth="3.2"
            fill="none"
            strokeDasharray={2 * Math.PI * 25}
            strokeDashoffset={
              2 * Math.PI * 25 - (scrollPercent / 100) * 2 * Math.PI * 25 + 1 ||
              50
            }
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.2s ease-out',
            }}
          />
        </svg>

        {/* Arrow icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f87e47] rounded-full text-base p-4">
          <FaArrowUp className="bounce" />
        </div>
      </div>
    </div>
  );
}
