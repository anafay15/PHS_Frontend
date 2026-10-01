import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi, PROJECT_STATUSES, getAllowedProjectStatuses } from '../../api/projects';
import { clientsApi } from '../../api/clients';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ScrollReveal from '../../components/layout/ScrollReveal';
import {
  getApiErrorMessage,
  unwrapList,
  toIntId,
  toDateInputValue,
  projectName,
} from '../../utils/api';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Trash2,
  ExternalLink,
} from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  description: '',
  clientId: '',
  shootDate: '',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [projData, clientData] = await Promise.all([
        projectsApi.getProjects(),
        clientsApi.getClients().catch(() => []),
      ]);
      setProjects(unwrapList(projData, 'projects'));
      setClients(unwrapList(clientData, 'clients'));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error querying projects registry.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Project name is required.');
      return;
    }
    const clientId = toIntId(formData.clientId);
    if (!clientId) {
      toast.error('A client is required to create a project.');
      return;
    }

    try {
      setCreateSubmitting(true);
      await projectsApi.createProject({
        name: formData.name.trim(),
        description: formData.description || undefined,
        shootDate: formData.shootDate || undefined,
        clientId,
      });
      toast.success('Project initialized successfully.');
      setIsCreateOpen(false);
      setFormData(EMPTY_FORM);
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create project.'));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleStatusChange = async (project, newStatus) => {
    if (!newStatus || newStatus === project.status) return;
    try {
      await projectsApi.updateProjectStatus(project.id, newStatus);
      toast.success(`Project status shifted to ${newStatus}`);
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update status.'));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await projectsApi.deleteProject(deleteTarget.id);
      toast.success(`Project #${deleteTarget.id} deleted.`);
      setDeleteTarget(null);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete project.'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const name = (p.name || '').toLowerCase();
    const description = (p.description || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = name.includes(q) || description.includes(q);
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
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
          <span className="editorial-tag">REGISTRY // 02</span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', margin: '4px 0 0' }}>
            Production Projects
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="studio-btn studio-btn-primary"
        >
          <Plus size={14} /> Initialize Project
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flex: '1 1 300px', maxWidth: '400px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
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
              placeholder="Search projects by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="studio-input"
              style={{ paddingLeft: '34px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} color="#71717a" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="studio-select"
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="ALL">ALL STATUSES ({projects.length})</option>
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="ACCESSING PROJECTS DATABASE..." />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects registered"
          description={
            searchTerm || selectedStatus !== 'ALL'
              ? 'No projects match your current search and filter criteria.'
              : 'The project registry is currently empty. Initialize your first project to get started.'
          }
          actionLabel="Initialize Project"
          onAction={() => setIsCreateOpen(true)}
          icon={FolderKanban}
        />
      ) : (
        <ScrollReveal>
          <div className="studio-table-container">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>Project ID</th>
                  <th>Name & Scope</th>
                  <th>Client</th>
                  <th>Shoot Date</th>
                  <th>Current State</th>
                  <th>Status Selector</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => {
                  const allowed = getAllowedProjectStatuses(p.status);
                  return (
                    <tr key={p.id}>
                      <td className="font-mono" style={{ color: '#71717a', fontSize: '11px' }}>
                        #{p.id}
                      </td>
                      <td>
                        <Link
                          to={`/projects/${p.id}`}
                          style={{
                            fontWeight: 600,
                            color: '#ffffff',
                            textDecoration: 'none',
                            display: 'block',
                            fontSize: '14px',
                          }}
                        >
                          {projectName(p)}
                        </Link>
                        {p.description && (
                          <span
                            style={{
                              color: '#71717a',
                              fontSize: '12px',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {p.description}
                          </span>
                        )}
                      </td>
                      <td style={{ color: '#d4d4d8', fontSize: '13px' }}>
                        {p.client ? (
                          <Link
                            to={`/clients/${p.client.id}`}
                            style={{ color: '#d4d4d8', textDecoration: 'none' }}
                          >
                            {p.client.name}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="font-mono" style={{ fontSize: '11px', color: '#71717a' }}>
                        {p.shootDate ? new Date(p.shootDate).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td>
                        <select
                          value={p.status}
                          onChange={(e) => handleStatusChange(p, e.target.value)}
                          disabled={allowed.length <= 1}
                          className="studio-select"
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono, monospace)',
                            width: 'auto',
                          }}
                        >
                          {allowed.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
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
                            to={`/projects/${p.id}`}
                            className="studio-btn studio-btn-ghost"
                            style={{ padding: '6px' }}
                            title="Open Details"
                          >
                            <ExternalLink size={14} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(p)}
                            className="studio-btn studio-btn-ghost"
                            style={{ padding: '6px', color: '#ef4444' }}
                            title="Delete Project"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      )}

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Initialize Production Project"
        subtitle="CREATE NEW PRODUCTION REGISTRY RECORD"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="studio-label">Project Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Editorial Autumn Campaign 2026"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="studio-input"
            />
          </div>

          <div>
            <label className="studio-label">Assign Client *</label>
            <select
              required
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="studio-select"
            >
              <option value="">-- Select Client --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email || 'No email'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="studio-label">Shoot Date</label>
            <input
              type="date"
              value={formData.shootDate}
              onChange={(e) => setFormData({ ...formData, shootDate: e.target.value })}
              className="studio-input"
            />
          </div>

          <div>
            <label className="studio-label">Description / Scope Notes</label>
            <textarea
              rows={4}
              placeholder="Outline project deliverables, creative direction, requirements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              disabled={createSubmitting}
              className="studio-btn studio-btn-primary"
            >
              {createSubmitting ? 'Recording...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete Project #${deleteTarget?.id}`}
        message={`Are you sure you want to permanently delete "${projectName(deleteTarget, deleteTarget?.id)}"? All linked records may be affected.`}
        confirmText="Confirm Delete"
        loading={deleteLoading}
      />
    </div>
  );
}
