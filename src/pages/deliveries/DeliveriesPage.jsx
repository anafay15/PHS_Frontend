import { useState, useEffect } from 'react';
import { deliveriesApi } from '../../api/deliveries';
import { projectsApi } from '../../api/projects';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ScrollReveal from '../../components/layout/ScrollReveal';
import {
  Send,
  Plus,
  ExternalLink,
  Trash2,
  Edit2,
} from 'lucide-react';

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    platform: 'Google Drive',
    notes: '',
    projectId: '',
  });

  // Edit Modal
  const [editTarget, setEditTarget] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    url: '',
    platform: 'Google Drive',
    notes: '',
    projectId: '',
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [delData, pData] = await Promise.all([
        deliveriesApi.getDeliveries(),
        projectsApi.getProjects().catch(() => []),
      ]);
      setDeliveries(Array.isArray(delData) ? delData : delData?.deliveries || []);
      setProjects(Array.isArray(pData) ? pData : pData?.projects || []);
    } catch (err) {
      console.error('Failed to load deliveries', err);
      toast.error(err.response?.data?.message || 'Error querying deliveries vault.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      toast.error('Title and External URL are required.');
      return;
    }

    try {
      setCreateLoading(true);
      const payload = {
        title: formData.title,
        url: formData.url,
        platform: formData.platform,
        notes: formData.notes,
      };
      if (formData.projectId) {
        payload.projectId = isNaN(formData.projectId) ? formData.projectId : Number(formData.projectId);
      }
      await deliveriesApi.createDelivery(payload);
      toast.success('Asset delivery link published.');
      setIsCreateOpen(false);
      setFormData({
        title: '',
        url: '',
        platform: 'Google Drive',
        notes: '',
        projectId: '',
      });
      loadData();
    } catch (err) {
      console.error('Failed to publish delivery', err);
      toast.error(err.response?.data?.message || 'Failed to register delivery.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditOpen = (delivery) => {
    setEditTarget(delivery);
    setEditForm({
      title: delivery.title || '',
      url: delivery.url || '',
      platform: delivery.platform || 'Google Drive',
      notes: delivery.notes || '',
      projectId: delivery.projectId || delivery.project?.id || '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      setEditLoading(true);
      const payload = {
        title: editForm.title,
        url: editForm.url,
        platform: editForm.platform,
        notes: editForm.notes,
      };
      if (editForm.projectId) {
        payload.projectId = isNaN(editForm.projectId) ? editForm.projectId : Number(editForm.projectId);
      }
      await deliveriesApi.updateDelivery(editTarget.id, payload);
      toast.success('Delivery revised.');
      setEditTarget(null);
      loadData();
    } catch (err) {
      console.error('Failed to update delivery', err);
      toast.error(err.response?.data?.message || 'Failed to update delivery.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await deliveriesApi.deleteDelivery(deleteTarget.id);
      toast.success(`Delivery #${deleteTarget.id} removed.`);
      setDeleteTarget(null);
      setDeliveries((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    } catch (err) {
      console.error('Failed to delete delivery', err);
      toast.error(err.response?.data?.message || 'Failed to delete delivery.');
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
          <span className="editorial-tag">ASSET VAULT // 07</span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', margin: '4px 0 0' }}>
            Client Deliveries & Galleries
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="studio-btn studio-btn-primary"
        >
          <Plus size={14} /> Register Delivery
        </button>
      </div>

      {/* Deliveries Grid / Table */}
      {loading ? (
        <LoadingSpinner text="ACCESSING EXTERNAL VAULT REGISTRY..." />
      ) : deliveries.length === 0 ? (
        <EmptyState
          title="No deliveries logged"
          description="Zero external client delivery links (Pixieset, Frame.io, Google Drive, Dropbox) have been recorded."
          actionLabel="Register Delivery"
          onAction={() => setIsCreateOpen(true)}
          icon={Send}
        />
      ) : (
        <ScrollReveal>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '20px',
            }}
          >
            {deliveries.map((del) => (
              <div
                key={del.id}
                className="studio-card"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <span className="editorial-tag">{del.platform || 'SECURE LINK'}</span>
                    <span className="font-mono" style={{ fontSize: '11px', color: '#71717a' }}>
                      #{del.id}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#ffffff',
                      margin: '0 0 8px',
                    }}
                  >
                    {del.title}
                  </h3>

                  {del.project && (
                    <div
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '11px',
                        color: '#a1a1aa',
                        marginBottom: '8px',
                      }}
                    >
                      PROJECT: {del.project.title}
                    </div>
                  )}

                  {del.notes && (
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#71717a',
                        lineHeight: 1.5,
                        marginBottom: '16px',
                      }}
                    >
                      {del.notes}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <a
                    href={del.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="studio-btn studio-btn-primary"
                    style={{ padding: '8px 14px', fontSize: '11px' }}
                  >
                    Open Delivery <ExternalLink size={13} />
                  </a>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleEditOpen(del)}
                      className="studio-btn studio-btn-ghost"
                      style={{ padding: '6px' }}
                      title="Edit link"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(del)}
                      className="studio-btn studio-btn-ghost"
                      style={{ padding: '6px', color: '#ef4444' }}
                      title="Delete delivery"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register Asset Delivery"
        subtitle="NO LOCAL STORAGE // PRIVATE EXTERNAL ASSET LINK"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="studio-label">Delivery Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. High-Res Editorial Master Selects (RAW + TIFF)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="studio-input"
            />
          </div>

          <div>
            <label className="studio-label">Destination URL *</label>
            <input
              type="url"
              required
              placeholder="https://pixieset.com/gallery/... or Frame.io"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="studio-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="studio-label">Host Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="studio-select"
              >
                <option value="Pixieset">Pixieset</option>
                <option value="Frame.io">Frame.io</option>
                <option value="Google Drive">Google Drive</option>
                <option value="Dropbox">Dropbox</option>
                <option value="Vimeo Review">Vimeo Review</option>
                <option value="WeTransfer">WeTransfer</option>
                <option value="Other Cloud">Other Cloud</option>
              </select>
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
          </div>

          <div>
            <label className="studio-label">Access Pin / Password / Client Notes</label>
            <textarea
              rows={3}
              placeholder="Download PIN: 4892. Link expires in 60 days."
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
              {createLoading ? 'Publishing...' : 'Save Delivery Link'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        title="Revise Asset Delivery"
        subtitle={`UPDATE RECORD #${editTarget?.id}`}
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="studio-label">Title *</label>
            <input
              type="text"
              required
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="studio-input"
            />
          </div>

          <div>
            <label className="studio-label">URL *</label>
            <input
              type="url"
              required
              value={editForm.url}
              onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
              className="studio-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="studio-label">Platform</label>
              <select
                value={editForm.platform}
                onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}
                className="studio-select"
              >
                <option value="Pixieset">Pixieset</option>
                <option value="Frame.io">Frame.io</option>
                <option value="Google Drive">Google Drive</option>
                <option value="Dropbox">Dropbox</option>
                <option value="Vimeo Review">Vimeo Review</option>
                <option value="WeTransfer">WeTransfer</option>
                <option value="Other Cloud">Other Cloud</option>
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
              {editLoading ? 'Saving...' : 'Save Revisions'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete Delivery Link #${deleteTarget?.id}`}
        message={`Are you sure you want to delete delivery "${deleteTarget?.title}"?`}
        confirmText="Confirm Delete"
        loading={deleteLoading}
      />
    </div>
  );
}
