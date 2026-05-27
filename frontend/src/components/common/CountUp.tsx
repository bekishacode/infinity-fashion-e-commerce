import React, { useState, useEffect, useRef } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

const CountUp: React.FC<CountUpProps> = ({ end, duration = 2, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          let startTime: number | null = null;
          let animationFrame: number;
          const startValue = 0;
          const endValue = end;

          const updateCount = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
            const currentCount = Math.floor(progress * (endValue - startValue) + startValue);
            setCount(currentCount);
            
            if (progress < 1) {
              animationFrame = requestAnimationFrame(updateCount);
            }
          };

          animationFrame = requestAnimationFrame(updateCount);
          
          return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
          };
        }
      },
      { threshold: 0.3, rootMargin: '0px' }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [end, duration, hasAnimated]);

  const displayValue = count.toLocaleString();

  return (
    <span ref={elementRef}>
      {prefix}{displayValue}{suffix}
    </span>
  );
};

export default CountUp;