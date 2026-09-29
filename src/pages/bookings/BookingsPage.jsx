import { useState, useEffect } from 'react';
import { bookingsApi } from '../../api/bookings';
import { projectsApi } from '../../api/projects';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ScrollReveal from '../../components/layout/ScrollReveal';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Trash2,
  Edit2,
  FolderKanban,
} from 'lucide-react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    notes: '',
    status: 'BOOKED',
    projectId: '',
  });

  // Edit Modal
  const [editTarget, setEditTarget] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    notes: '',
    status: 'BOOKED',
    projectId: '',
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [bData, pData] = await Promise.all([
        bookingsApi.getBookings(),
        projectsApi.getProjects().catch(() => []),
      ]);
      setBookings(Array.isArray(bData) ? bData : bData?.bookings || []);
      setProjects(Array.isArray(pData) ? pData : pData?.projects || []);
    } catch (err) {
      console.error('Failed to load bookings', err);
      toast.error(err.response?.data?.message || 'Error querying bookings calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      const payload = { ...formData };
      if (payload.projectId) {
        payload.projectId = isNaN(payload.projectId) ? payload.projectId : Number(payload.projectId);
      } else {
        delete payload.projectId;
      }
      await bookingsApi.createBooking(payload);
      toast.success('Production shoot booked on calendar.');
      setIsCreateOpen(false);
      setFormData({
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        notes: '',
        status: 'BOOKED',
        projectId: '',
      });
      loadData();
    } catch (err) {
      console.error('Failed to book shoot', err);
      toast.error(err.response?.data?.message || 'Failed to record booking.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditOpen = (booking) => {
    setEditTarget(booking);
    setEditForm({
      date: booking.date ? booking.date.split('T')[0] : '',
      startTime: booking.startTime || '',
      endTime: booking.endTime || '',
      location: booking.location || '',
      notes: booking.notes || '',
      status: booking.status || 'BOOKED',
      projectId: booking.projectId || booking.project?.id || '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      setEditLoading(true);
      const payload = { ...editForm };
      if (payload.projectId) {
        payload.projectId = isNaN(payload.projectId) ? payload.projectId : Number(payload.projectId);
      } else {
        delete payload.projectId;
      }
      await bookingsApi.updateBooking(editTarget.id, payload);
      toast.success('Booking schedule revised.');
      setEditTarget(null);
      loadData();
    } catch (err) {
      console.error('Failed to update booking', err);
      toast.error(err.response?.data?.message || 'Failed to update booking.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await bookingsApi.deleteBooking(deleteTarget.id);
      toast.success(`Booking #${deleteTarget.id} removed.`);
      setDeleteTarget(null);
      setBookings((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    } catch (err) {
      console.error('Failed to delete booking', err);
      toast.error(err.response?.data?.message || 'Failed to delete booking.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
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
          <span className="editorial-tag">SCHEDULE // 04</span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', margin: '4px 0 0' }}>
            Production Bookings & Shoots
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="studio-btn studio-btn-primary"
        >
          <Plus size={14} /> Schedule Shoot
        </button>
      </div>

      {/* Bookings View */}
      {loading ? (
        <LoadingSpinner text="ACCESSING PRODUCTION SHOOT CALENDAR..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings on calendar"
          description="There are currently zero scheduled production shoots or studio reservations logged."
          actionLabel="Schedule Shoot"
          onAction={() => setIsCreateOpen(true)}
          icon={Calendar}
        />
      ) : (
        <ScrollReveal>
          <div className="studio-table-container">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Date & Time</th>
                  <th>Location</th>
                  <th>Assigned Project</th>
                  <th>Notes / Logistics</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="font-mono" style={{ color: '#71717a', fontSize: '11px' }}>
                      #{b.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>
                        {b.date ? new Date(b.date).toLocaleDateString() : 'Date TBD'}
                      </div>
                      {(b.startTime || b.endTime) && (
                        <div
                          style={{
                            fontFamily: 'var(--font-mono, monospace)',
                            fontSize: '11px',
                            color: '#a1a1aa',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '2px',
                          }}
                        >
                          <Clock size={11} /> {b.startTime || '00:00'} - {b.endTime || 'End'}
                        </div>
                      )}
                    </td>
                    <td style={{ color: '#d4d4d8', fontSize: '13px' }}>
                      {b.location ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={12} color="#71717a" /> {b.location}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ color: '#d4d4d8', fontSize: '13px' }}>
                      {b.project?.title || (b.projectId ? `Project #${b.projectId}` : '—')}
                    </td>
                    <td style={{ color: '#71717a', fontSize: '12px', maxWidth: '200px' }}>
                      {b.notes || '—'}
                    </td>
                    <td>
                      <StatusBadge status={b.status || 'BOOKED'} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleEditOpen(b)}
                          className="studio-btn studio-btn-ghost"
                          style={{ padding: '6px' }}
                          title="Revise Schedule"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(b)}
                          className="studio-btn studio-btn-ghost"
                          style={{ padding: '6px', color: '#ef4444' }}
                          title="Cancel / Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Schedule Production Shoot"
        subtitle="LOG CALENDAR RESERVATION"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="studio-label">Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="studio-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="studio-label">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="studio-input"
              />
            </div>
            <div>
              <label className="studio-label">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="studio-input"
              />
            </div>
          </div>

          <div>
            <label className="studio-label">Location / Studio Address</label>
            <input
              type="text"
              placeholder="e.g. Studio 4B, 102 Crosby St, Soho, NYC"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="studio-input"
            />
          </div>

          <div>
            <label className="studio-label">Associated Project</label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="studio-select"
            >
              <option value="">-- No Project Linked --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (#{p.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="studio-label">Booking Notes & Logistics</label>
            <textarea
              rows={3}
              placeholder="Call sheets, talent arrival, equipment load-in instructions..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="studio-textarea"
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '16px',
            }}
          >
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="studio-btn studio-btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="studio-btn studio-btn-primary"
            >
              {createLoading ? 'Booking...' : 'Confirm Shoot'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        title="Revise Production Booking"
        subtitle={`UPDATE SCHEDULE #${editTarget?.id}`}
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="studio-label">Date *</label>
            <input
              type="date"
              required
              value={editForm.date}
              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              className="studio-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="studio-label">Start Time</label>
              <input
                type="time"
                value={editForm.startTime}
                onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                className="studio-input"
              />
            </div>
            <div>
              <label className="studio-label">End Time</label>
              <input
                type="time"
                value={editForm.endTime}
                onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                className="studio-input"
              />
            </div>
          </div>

          <div>
            <label className="studio-label">Location</label>
            <input
              type="text"
              value={editForm.location}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              className="studio-input"
            />
          </div>

          <div>
            <label className="studio-label">Status</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="studio-select"
            >
              <option value="BOOKED">BOOKED</option>
              <option value="SHOOTING">SHOOTING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div>
            <label className="studio-label">Linked Project</label>
            <select
              value={editForm.projectId}
              onChange={(e) => setEditForm({ ...editForm, projectId: e.target.value })}
              className="studio-select"
            >
              <option value="">-- No Project Linked --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (#{p.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="studio-label">Notes</label>
            <textarea
              rows={3}
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              className="studio-textarea"
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '16px',
            }}
          >
            <button
              type="button"
              onClick={() => setEditTarget(null)}
              className="studio-btn studio-btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="studio-btn studio-btn-primary"
            >
              {editLoading ? 'Updating...' : 'Save Revisions'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={`Cancel Booking #${deleteTarget?.id}`}
        message={`Confirm cancellation of scheduled shoot at ${deleteTarget?.location || 'this location'}?`}
        confirmText="Confirm Delete"
        loading={deleteLoading}
      />
    </div>
  );
}
