import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorText, setCursorText] = useState('');

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth springs for fluid, physics-based momentum
  const springConfig = { damping: 28, stiffness: 350, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Only enable custom cursor if pointing device is fine (mouse/trackpad, not touch)
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    document.body.classList.add('has-custom-cursor');

    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseOver = (e) => {
      const target = e.target.closest(
        'button, a, input, select, textarea, [role="button"], tr, [data-cursor]'
      );
      if (target) {
        setIsHovered(true);
        const customLabel = target.getAttribute('data-cursor-text');
        setCursorText(customLabel || '');
      } else {
        setIsHovered(false);
        setCursorText('');
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.body.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 99999,
        pointerEvents: 'none',
        mixBlendMode: 'difference',
      }}
    >
      {/* Outer Hollow Circle / Ring */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          position: 'fixed',
          top: 0,
          left: 0,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovered ? 48 : 28,
          height: isHovered ? 48 : 28,
          borderColor: '#ffffff',
          borderWidth: isHovered ? 2 : 1,
          backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="rounded-full flex items-center justify-center"
        style={{
          x: smoothX,
          y: smoothY,
          position: 'fixed',
          top: 0,
          left: 0,
          translateX: '-50%',
          translateY: '-50%',
          borderRadius: '50%',
          borderStyle: 'solid',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '9px',
          fontFamily: 'var(--font-mono, monospace)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {cursorText && <span>{cursorText}</span>}
      </motion.div>

      {/* Center Precise Dot */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          position: 'fixed',
          top: 0,
          left: 0,
          translateX: '-50%',
          translateY: '-50%',
          width: 4,
          height: 4,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
        }}
        animate={{
          scale: isHovered ? 0 : 1,
          opacity: isHovered ? 0 : 1,
        }}
      />
    </div>
  );
}
