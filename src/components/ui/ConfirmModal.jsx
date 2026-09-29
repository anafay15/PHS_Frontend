import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Destruction',
  message = 'Are you sure you want to proceed with this deletion? This action cannot be reversed.',
  confirmText = 'Delete Record',
  cancelText = 'Cancel',
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title={title}
      subtitle="DESTRUCTIVE PROTOCOL // IRREVERSIBLE"
      maxWidth="480px"
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div
          style={{
            padding: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '4px',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AlertTriangle size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#d4d4d8', fontSize: '14px', lineHeight: 1.6 }}>{message}</p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '20px',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="studio-btn studio-btn-outline"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="studio-btn studio-btn-danger"
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
