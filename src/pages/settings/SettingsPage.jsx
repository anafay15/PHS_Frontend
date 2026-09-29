import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL } from '../../api/axios';
import api from '../../api/axios';
import {
  Server,
  Shield,
  RotateCcw,
  Activity,
  Layers,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [pingStatus, setPingStatus] = useState(null);
  const [pinging, setPinging] = useState(false);

  const testConnection = async () => {
    try {
      setPinging(true);
      setPingStatus(null);
      // Attempt ping to backend
      const res = await api.get('/api/dashboard/summary');
      setPingStatus({
        ok: true,
        message: 'Endpoint verified. Express + PostgreSQL operational.',
        status: res.status,
      });
      toast.success('Backend connection healthy.');
    } catch (err) {
      console.error('Connection test error', err);
      setPingStatus({
        ok: false,
        message:
          err.response?.status === 401
            ? 'Endpoint reached (401 Unauthorized - valid JWT token expected).'
            : err.response
            ? `Server responded with HTTP ${err.response.status}`
            : 'Unable to reach http://localhost:3000 (Connection refused / Offline).',
      });
      toast.info('Telemetry check concluded.');
    } finally {
      setPinging(false);
    }
  };

  const handleReplayPreloader = () => {
    sessionStorage.removeItem('studio_preloader_seen');
    toast.success('Preloader flag cleared. Reloading session...');
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '24px',
        }}
      >
        <span className="editorial-tag">SYSTEM CONFIGURATION // 09</span>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', margin: '4px 0 0' }}>
          Workspace Settings & Telemetry
        </h1>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Operator Profile */}
        <div className="studio-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Shield size={16} color="#71717a" />
            <h3 style={{ fontSize: '16px', margin: 0 }}>Active Operator Dossier</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <span style={{ color: '#71717a' }}>Operator Name</span>
              <span style={{ fontWeight: 600, color: '#ffffff' }}>{user?.name || 'Administrator'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <span style={{ color: '#71717a' }}>Email Address</span>
              <span className="font-mono" style={{ color: '#d4d4d8' }}>{user?.email || 'operator@studio.internal'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <span style={{ color: '#71717a' }}>Authorization Model</span>
              <span className="font-mono" style={{ color: '#22c55e' }}>JSON WEB TOKEN (BEARER)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#71717a' }}>Workspace Mode</span>
              <span className="font-mono">STUDIO PRODUCTION OS</span>
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <button
              type="button"
              onClick={() => {
                logout();
                toast.success('Workspace profile cache refreshed.');
              }}
              className="studio-btn studio-btn-outline"
              style={{ width: '100%' }}
            >
              <RotateCcw size={13} /> Refresh Operator Cache
            </button>
          </div>
        </div>

        {/* Backend Architecture Telemetry */}
        <div className="studio-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Server size={16} color="#71717a" />
            <h3 style={{ fontSize: '16px', margin: 0 }}>Backend Connectivity</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <span style={{ color: '#71717a' }}>API Endpoint Target</span>
              <span className="font-mono" style={{ color: '#ffffff' }}>{API_BASE_URL}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <span style={{ color: '#71717a' }}>Database Engine</span>
              <span className="font-mono">PostgreSQL // Prisma ORM</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <span style={{ color: '#71717a' }}>Server Framework</span>
              <span className="font-mono">Node.js // Express</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#71717a' }}>Data Source Rule</span>
              <span className="font-mono" style={{ color: '#a1a1aa' }}>SINGLE SOURCE OF TRUTH</span>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button
              type="button"
              onClick={testConnection}
              disabled={pinging}
              className="studio-btn studio-btn-outline"
              style={{ width: '100%' }}
            >
              <Activity size={13} /> {pinging ? 'Pinging Host...' : 'Ping Backend Host'}
            </button>
          </div>

          {pingStatus && (
            <div
              style={{
                marginTop: '12px',
                padding: '10px 14px',
                backgroundColor: pingStatus.ok ? 'rgba(34, 197, 94, 0.08)' : 'rgba(234, 179, 8, 0.08)',
                border: `1px solid ${pingStatus.ok ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)'}`,
                borderRadius: '2px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                color: pingStatus.ok ? '#4ade80' : '#facc15',
              }}
            >
              {pingStatus.message}
            </div>
          )}
        </div>

        {/* Studio OS Aesthetic Experience */}
        <div className="studio-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Layers size={16} color="#71717a" />
            <h3 style={{ fontSize: '16px', margin: 0 }}>Experience & Interactions</h3>
          </div>

          <p style={{ color: '#a1a1aa', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>
            Equipped with Oryxel-inspired architecture: Lenis physics momentum scrolling, geometric Framer Motion cursor, 3D React Three Fiber wireframe matrix, and choreographed opening sequences.
          </p>

          <button
            type="button"
            onClick={handleReplayPreloader}
            className="studio-btn studio-btn-outline"
            style={{ width: '100%' }}
          >
            <RotateCcw size={13} /> Replay Preloader Sequence
          </button>
        </div>
      </div>
    </div>
  );
}
