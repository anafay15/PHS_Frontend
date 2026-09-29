import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectsApi, PROJECT_STATUSES } from '../../api/projects';
import { clientsApi } from '../../api/clients';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Calendar,
  CreditCard,
  Send,
  FileText,
  User,
  ExternalLink,
} from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [project, setProject] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
    clientId: '',
  });

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getProject(id);
      const proj = data?.project || data;
      setProject(proj);
      setEditForm({
        title: proj.title || '',
        description: proj.description || '',
        status: proj.status || 'LEAD',
        clientId: proj.clientId || proj.client?.id || '',
      });
    } catch (err) {
      console.error('Failed to load project details', err);
      toast.error(err.response?.data?.message || 'Could not retrieve project.');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    clientsApi.getClients().then((res) => {
      setClients(Array.isArray(res) ? res : res?.clients || []);
    }).catch(() => {});
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await projectsApi.updateProjectStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      setProject((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Status update failed', err);
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      const payload = {
        title: editForm.title,
        description: editForm.description,
        status: editForm.status,
      };
      if (editForm.clientId) {
        payload.clientId = isNaN(editForm.clientId) ? editForm.clientId : Number(editForm.clientId);
      }
      const updated = await projectsApi.updateProject(id, payload);
      toast.success('Project details revised successfully.');
      setProject(updated?.project || updated || { ...project, ...payload });
      setIsEditOpen(false);
    } catch (err) {
      console.error('Edit project failed', err);
      toast.error(err.response?.data?.message || 'Failed to revise project.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await projectsApi.deleteProject(id);
      toast.success('Project deleted from registry.');
      navigate('/projects');
    } catch (err) {
      console.error('Delete failed', err);
      toast.error(err.response?.data?.message || 'Failed to delete project.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="ACCESSING PROJECT SPECIFICATION..." />;
  }

  if (!project) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Navigation */}
      <div>
        <Link
          to="/projects"
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
          <ArrowLeft size={13} /> Back to Projects Registry
        </Link>
      </div>

      {/* Hero Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span className="editorial-tag">PROJECT // #{project.id}</span>
            <StatusBadge status={project.status} />
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '0 0 10px' }}>
            {project.title}
          </h1>
          <p
            style={{
              color: '#a1a1aa',
              fontSize: '14px',
              maxWidth: '680px',
              lineHeight: 1.6,
            }}
          >
            {project.description || 'No detailed scope or creative directive recorded.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="studio-btn studio-btn-outline"
          >
            <Edit3 size={14} /> Edit Project
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

      {/* Quick Status Control Bar */}
      <div
        className="studio-card"
        style={{
          padding: '18px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="editorial-tag">LIFECYCLE PIPELINE STATE:</span>
          <span style={{ fontWeight: 600, color: '#f4f4f5' }}>{project.status}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#71717a' }}>Advance status:</span>
          <select
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="studio-select"
            style={{ width: 'auto', minWidth: '180px', padding: '6px 12px' }}
          >
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Meta Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Client Association */}
        <div className="studio-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <User size={16} color="#71717a" />
            <h3 style={{ fontSize: '15px', margin: 0 }}>Client Association</h3>
          </div>

          {project.client ? (
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>
                {project.client.name}
              </div>
              <div style={{ color: '#a1a1aa', fontSize: '13px', marginTop: '4px' }}>
                {project.client.email || 'No email registered'}
              </div>
              {project.client.phone && (
                <div style={{ color: '#71717a', fontSize: '12px', marginTop: '2px' }}>
                  {project.client.phone}
                </div>
              )}
              <div style={{ marginTop: '16px' }}>
                <Link
                  to={`/clients/${project.client.id}`}
                  className="studio-btn studio-btn-outline"
                  style={{ padding: '6px 12px', fontSize: '11px' }}
                >
                  View Client Profile <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          ) : (
            <p style={{ color: '#71717a', fontSize: '13px' }}>
              No client currently linked to this project record.
            </p>
          )}
        </div>

        {/* Associated Metadata Details */}
        <div className="studio-card" style={{ padding: '24px' }}>
          <span className="editorial-tag">TIMESTAMP REGISTRY</span>
          <h3 style={{ fontSize: '15px', margin: '4px 0 16px' }}>Audit Trail</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <span style={{ color: '#71717a' }}>Registry ID</span>
              <span className="font-mono" style={{ color: '#f4f4f5' }}>#{project.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <span style={{ color: '#71717a' }}>Created At</span>
              <span className="font-mono" style={{ color: '#f4f4f5' }}>
                {project.createdAt ? new Date(project.createdAt).toLocaleString() : '—'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#71717a' }}>Updated At</span>
              <span className="font-mono" style={{ color: '#f4f4f5' }}>
                {project.updatedAt ? new Date(project.updatedAt).toLocaleString() : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Revise Project Details"
        subtitle={`UPDATE RECORD #${project.id}`}
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="studio-label">Project Title *</label>
            <input
              type="text"
              required
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="studio-input"
            />
          </div>

          <div>
            <label className="studio-label">Linked Client</label>
            <select
              value={editForm.clientId}
              onChange={(e) => setEditForm({ ...editForm, clientId: e.target.value })}
              className="studio-select"
            >
              <option value="">-- No Client Assigned --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email || 'No email'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="studio-label">Status</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="studio-select"
            >
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="studio-label">Description / Scope</label>
            <textarea
              rows={4}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
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
              {editLoading ? 'Saving...' : 'Save Revisions'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Delete Project #${project.id}`}
        message={`Are you certain you want to permanently erase "${project.title}" from the registry?`}
        confirmText="Confirm Delete"
        loading={deleteLoading}
      />
    </div>
  );
}
