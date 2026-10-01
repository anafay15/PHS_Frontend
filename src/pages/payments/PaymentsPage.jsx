import { useState, useEffect } from 'react';
import { paymentsApi, PAYMENT_TYPES, PAYMENT_STATUSES, PAYMENT_METHODS } from '../../api/payments';
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
  CreditCard,
  Plus,
  Trash2,
  Edit2,
} from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'DEPOSIT',
    status: 'PENDING',
    method: '',
    projectId: '',
    paidAt: '',
    notes: '',
  });

  // Edit Modal
  const [editTarget, setEditTarget] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    amount: '',
    type: 'DEPOSIT',
    status: 'PENDING',
    method: '',
    projectId: '',
    paidAt: '',
    notes: '',
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [payData, pData] = await Promise.all([
        paymentsApi.getPayments(),
        projectsApi.getProjects().catch(() => []),
      ]);
      setPayments(unwrapList(payData, 'payments'));
      setProjects(unwrapList(pData, 'projects'));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error querying payments ledger.'));
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
    if (!formData.amount || !projectId) {
      toast.error('Amount, type and project are required.');
      return;
    }

    try {
      setCreateLoading(true);
      const created = await paymentsApi.createPayment({
        projectId,
        amount: Number(formData.amount),
        type: formData.type,
        method: formData.method || undefined,
        notes: formData.notes || undefined,
      });
      if (created?.id && (formData.status !== 'PENDING' || formData.paidAt)) {
        await paymentsApi.updatePayment(created.id, {
          status: formData.status,
          paidAt: formData.paidAt || (formData.status === 'PAID' ? new Date().toISOString() : undefined),
          method: formData.method || undefined,
        });
      }
      toast.success('Payment entry logged in financial ledger.');
      setIsCreateOpen(false);
      setFormData({
        amount: '',
        type: 'DEPOSIT',
        status: 'PENDING',
        method: '',
        projectId: '',
        paidAt: '',
        notes: '',
      });
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to record payment.'));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditOpen = (pay) => {
    setEditTarget(pay);
    setEditForm({
      amount: pay.amount ?? '',
      type: pay.type || 'DEPOSIT',
      status: pay.status || 'PENDING',
      method: pay.method || '',
      projectId: pay.projectId || pay.project?.id || '',
      paidAt: toDateInputValue(pay.paidAt),
      notes: pay.notes || '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      setEditLoading(true);
      await paymentsApi.updatePayment(editTarget.id, {
        amount: Number(editForm.amount),
        type: editForm.type,
        status: editForm.status,
        method: editForm.method || null,
        notes: editForm.notes,
        paidAt: editForm.paidAt || (editForm.status === 'PAID' ? new Date().toISOString() : null),
      });
      toast.success('Payment transaction record modified.');
      setEditTarget(null);
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update payment.'));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await paymentsApi.deletePayment(deleteTarget.id);
      toast.success(`Payment record #${deleteTarget.id} erased.`);
      setDeleteTarget(null);
      setPayments((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    } catch (err) {
      console.error('Failed to delete payment', err);
      toast.error(getApiErrorMessage(err, 'Failed to delete payment.'));
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
          <span className="editorial-tag">FINANCIAL SETTLEMENTS // 06</span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', margin: '4px 0 0' }}>
            Payments & Invoices
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="studio-btn studio-btn-primary"
        >
          <Plus size={14} /> Log Transaction
        </button>
      </div>

      {/* Payments Table */}
      {loading ? (
        <LoadingSpinner text="ACCESSING FINANCIAL TRANSACTIONS DATABASE..." />
      ) : payments.length === 0 ? (
        <EmptyState
          title="No payments logged"
          description="Zero financial transactions or invoices registered in the system ledger."
          actionLabel="Log Transaction"
          onAction={() => setIsCreateOpen(true)}
          icon={CreditCard}
        />
      ) : (
        <ScrollReveal>
          <div className="studio-table-container">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Linked Project</th>
                  <th>Method</th>
                  <th>Paid Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono" style={{ color: '#71717a', fontSize: '11px' }}>
                      #{p.id}
                    </td>
                    <td className="font-mono" style={{ fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="font-mono" style={{ fontSize: '11px', color: '#d4d4d8' }}>
                      {p.type || 'DEPOSIT'}
                    </td>
                    <td>
                      <StatusBadge status={p.status || 'PENDING'} />
                    </td>
                    <td style={{ color: '#a1a1aa', fontSize: '13px' }}>
                      {projectName(p.project, p.projectId ? `Project #${p.projectId}` : '—')}
                    </td>
                    <td className="font-mono" style={{ fontSize: '11px', color: '#71717a' }}>
                      {p.method || '—'}
                    </td>
                    <td className="font-mono" style={{ fontSize: '11px', color: '#71717a' }}>
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}
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
                          onClick={() => handleEditOpen(p)}
                          className="studio-btn studio-btn-ghost"
                          style={{ padding: '6px' }}
                          title="Revise Payment"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(p)}
                          className="studio-btn studio-btn-ghost"
                          style={{ padding: '6px', color: '#ef4444' }}
                          title="Delete Payment"
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
        title="Log Financial Transaction"
        subtitle="RECORD INVOICE OR PAYMENT RECEIPT"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="studio-label">Amount ($) *</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="2500"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="studio-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="studio-label">Payment Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="studio-select"
              >
                {PAYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="studio-label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="studio-select"
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            
            <div>
              <label className="studio-label">Paid At Date</label>
              <input
                type="date"
                value={formData.paidAt}
                onChange={(e) => setFormData({ ...formData, paidAt: e.target.value })}
                className="studio-input"
              />
            </div>
          </div>

          <div>
            <label className="studio-label">Assign To Project</label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="studio-select"
            >
              <option value="">-- No Project Linked --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (#{p.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="studio-label">Notes & Transaction Reference</label>
            <textarea
              rows={3}
              placeholder="Wire transfer confirmation #, Stripe intent ID, check #..."
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
              {createLoading ? 'Logging...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        title="Revise Payment Transaction"
        subtitle={`UPDATE RECORD #${editTarget?.id}`}
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="studio-label">Payment Type</label>
              <select
                value={editForm.type}
                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                className="studio-select"
              >
                {PAYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
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
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            
            <div>
              <label className="studio-label">Paid At Date</label>
              <input
                type="date"
                value={editForm.paidAt}
                onChange={(e) => setEditForm({ ...editForm, paidAt: e.target.value })}
                className="studio-input"
              />
            </div>
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
                  {p.name} (#{p.id})
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
        title={`Delete Payment Record #${deleteTarget?.id}`}
        message={`Are you sure you wish to permanently erase this ${formatCurrency(deleteTarget?.amount)} payment record?`}
        confirmText="Confirm Delete"
        loading={deleteLoading}
      />
    </div>
  );
}
