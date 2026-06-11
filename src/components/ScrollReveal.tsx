import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
}

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.6
}: ScrollRevealProps) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Keep component mounted once it's triggered
        }
      },
      {
        rootMargin: '0px 0px -120px 0px', // Trigger only once the top enters well inside the viewport
        threshold: 0.1,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const directions = {
    up: { y: 45, x: 0 },
    down: { y: -45, x: 0 },
    left: { y: 0, x: 45 },
    right: { y: 0, x: -45 },
    none: { y: 0, x: 0 }
  };

  return (
    <div ref={containerRef} className="w-full">
      <motion.div
        className={className}
        initial={{ 
          opacity: 0, 
          y: directions[direction].y, 
          x: directions[direction].x 
        }}
        animate={isInView ? { 
          opacity: 1, 
          y: 0, 
          x: 0 
        } : {
          opacity: 0,
          y: directions[direction].y,
          x: directions[direction].x
        }}
        transition={{ 
          duration: duration * 1.8, // Slow down the default duration multiplier beautifully 
          delay: delay + 0.15, // Let it settle organic moments later
          ease: [0.16, 1, 0.3, 1] // Custom ultra-smooth easeOutQuint curve
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
