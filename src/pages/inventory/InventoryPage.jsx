import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  inventoryApi,
  INVENTORY_CATEGORIES,
  INVENTORY_CONDITIONS,
  INVENTORY_STATUSES,
} from '../../api/inventory';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ScrollReveal from '../../components/layout/ScrollReveal';
import {
  Camera,
  Plus,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Tag,
  Wrench,
  Clock,
} from 'lucide-react';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'CAMERA',
    serialNumber: '',
    condition: 'GOOD',
    status: 'AVAILABLE',
    purchaseDate: '',
    purchasePrice: '',
    notes: '',
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getInventory();
      setItems(Array.isArray(data) ? data : data?.inventory || []);
    } catch (err) {
      console.error('Failed to load inventory', err);
      toast.error(err.response?.data?.message || 'Error querying inventory database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Equipment item name is required.');
      return;
    }

    try {
      setCreateLoading(true);
      const payload = {
        name: formData.name,
        category: formData.category,
        serialNumber: formData.serialNumber,
        condition: formData.condition,
        status: formData.status,
        notes: formData.notes,
      };
      if (formData.purchaseDate) payload.purchaseDate = formData.purchaseDate;
      if (formData.purchasePrice) payload.purchasePrice = Number(formData.purchasePrice);

      await inventoryApi.createInventoryItem(payload);
      toast.success('Equipment registered in studio inventory.');
      setIsCreateOpen(false);
      setFormData({
        name: '',
        category: 'CAMERA',
        serialNumber: '',
        condition: 'GOOD',
        status: 'AVAILABLE',
        purchaseDate: '',
        purchasePrice: '',
        notes: '',
      });
      loadInventory();
    } catch (err) {
      console.error('Failed to create inventory item', err);
      toast.error(err.response?.data?.message || 'Failed to register gear.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await inventoryApi.deleteInventoryItem(deleteTarget.id);
      toast.success(`Inventory #${deleteTarget.id} removed.`);
      setDeleteTarget(null);
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    } catch (err) {
      console.error('Failed to delete gear', err);
      toast.error(err.response?.data?.message || 'Failed to delete gear item.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.serialNumber && item.serialNumber.toLowerCase().includes(q));
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesStat = selectedStatus === 'ALL' || item.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStat;
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
          <span className="editorial-tag">HARDWARE ASSETS // 08</span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', margin: '4px 0 0' }}>
            Equipment & Camera Inventory
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="studio-btn studio-btn-primary"
        >
          <Plus size={14} /> Register Gear
        </button>
      </div>

      {/* Filters and Search */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ maxWidth: '360px', width: '100%', position: 'relative' }}>
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
            placeholder="Search by gear name, serial #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="studio-input"
            style={{ paddingLeft: '34px' }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="studio-select"
            style={{ width: 'auto' }}
          >
            <option value="ALL">ALL CATEGORIES</option>
            {INVENTORY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="studio-select"
            style={{ width: 'auto' }}
          >
            <option value="ALL">ALL STATUSES</option>
            {INVENTORY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table / Empty State */}
      {loading ? (
        <LoadingSpinner text="ACCESSING EQUIPMENT INVENTORY VAULT..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No equipment registered"
          description={
            searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
              ? 'No gear items match your selected filters.'
              : 'The equipment inventory is currently empty. Register cameras, lenses, and lighting equipment to track deployments.'
          }
          actionLabel="Register Gear"
          onAction={() => setIsCreateOpen(true)}
          icon={Camera}
        />
      ) : (
        <ScrollReveal>
          <div className="studio-table-container">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>Asset ID</th>
                  <th>Equipment Item</th>
                  <th>Category</th>
                  <th>Serial #</th>
                  <th>Condition</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td className="font-mono" style={{ color: '#71717a', fontSize: '11px' }}>
                      #{item.id}
                    </td>
                    <td>
                      <Link
                        to={`/inventory/${item.id}`}
                        style={{
                          fontWeight: 600,
                          color: '#ffffff',
                          textDecoration: 'none',
                          fontSize: '14px',
                        }}
                      >
                        {item.name}
                      </Link>
                      {item.notes && (
                        <div style={{ color: '#71717a', fontSize: '12px', marginTop: '2px' }}>
                          {item.notes}
                        </div>
                      )}
                    </td>
                    <td className="font-mono" style={{ fontSize: '11px', color: '#a1a1aa' }}>
                      {item.category}
                    </td>
                    <td className="font-mono" style={{ fontSize: '12px', color: '#d4d4d8' }}>
                      {item.serialNumber || '—'}
                    </td>
                    <td>
                      <StatusBadge status={item.condition || 'GOOD'} />
                    </td>
                    <td>
                      <StatusBadge status={item.status || 'AVAILABLE'} />
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
                          to={`/inventory/${item.id}`}
                          className="studio-btn studio-btn-ghost"
                          style={{ padding: '6px' }}
                          title="Open Gear Details"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="studio-btn studio-btn-ghost"
                          style={{ padding: '6px', color: '#ef4444' }}
                          title="Delete Gear"
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
        title="Register Equipment Asset"
        subtitle="HARDWARE DEPLOYMENT TRACKING"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="studio-label">Equipment Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sony FX6 Cinema Camera Body"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="studio-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="studio-label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="studio-select"
              >
                {INVENTORY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="studio-label">Serial Number</label>
              <input
                type="text"
                placeholder="SN-94810283"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="studio-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="studio-label">Physical Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="studio-select"
              >
                {INVENTORY_CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
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
                {INVENTORY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="studio-label">Purchase Date</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="studio-input"
              />
            </div>
            <div>
              <label className="studio-label">Purchase Price ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="5998.00"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                className="studio-input"
              />
            </div>
          </div>

          <div>
            <label className="studio-label">Notes & Specifications</label>
            <textarea
              rows={3}
              placeholder="Firmware v4.0, Pelican hard case included, V-mount plate installed..."
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
              {createLoading ? 'Registering...' : 'Register Gear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete Equipment #${deleteTarget?.id}`}
        message={`Confirm permanent deletion of ${deleteTarget?.name} from studio inventory?`}
        confirmText="Confirm Delete"
        loading={deleteLoading}
      />
    </div>
  );
}
