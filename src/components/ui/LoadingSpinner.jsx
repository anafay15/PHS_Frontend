import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'QUERYING DATA REGISTRY...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        gap: '16px',
      }}
    >
      <Loader2
        size={24}
        color="#a1a1aa"
        style={{ animation: 'spin 1s linear infinite' }}
      />
      <span
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          letterSpacing: '0.12em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
        }}
      >
        {text}
      </span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
