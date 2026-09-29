import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientsApi } from '../../api/clients';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ScrollReveal from '../../components/layout/ScrollReveal';
import {
  Users,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  Mail,
  Phone,
} from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientsApi.getClients();
      setClients(Array.isArray(data) ? data : data?.clients || []);
    } catch (err) {
      console.error('Failed to load clients', err);
      toast.error(err.response?.data?.message || 'Error querying clients registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Client name is required.');
      return;
    }

    try {
      setCreateSubmitting(true);
      await clientsApi.createClient(formData);
      toast.success(`Client ${formData.name} added to directory.`);
      setIsCreateOpen(false);
      setFormData({ name: '', email: '', phone: '' });
      loadClients();
    } catch (err) {
      console.error('Client creation failed', err);
      toast.error(err.response?.data?.message || 'Failed to create client.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await clientsApi.deleteClient(deleteTarget.id);
      toast.success(`Client #${deleteTarget.id} deleted.`);
      setDeleteTarget(null);
      setClients((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    } catch (err) {
      console.error('Failed to delete client', err);
      toast.error(err.response?.data?.message || 'Failed to delete client.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q))
    );
  });

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
          <span className="editorial-tag">DIRECTORY // 03</span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', margin: '4px 0 0' }}>
            Client Directory
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="studio-btn studio-btn-primary"
        >
          <Plus size={14} /> Register Client
        </button>
      </div>

      {/* Search Input */}
      <div style={{ maxWidth: '400px', width: '100%', position: 'relative' }}>
        <Search
          size={14}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#71717a',
          }}
        />
        <input
          type="text"
          placeholder="Filter by name, email, or telephone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="studio-input"
          style={{ paddingLeft: '34px' }}
        />
      </div>

      {/* Table / Empty State */}
      {loading ? (
        <LoadingSpinner text="ACCESSING CLIENT DATABASE DIRECTORY..." />
      ) : filteredClients.length === 0 ? (
        <EmptyState
          title="No clients on record"
          description={
            searchTerm
              ? 'No client accounts match your search filter.'
              : 'Your client roster is currently empty. Register a client to connect projects, bookings, and quotes.'
          }
          actionLabel="Register Client"
          onAction={() => setIsCreateOpen(true)}
          icon={Users}
        />
      ) : (
        <ScrollReveal>
          <div className="studio-table-container">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>Client ID</th>
                  <th>Name / Entity</th>
                  <th>Email</th>
                  <th>Telephone</th>
                  <th>Enrolled</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td className="font-mono" style={{ color: '#71717a', fontSize: '11px' }}>
                      #{client.id}
                    </td>
                    <td>
                      <Link
                        to={`/clients/${client.id}`}
                        style={{
                          fontWeight: 600,
                          color: '#ffffff',
                          textDecoration: 'none',
                          fontSize: '14px',
                        }}
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td style={{ color: '#d4d4d8', fontSize: '13px' }}>
                      {client.email ? (
                        <a
                          href={`mailto:${client.email}`}
                          style={{
                            color: '#a1a1aa',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Mail size={12} /> {client.email}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ color: '#a1a1aa', fontSize: '13px' }}>
                      {client.phone ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={12} /> {client.phone}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="font-mono" style={{ fontSize: '11px', color: '#71717a' }}>
                      {client.createdAt
                        ? new Date(client.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Link
                          to={`/clients/${client.id}`}
                          className="studio-btn studio-btn-ghost"
                          style={{ padding: '6px' }}
                          title="Open Details"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(client)}
                          className="studio-btn studio-btn-ghost"
                          style={{ padding: '6px', color: '#ef4444' }}
                          title="Delete Client"
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
        title="Register New Client"
        subtitle="ADD CONTACT TO CENTRAL OPERATING DIRECTORY"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="studio-label">Legal Name / Organization *</label>
            <input
              type="text"
              required
              placeholder="e.g. Elena Rostova / Vogue Scandinavia"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="studio-input"
            />
          </div>

          <div>
            <label className="studio-label">Official Email</label>
            <input
              type="email"
              placeholder="elena@studio-editorial.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="studio-input"
            />
          </div>

          <div>
            <label className="studio-label">Contact Telephone</label>
            <input
              type="tel"
              placeholder="+1 (555) 234-8900"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="studio-input"
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
              disabled={createSubmitting}
              className="studio-btn studio-btn-primary"
            >
              {createSubmitting ? 'Registering...' : 'Save Client'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete Client Record #${deleteTarget?.id}`}
        message={`Are you sure you wish to delete ${deleteTarget?.name}? All associated projects and documents may lose their client binding.`}
        confirmText="Confirm Delete"
        loading={deleteLoading}
      />
    </div>
  );
}
