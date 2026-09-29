import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Calendar,
  FileText,
  CreditCard,
  Send,
  Camera,
  Settings,
  X,
  Disc,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, tag: '01' },
  { path: '/projects', label: 'Projects', icon: FolderKanban, tag: '02' },
  { path: '/clients', label: 'Clients', icon: Users, tag: '03' },
  { path: '/bookings', label: 'Bookings', icon: Calendar, tag: '04' },
  { path: '/quotes', label: 'Quotes', icon: FileText, tag: '05' },
  { path: '/payments', label: 'Payments', icon: CreditCard, tag: '06' },
  { path: '/deliveries', label: 'Deliveries', icon: Send, tag: '07' },
  { path: '/inventory', label: 'Inventory', icon: Camera, tag: '08' },
  { path: '/settings', label: 'Settings', icon: Settings, tag: '09' },
];

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 998,
          }}
          className="lg:hidden"
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          backgroundColor: '#0c0c0e',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          transform: mobileOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.3s ease',
        }}
        className={`sidebar-nav ${mobileOpen ? 'mobile-visible' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '24px 24px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                backgroundColor: '#ffffff',
                color: '#080808',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(255, 255, 255, 0.2)',
              }}
            >
              <Disc size={18} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display, sans-serif)',
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                }}
              >
                STUDIO OS
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '9px',
                  letterSpacing: '0.12em',
                  color: '#71717a',
                  textTransform: 'uppercase',
                }}
              >
                AWAITED EDITORIAL
              </div>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onMobileClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#71717a',
              cursor: 'pointer',
              padding: '4px',
              display: 'none',
            }}
            className="mobile-close-btn"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Registry Links */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div
            style={{
              padding: '6px 12px 10px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#52525b',
            }}
          >
            SYSTEM MODULES
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '3px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontFamily: 'var(--font-sans)',
                  color: isActive ? '#ffffff' : '#a1a1aa',
                  backgroundColor: isActive
                    ? 'rgba(255, 255, 255, 0.07)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(255, 255, 255, 0.12)'
                    : '1px solid transparent',
                  transition: 'all 0.15s ease',
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '10px',
                    color: '#52525b',
                  }}
                >
                  {item.tag}
                </span>
              </NavLink>
            );
          })}
        </div>

        {/* User Session Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#f4f4f5',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {user?.name || user?.email || 'Studio Administrator'}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '10px',
                  color: '#71717a',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {user?.email || 'studio@operator.internal'}
              </div>
            </div>
            <div
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                boxShadow: '0 0 8px #22c55e',
              }}
              title="Session Active"
            />
          </div>

          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '6px 8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '2px',
              color: '#71717a',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            <span>MODE: DIRECT OPERATOR ACCESS</span>
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          .sidebar-nav {
            transform: translateX(-100%);
          }
          .sidebar-nav.mobile-visible {
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
