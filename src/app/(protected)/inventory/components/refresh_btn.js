import { useState, useEffect, useRef } from 'react';
import { IoSync } from 'react-icons/io5';

export default function RefreshButton({ loading, failedtoRefresh, onClick }) {
  const [rotation, setRotation] = useState(0);
  const animRef = useRef(null);

  const isSpinning = loading;

  useEffect(() => {
    if (isSpinning) {
      let lastTime = performance.now();
      const spin = (time) => {
        const delta = time - lastTime;
        lastTime = time;
        setRotation((r) => (r + delta * 0.3) % 360); // smooth increment
        animRef.current = requestAnimationFrame(spin);
      };
      animRef.current = requestAnimationFrame(spin);
    } else {
      // Ease out on stop
      let startRotation;
      let startTime;
      const easeOut = (time) => {
        if (!startTime) {
          startTime = time;
          startRotation = rotation;
        }
        const progress = Math.min((time - startTime) / 500, 1); // 0.5s ease
        const easedProgress = 1 - Math.pow(1 - progress, 3); // cubic ease-out
        setRotation(startRotation + easedProgress * 90); // finish ~quarter turn
        if (progress < 1) {
          animRef.current = requestAnimationFrame(easeOut);
        }
      };
      animRef.current = requestAnimationFrame(easeOut);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isSpinning]);

  return (
    <button
      onClick={onClick}
      disabled={isSpinning}
      className={`flex gap-2 items-center justify-center text-sm font-semibold px-3 py-1.5 rounded-md border transition-all duration-300 disabled:cursor-not-allowed disabled:bg-green-200 disabled:shadow-none ${
        failedtoRefresh
          ? 'bg-red-100 hover:bg-red-200 text-red-800 border-red-300'
          : 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300'
      }`}
    >
      <span className="hidden md:inline">Refresh</span>
      <IoSync
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'none' : 'transform 0.5s ease-out',
        }}
      />
    </button>
  );
}
