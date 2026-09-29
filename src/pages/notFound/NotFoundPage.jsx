import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import CustomCursor from '../../components/layout/CustomCursor';
import CanvasBackground from '../../components/layout/CanvasBackground';

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: '#080808',
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
      }}
    >
      <CustomCursor />
      <CanvasBackground />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '500px',
        }}
      >
        <span
          className="editorial-tag"
          style={{
            color: '#ef4444',
            display: 'inline-block',
            marginBottom: '12px',
          }}
        >
          ERROR CODE // 404 NOT FOUND
        </span>

        <h1
          style={{
            fontFamily: 'var(--font-display, sans-serif)',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            margin: '0 0 16px',
            color: '#ffffff',
          }}
        >
          Uncharted Coordinate
        </h1>

        <p
          style={{
            color: '#a1a1aa',
            fontSize: '14px',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}
        >
          The requested path does not map to any recognized module or registry in Studio OS.
        </p>

        <Link to="/dashboard" className="studio-btn studio-btn-primary">
          <ArrowLeft size={14} /> Return to Operating Dashboard
        </Link>
      </div>
    </div>
  );
}
