import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { clientsApi } from '../../api/clients';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Mail,
  Phone,
  FolderKanban,
  ExternalLink,
} from 'lucide-react';

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Delete Modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const data = await clientsApi.getClient(id);
      const c = data?.client || data;
      setClient(c);
      setEditForm({
        name: c.name || '',
        email: c.email || '',
        phone: c.phone || '',
      });
    } catch (err) {
      console.error('Failed to load client details', err);
      toast.error(err.response?.data?.message || 'Could not retrieve client details.');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      const updated = await clientsApi.updateClient(id, editForm);
      toast.success('Client profile updated.');
      setClient(updated?.client || updated || { ...client, ...editForm });
      setIsEditOpen(false);
    } catch (err) {
      console.error('Failed to update client', err);
      toast.error(err.response?.data?.message || 'Failed to update client profile.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await clientsApi.deleteClient(id);
      toast.success('Client removed from directory.');
      navigate('/clients');
    } catch (err) {
      console.error('Failed to delete client', err);
      toast.error(err.response?.data?.message || 'Failed to delete client.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="FETCHING CLIENT ACCOUNT DOSSIER..." />;
  }

  if (!client) return null;

  const projects = client.projects || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <Link
          to="/clients"
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            color: '#a1a1aa',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          <ArrowLeft size={13} /> Back to Client Directory
        </Link>
      </div>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '20px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '28px',
        }}
      >
        <div>
          <span className="editorial-tag">CLIENT PROFILE // #{client.id}</span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '8px 0 10px' }}>
            {client.name}
          </h1>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '12px',
              color: '#a1a1aa',
            }}
          >
            {client.email && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={13} /> {client.email}
              </span>
            )}
            {client.phone && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={13} /> {client.phone}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="studio-btn studio-btn-outline"
          >
            <Edit2 size={14} /> Revise Profile
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="studio-btn studio-btn-danger"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Associated Projects Section */}
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
            <span className="editorial-tag">PROJECT ENGAGEMENTS</span>
            <h3 style={{ fontSize: '16px', margin: '4px 0 0' }}>
              Associated Projects ({projects.length})
            </h3>
          </div>
          <Link
            to="/projects"
            className="studio-btn studio-btn-outline"
            style={{ padding: '6px 12px', fontSize: '11px' }}
          >
            <FolderKanban size={13} /> Assign Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <p style={{ color: '#71717a', fontSize: '13px', margin: '16px 0' }}>
            No project engagements logged under this client record.
          </p>
        ) : (
          <div className="studio-table-container">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono" style={{ color: '#71717a' }}>
                      #{p.id}
                    </td>
                    <td style={{ fontWeight: 500, color: '#ffffff' }}>{p.title}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/projects/${p.id}`}
                        className="studio-btn studio-btn-ghost"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                      >
                        VIEW <ExternalLink size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Revise Client Profile"
        subtitle={`UPDATE RECORD #${client.id}`}
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="studio-label">Name / Legal Entity *</label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="studio-input"
            />
          </div>

          <div>
            <label className="studio-label">Email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="studio-input"
            />
          </div>

          <div>
            <label className="studio-label">Phone</label>
            <input
              type="tel"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
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
              onClick={() => setIsEditOpen(false)}
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
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Delete Client Record #${client.id}`}
        message={`Confirming this deletion will erase ${client.name} permanently.`}
        confirmText="Confirm Delete"
        loading={deleteLoading}
      />
    </div>
  );
}
