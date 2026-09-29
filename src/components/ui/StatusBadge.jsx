export default function StatusBadge({ status, type = 'default' }) {
  if (!status) return null;

  const getStyle = (statusStr) => {
    const s = String(statusStr).toUpperCase();
    switch (s) {
      case 'BOOKED':
      case 'PAID':
      case 'APPROVED':
      case 'COMPLETED':
      case 'AVAILABLE':
      case 'NEW':
        return {
          bg: 'rgba(34, 197, 94, 0.1)',
          border: 'rgba(34, 197, 94, 0.25)',
          color: '#4ade80',
          dot: '#22c55e',
        };
      case 'SHOOTING':
      case 'EDITING':
      case 'IN_USE':
      case 'CLIENT_REVIEW':
        return {
          bg: 'rgba(59, 130, 246, 0.1)',
          border: 'rgba(59, 130, 246, 0.25)',
          color: '#60a5fa',
          dot: '#3b82f6',
        };
      case 'LEAD':
      case 'QUOTED':
      case 'PENDING':
      case 'GOOD':
        return {
          bg: 'rgba(234, 179, 8, 0.1)',
          border: 'rgba(234, 179, 8, 0.25)',
          color: '#facc15',
          dot: '#eab308',
        };
      case 'CHANGES_REQUESTED':
      case 'MAINTENANCE':
      case 'FAIR':
        return {
          bg: 'rgba(249, 115, 22, 0.1)',
          border: 'rgba(249, 115, 22, 0.25)',
          color: '#fb923c',
          dot: '#f97316',
        };
      case 'FAILED':
      case 'DAMAGED':
      case 'LOST':
      case 'RETIRED':
        return {
          bg: 'rgba(239, 68, 68, 0.1)',
          border: 'rgba(239, 68, 68, 0.25)',
          color: '#f87171',
          dot: '#ef4444',
        };
      case 'DELIVERED':
      case 'REFUNDED':
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.12)',
          color: '#d4d4d8',
          dot: '#a1a1aa',
        };
    }
  };

  const style = getStyle(status);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 8px',
        borderRadius: '3px',
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: style.dot,
        }}
      />
      {status.replace(/_/g, ' ')}
    </span>
  );
}
