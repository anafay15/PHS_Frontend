import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Wifi, Terminal } from 'lucide-react';
import { API_BASE_URL } from '../../api/axios';

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}:${seconds}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format path into editorial breadcrumb title
  const getPageTitle = (pathname) => {
    const clean = pathname.replace(/^\//, '');
    if (!clean) return 'DASHBOARD';
    const segments = clean.split('/');
    if (segments.length > 1) {
      return `${segments[0].toUpperCase()} // ${segments[1].toUpperCase()}`;
    }
    return segments[0].toUpperCase();
  };

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'rgba(8, 8, 8, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: '2px',
            color: '#d4d4d8',
            padding: '6px',
            cursor: 'pointer',
            display: 'none',
          }}
          className="topbar-menu-btn"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>

        {/* Current Module Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={14} color="#71717a" />
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '12px',
              letterSpacing: '0.08em',
              fontWeight: 600,
              color: '#f4f4f5',
            }}
          >
            {getPageTitle(location.pathname)}
          </span>
        </div>
      </div>

      {/* Right Telemetry Information */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* API Host Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '2px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            color: '#a1a1aa',
          }}
          className="hidden md:flex"
        >
          <Wifi size={12} color="#22c55e" />
          <span>API: {API_BASE_URL.replace(/^https?:\/\//, '')}</span>
        </div>

        {/* Live Studio Clock */}
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '12px',
            letterSpacing: '0.08em',
            color: '#e4e4e7',
            background: '#121214',
            padding: '4px 12px',
            border: '1px solid var(--border-subtle)',
            borderRadius: '2px',
          }}
        >
          {timeStr || '00:00:00'}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .topbar-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
