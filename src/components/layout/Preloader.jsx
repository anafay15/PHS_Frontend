import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Only run if not already shown in this session
    const seen = sessionStorage.getItem('studio_preloader_seen');
    if (seen) {
      if (onComplete) onComplete();
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDone(true);
            sessionStorage.setItem('studio_preloader_seen', 'true');
            if (onComplete) onComplete();
          }, 350);
          return 100;
        }
        // Random incremental tick
        const next = prev + Math.floor(Math.random() * 18) + 8;
        return next > 100 ? 100 : next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onComplete]);

  // If already seen, don't render preloader DOM
  if (sessionStorage.getItem('studio_preloader_seen')) {
    return null;
  }

  const titleWords = ['STUDIO', 'OPERATING', 'SYSTEM'];

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            y: '-100%',
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            backgroundColor: '#070708',
            color: '#f4f4f5',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '40px 48px',
            pointerEvents: 'all',
          }}
        >
          {/* Top Metadata */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '11px',
              letterSpacing: '0.1em',
              color: '#71717a',
              textTransform: 'uppercase',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#22c55e',
                  borderRadius: '50%',
                  display: 'inline-block',
                }}
              />
              CORE BOOT SEQUENCE // ACTIVE
            </div>
            <div>EDITION: AWAITED EDITORIAL</div>
          </div>

          {/* Center Mask-Revealed Typography */}
          <div style={{ margin: 'auto 0' }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px 24px',
                overflow: 'hidden',
              }}
            >
              {titleWords.map((word, i) => (
                <div key={word} style={{ overflow: 'hidden' }}>
                  <motion.h1
                    initial={{ y: '120%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: 0.15 + i * 0.12,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      fontFamily: 'var(--font-display, sans-serif)',
                      fontSize: 'clamp(2.5rem, 7vw, 6.5rem)',
                      fontWeight: 700,
                      letterSpacing: '-0.04em',
                      lineHeight: 0.95,
                      margin: 0,
                      color: i === 2 ? '#a1a1aa' : '#ffffff',
                    }}
                  >
                    {word}
                  </motion.h1>
                </div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '13px',
                letterSpacing: '0.04em',
                color: '#71717a',
                marginTop: '24px',
              }}
            >
              PHOTOGRAPHY & PRODUCTION BUSINESS MANAGEMENT INFRASTRUCTURE
            </motion.p>
          </div>

          {/* Bottom Telemetry Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '24px',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '11px',
                  color: '#52525b',
                  marginBottom: '4px',
                }}
              >
                BACKEND INTEGRATION: HTTP://LOCALHOST:3000
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '11px',
                  color: '#a1a1aa',
                }}
              >
                INITIALIZING PRISMA SCHEMA & JWT CHANNELS
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                  fontWeight: 600,
                  color: '#ffffff',
                  lineHeight: 1,
                }}
              >
                {progress}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
