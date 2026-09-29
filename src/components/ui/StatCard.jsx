export default function StatCard({
  tag = 'METRIC',
  label,
  value,
  subtitle,
  icon: Icon,
}) {
  return (
    <div
      className="studio-card"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Tag & Optional Icon */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <span className="editorial-tag">{tag}</span>
        {Icon && (
          <div style={{ color: 'var(--text-muted)' }}>
            <Icon size={16} />
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div style={{ marginBottom: '8px' }}>
        <div
          style={{
            fontFamily: 'var(--font-display, sans-serif)',
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            lineHeight: 1.1,
          }}
        >
          {value !== undefined && value !== null ? value : '—'}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginTop: '4px',
          }}
        >
          {label}
        </div>
      </div>

      {/* Subtitle / Telemetry */}
      {subtitle && (
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '12px',
            marginTop: '8px',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}
