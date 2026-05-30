import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredRect, setHoveredRect] = useState(null);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      const target = e.target.closest('button, a, .cursor-pointer');
      if (target) {
        setIsHovering(true);
        setHoveredRect(target.getBoundingClientRect());
      } else {
        setIsHovering(false);
        setHoveredRect(null);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-red-600 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden lg:block shadow-[0_0_20px_rgba(220,38,38,0.5)]"
        animate={{
          x: isHovering && hoveredRect ? hoveredRect.left + hoveredRect.width / 2 - 8 : mousePosition.x - 8,
          y: isHovering && hoveredRect ? hoveredRect.top + hoveredRect.height / 2 - 8 : mousePosition.y - 8,
          scale: isHovering && hoveredRect ? (Math.max(hoveredRect.width, hoveredRect.height) / 16) + 1 : 1,
          opacity: isHovering ? 0.3 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 15,
          mass: 0.1
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-red-500 rounded-full pointer-events-none z-[9998] hidden lg:block"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 25,
          mass: 0.5
        }}
      />
    </>
  );
};

export default CustomCursor;
