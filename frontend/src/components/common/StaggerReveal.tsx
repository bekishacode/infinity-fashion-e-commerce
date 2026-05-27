import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface StaggerRevealProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  once?: boolean;
}

const StaggerReveal: React.FC<StaggerRevealProps> = ({
  children,
  className = '',
  staggerDelay = 0.1,
  direction = 'up',
  once = true,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.2 });

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.2,
      },
    },
  };

  // Child animation based on direction
  const getChildVariants = () => {
    const baseHidden = { opacity: 0 };
    switch (direction) {
      case 'up': return { hidden: { ...baseHidden, y: 40 }, visible: { y: 0, opacity: 1 } };
      case 'down': return { hidden: { ...baseHidden, y: -40 }, visible: { y: 0, opacity: 1 } };
      case 'left': return { hidden: { ...baseHidden, x: -40 }, visible: { x: 0, opacity: 1 } };
      case 'right': return { hidden: { ...baseHidden, x: 40 }, visible: { x: 0, opacity: 1 } };
      default: return { hidden: baseHidden, visible: { opacity: 1 } };
    }
  };

  const childVariants = getChildVariants();

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={childVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StaggerReveal;