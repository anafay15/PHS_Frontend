import { Plus, Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'No records found',
  description = 'There are no active entries in this registry.',
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 32px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '2px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          marginBottom: '20px',
        }}
      >
        <Icon size={24} />
      </div>

      <span
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-muted)',
          marginBottom: '8px',
        }}
      >
        DATABASE STATE // ZERO ENTRIES
      </span>

      <h4
        style={{
          fontFamily: 'var(--font-display, sans-serif)',
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '8px',
        }}
      >
        {title}
      </h4>

      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '13px',
          maxWidth: '420px',
          lineHeight: 1.6,
          marginBottom: actionLabel && onAction ? '24px' : '0',
        }}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="studio-btn studio-btn-primary"
        >
          <Plus size={14} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
