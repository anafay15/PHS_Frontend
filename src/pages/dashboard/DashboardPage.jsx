import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboard';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ScrollReveal from '../../components/layout/ScrollReveal';
import { getApiErrorMessage, formatCurrency, projectName, unwrapList } from '../../utils/api';
import {
  FolderKanban,
  Calendar,
  CreditCard,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Users,
} from 'lucide-react';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getSummary();
      setSummary(data);
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to load dashboard summary.');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return <LoadingSpinner text="AGGREGATING STUDIO TELEMETRY // DASHBOARD..." />;
  }

  const overview = summary?.overview || {};
  const recentProjects = unwrapList(summary?.recentProjects);
  const upcomingBookings = unwrapList(summary?.upcomingBookings);
  const recentPayments = unwrapList(summary?.recentPayments);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '24px',
        }}
      >
        <div>
          <div className="editorial-tag" style={{ marginBottom: '6px' }}>
            OVERVIEW // STUDIO COMMAND
          </div>
          <h1
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
              margin: 0,
              lineHeight: 1,
            }}
          >
            Operating Dashboard
          </h1>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <Link to="/projects" className="studio-btn studio-btn-primary">
            <Plus size={14} /> New Project
          </Link>
          <Link to="/bookings" className="studio-btn studio-btn-outline">
            <Calendar size={14} /> New Booking
          </Link>
          <Link to="/clients" className="studio-btn studio-btn-ghost">
            <Users size={14} /> New Client
          </Link>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '2px',
            color: '#f87171',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>BACKEND DISCONNECTED: {error}</span>
          <button
            onClick={fetchSummary}
            className="studio-btn studio-btn-outline"
            style={{ padding: '4px 10px', fontSize: '11px' }}
          >
            RETRY QUERY
          </button>
        </div>
      )}

      <ScrollReveal>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          <StatCard
            tag="METRIC // 01"
            label="Total Gross Invoiced"
            value={formatCurrency(overview.totalRevenue)}
            subtitle="Paid payment records in the ledger"
            icon={TrendingUp}
          />
          <StatCard
            tag="METRIC // 02"
            label="Active Production Projects"
            value={overview.activeProjects ?? 0}
            subtitle={`${overview.completedProjects ?? 0} completed // ${overview.totalClients ?? 0} clients`}
            icon={FolderKanban}
          />
          <StatCard
            tag="METRIC // 03"
            label="Upcoming Scheduled Shoots"
            value={upcomingBookings.length}
            subtitle="Scheduled bookings from today forward"
            icon={Calendar}
          />
          <StatCard
            tag="METRIC // 04"
            label="Pending Settlement Balance"
            value={formatCurrency(overview.pendingRevenue)}
            subtitle={`${overview.totalPayments ?? 0} payment records total`}
            icon={CreditCard}
          />
        </div>
      </ScrollReveal>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: '24px',
        }}
      >
        <div className="studio-card" style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div>
              <span className="editorial-tag">PROJECT LOG</span>
              <h3 style={{ fontSize: '16px', margin: '4px 0 0' }}>Recent Projects</h3>
            </div>
            <Link
              to="/projects"
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                color: '#a1a1aa',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              VIEW ALL <ArrowUpRight size={12} />
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <EmptyState
              title="No recent projects"
              description="No production projects have been initiated yet in this workspace."
              actionLabel="Create Project"
              onAction={() => (window.location.href = '/projects')}
              icon={FolderKanban}
            />
          ) : (
            <div className="studio-table-container">
              <table className="studio-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Client</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.slice(0, 5).map((project) => (
                    <tr key={project.id}>
                      <td style={{ fontWeight: 500 }}>
                        <Link
                          to={`/projects/${project.id}`}
                          style={{ color: '#ffffff', textDecoration: 'none' }}
                        >
                          {projectName(project)}
                        </Link>
                      </td>
                      <td style={{ color: '#a1a1aa' }}>
                        {project.client?.name || '—'}
                      </td>
                      <td>
                        <StatusBadge status={project.status} />
                      </td>
                      <td>
                        <Link
                          to={`/projects/${project.id}`}
                          className="studio-btn studio-btn-ghost"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                        >
                          OPEN <ArrowUpRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="studio-card" style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div>
              <span className="editorial-tag">SCHEDULE LOG</span>
              <h3 style={{ fontSize: '16px', margin: '4px 0 0' }}>Upcoming Shoots</h3>
            </div>
            <Link
              to="/bookings"
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                color: '#a1a1aa',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              VIEW CALENDAR <ArrowUpRight size={12} />
            </Link>
          </div>

          {upcomingBookings.length === 0 ? (
            <EmptyState
              title="No upcoming bookings"
              description="No production shoots or studio bookings are scheduled on the calendar."
              actionLabel="Schedule Shoot"
              onAction={() => (window.location.href = '/bookings')}
              icon={Calendar}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingBookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  style={{
                    padding: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, color: '#f4f4f5', fontSize: '14px' }}>
                      {projectName(booking.project, booking.location || `Booking #${booking.id}`)}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '11px',
                        color: '#71717a',
                        marginTop: '3px',
                      }}
                    >
                      {booking.date ? new Date(booking.date).toLocaleDateString() : 'Date TBD'}{' '}
                      {booking.startTime && `// ${booking.startTime}`}
                    </div>
                  </div>
                  <StatusBadge status={booking.status || 'SCHEDULED'} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="studio-card" style={{ padding: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <div>
            <span className="editorial-tag">FINANCIAL LEDGER</span>
            <h3 style={{ fontSize: '16px', margin: '4px 0 0' }}>Recent Payment Transactions</h3>
          </div>
          <Link
            to="/payments"
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '11px',
              color: '#a1a1aa',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            VIEW ALL PAYMENTS <ArrowUpRight size={12} />
          </Link>
        </div>

        {recentPayments.length === 0 ? (
          <EmptyState
            title="No payment records"
            description="Zero payment transactions logged in the financial registry."
            actionLabel="Record Payment"
            onAction={() => (window.location.href = '/payments')}
            icon={CreditCard}
          />
        ) : (
          <div className="studio-table-container">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.slice(0, 5).map((pay) => (
                  <tr key={pay.id}>
                    <td className="font-mono" style={{ color: '#71717a' }}>
                      #{pay.id}
                    </td>
                    <td className="font-mono" style={{ fontWeight: 600, color: '#f4f4f5' }}>
                      {formatCurrency(pay.amount)}
                    </td>
                    <td className="font-mono" style={{ fontSize: '11px' }}>
                      {pay.type || 'DEPOSIT'}
                    </td>
                    <td>
                      <StatusBadge status={pay.status} />
                    </td>
                    <td className="font-mono" style={{ fontSize: '11px', color: '#71717a' }}>
                      {pay.paidAt || pay.createdAt
                        ? new Date(pay.paidAt || pay.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
