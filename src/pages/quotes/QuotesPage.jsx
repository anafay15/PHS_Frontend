import { useState, useEffect } from 'react';
import { quotesApi, QUOTE_STATUSES } from '../../api/quotes';
import { projectsApi } from '../../api/projects';
import { useToast } from '../../context/ToastContext';
import {
  getApiErrorMessage,
  unwrapList,
  toIntId,
  toDateInputValue,
  formatCurrency,
  projectName,
} from '../../utils/api';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ScrollReveal from '../../components/layout/ScrollReveal';
import {
  FileText,
  Plus,
  CheckCircle,
  Trash2,
  Edit2,
} from 'lucide-react';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    discount: '',
    validUntil: '',
    status: 'DRAFT',
    projectId: '',
    description: '',
  });

  // Edit Modal
  const [editTarget, setEditTarget] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    amount: '',
    discount: '',
    validUntil: '',
    status: 'DRAFT',
    projectId: '',
    description: '',
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [qData, pData] = await Promise.all([
        quotesApi.getQuotes(),
        projectsApi.getProjects().catch(() => []),
      ]);
      setQuotes(unwrapList(qData, 'quotes'));
      setProjects(unwrapList(pData, 'projects'));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error querying quotes ledger.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const projectId = toIntId(formData.projectId);
    if (!formData.title || !formData.amount || !projectId) {
      toast.error('Title, amount and project are required.');
      return;
    }

    try {
      setCreateLoading(true);
      const created = await quotesApi.createQuote({
        projectId,
        title: formData.title,
        description: formData.description || undefined,
        amount: Number(formData.amount),
        discount: formData.discount ? Number(formData.discount) : 0,
        validUntil: formData.validUntil || undefined,
      });
      if (formData.status && formData.status !== 'DRAFT' && created?.id) {
        await quotesApi.updateQuote(created.id, { status: formData.status });
      }
      toast.success('Proposal quote drafted.');
      setIsCreateOpen(false);
      setFormData({
        title: '',
        amount: '',
        discount: '',
        validUntil: '',
        status: 'DRAFT',
        projectId: '',
        description: '',
      });
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to draft quote.'));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await quotesApi.acceptQuote(id);
      toast.success(`Quote #${id} accepted.`);
      loadData();
    } catch (err) {
      console.error('Failed to accept quote', err);
      toast.error(getApiErrorMessage(err, 'Failed to accept quote.'));
    }
  };

  const handleEditOpen = (quote) => {
    setEditTarget(quote);
    setEditForm({
      title: quote.title || '',
      amount: quote.amount ?? '',
      discount: quote.discount ?? '',
      validUntil: toDateInputValue(quote.validUntil),
      status: quote.status || 'DRAFT',
      projectId: quote.projectId || quote.project?.id || '',
      description: quote.description || '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      setEditLoading(true);
      await quotesApi.updateQuote(editTarget.id, {
        title: editForm.title,
        description: editForm.description,
        amount: Number(editForm.amount),
        discount: editForm.discount ? Number(editForm.discount) : 0,
        status: editForm.status,
        validUntil: editForm.validUntil || null,
      });
      toast.success('Quote revised.');
      setEditTarget(null);
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update quote.'));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await quotesApi.deleteQuote(deleteTarget.id);
      toast.success(`Quote #${deleteTarget.id} deleted.`);
      setDeleteTarget(null);
      setQuotes((prev) => prev.filter((q) => q.id !== deleteTarget.id));
    } catch (err) {
      console.error('Failed to delete quote', err);
      toast.error(getApiErrorMessage(err, 'Failed to delete quote.'));
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
          <span className="editorial-tag">FINANCIAL PROPOSALS // 05</span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', margin: '4px 0 0' }}>
            Production Estimates & Quotes
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="studio-btn studio-btn-primary"
        >
          <Plus size={14} /> Draft Quote
        </button>
      </div>

      {/* Quotes Table */}
      {loading ? (
        <LoadingSpinner text="ACCESSING FINANCIAL ESTIMATES LEDGER..." />
      ) : quotes.length === 0 ? (
        <EmptyState
          title="No quotes drafted"
          description="There are currently zero estimate quotes logged in this system. Draft a quote to deliver to clients."
          actionLabel="Draft Quote"
          onAction={() => setIsCreateOpen(true)}
          icon={FileText}
        />
      ) : (
        <ScrollReveal>
          <div className="studio-table-container">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>Quote ID</th>
                  <th>Proposal Title</th>
                  <th>Subtotal</th>
                  <th>Discount</th>
                  <th>Net Total</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id}>
                    <td className="font-mono" style={{ color: '#71717a', fontSize: '11px' }}>
                      #{q.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{q.title}</div>
                      {q.validUntil && (
                        <div
                          style={{
                            fontFamily: 'var(--font-mono, monospace)',
                            fontSize: '11px',
                            color: '#71717a',
                            marginTop: '2px',
                          }}
                        >
                          Valid until: {new Date(q.validUntil).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="font-mono" style={{ color: '#d4d4d8' }}>
                      {formatCurrency(q.amount)}
                    </td>
                    <td className="font-mono" style={{ color: '#f87171' }}>
                      {q.discount ? `-${formatCurrency(q.discount)}` : '—'}
                    </td>
                    <td className="font-mono" style={{ fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>
                      {/* Backend calculates totalAmount = amount - discount */}
                      {formatCurrency(q.totalAmount ?? (Number(q.amount || 0) - Number(q.discount || 0)))}
                    </td>
                    <td style={{ color: '#a1a1aa', fontSize: '13px' }}>
                      {projectName(q.project, q.projectId ? `Project #${q.projectId}` : '—')}
                    </td>
                    <td>
                      <StatusBadge status={q.status || 'DRAFT'} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {q.status === 'SENT' && (
                          <button
                            type="button"
                            onClick={() => handleAccept(q.id)}
                            className="studio-btn studio-btn-outline"
                            style={{ padding: '5px 10px', fontSize: '11px', color: '#4ade80' }}
                            title="Accept Proposal"
                          >
                            <CheckCircle size={12} /> Accept
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleEditOpen(q)}
                          className="studio-btn studio-btn-ghost"
                          style={{ padding: '6px' }}
                          title="Revise Quote"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(q)}
                          className="studio-btn studio-btn-ghost"
                          style={{ padding: '6px', color: '#ef4444' }}
                          title="Delete Quote"
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
        title="Draft Estimate Proposal"
        subtitle="ESTIMATE GENERATOR // PRICING SCHEDULE"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="studio-label">Proposal Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Commercial Brand Campaign - Full Production"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="studio-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="studio-label">Base Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="4500"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="studio-input"
              />
            </div>
            <div>
              <label className="studio-label">Discount Deduction ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="500"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="studio-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="studio-label">Valid Until</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="studio-input"
              />
            </div>
            <div>
              <label className="studio-label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="studio-select"
              >
                {QUOTE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="studio-label">Assign To Project *</label>
            <select
              required
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="studio-select"
            >
              <option value="">-- Select Project --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {projectName(p)} (#{p.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="studio-label">Terms & Notes</label>
            <textarea
              rows={3}
              placeholder="50% deposit required upon signing. Net 15 terms on completion."
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
              disabled={createLoading}
              className="studio-btn studio-btn-primary"
            >
              {createLoading ? 'Drafting...' : 'Save Quote'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        title="Revise Proposal Quote"
        subtitle={`UPDATE QUOTE RECORD #${editTarget?.id}`}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="studio-label">Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                className="studio-input"
              />
            </div>
            <div>
              <label className="studio-label">Discount ($)</label>
              <input
                type="number"
                step="0.01"
                value={editForm.discount}
                onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })}
                className="studio-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="studio-label">Valid Until</label>
              <input
                type="date"
                value={editForm.validUntil}
                onChange={(e) => setEditForm({ ...editForm, validUntil: e.target.value })}
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
                {QUOTE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="studio-label">Linked Project</label>
            <div className="studio-input" style={{ color: '#a1a1aa' }}>
              {projectName(
                projects.find((p) => Number(p.id) === Number(editForm.projectId)),
                editForm.projectId ? `Project #${editForm.projectId}` : '—'
              )}
            </div>
          </div>

          <div>
            <label className="studio-label">Terms & Notes</label>
            <textarea
              rows={3}
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
        title={`Delete Quote #${deleteTarget?.id}`}
        message={`Are you sure you want to delete quote "${deleteTarget?.title}"?`}
        confirmText="Confirm Delete"
        loading={deleteLoading}
      />
    </div>
  );
}
