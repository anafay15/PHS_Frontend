import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  inventoryApi,
  INVENTORY_CATEGORIES,
  INVENTORY_CONDITIONS,
  INVENTORY_STATUSES,
} from '../../api/inventory';
import { assignmentsApi } from '../../api/assignments';
import { maintenanceApi } from '../../api/maintenance';
import { projectsApi } from '../../api/projects';
import { bookingsApi } from '../../api/bookings';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Wrench,
  CheckCircle,
  Plus,
  User,
} from 'lucide-react';

export default function InventoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [item, setItem] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [projects, setProjects] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Item Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    category: 'CAMERA',
    serialNumber: '',
    condition: 'GOOD',
    status: 'AVAILABLE',
    purchaseDate: '',
    purchasePrice: '',
    notes: '',
  });

  // Assign Modal
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignForm, setAssignForm] = useState({
    projectId: '',
    quantity: '1',
    notes: '',
  });

  // Maintenance Modal
  const [isMaintOpen, setIsMaintOpen] = useState(false);
  const [maintLoading, setMaintLoading] = useState(false);
  const [maintForm, setMaintForm] = useState({
    description: '',
    cost: '',
    date: '',
    status: 'IN_PROGRESS',
    notes: '',
  });

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Delete Maintenance Target
  const [deleteMaintTarget, setDeleteMaintTarget] = useState(null);
  const [deleteMaintLoading, setDeleteMaintLoading] = useState(false);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [itemData, assignData, maintData, projData, bookData] = await Promise.all([
        inventoryApi.getInventoryItem(id),
        assignmentsApi.getInventoryAssignments(id).catch(() => []),
        maintenanceApi.getMaintenanceRecords(id).catch(() => []),
        projectsApi.getProjects().catch(() => []),
        bookingsApi.getBookings().catch(() => []),
      ]);

      const loadedItem = itemData?.inventory || itemData;
      setItem(loadedItem);
      setAssignments(Array.isArray(assignData) ? assignData : assignData?.assignments || []);
      setMaintenance(Array.isArray(maintData) ? maintData : maintData?.maintenance || []);
      setProjects(Array.isArray(projData) ? projData : projData?.projects || []);
      setBookings(Array.isArray(bookData) ? bookData : bookData?.bookings || []);

      setEditForm({
        name: loadedItem.name || '',
        category: loadedItem.category || 'CAMERA',
        serialNumber: loadedItem.serialNumber || '',
        condition: loadedItem.condition || 'GOOD',
        status: loadedItem.status || 'AVAILABLE',
        purchaseDate: loadedItem.purchaseDate ? loadedItem.purchaseDate.split('T')[0] : '',
        purchasePrice: loadedItem.purchasePrice ?? '',
        notes: loadedItem.notes || '',
      });
    } catch (err) {
      console.error('Failed to load gear detail', err);
      toast.error(err.response?.data?.message || 'Could not retrieve equipment data.');
      navigate('/inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      const payload = { ...editForm };
      if (payload.purchasePrice) payload.purchasePrice = Number(payload.purchasePrice);
      const res = await inventoryApi.updateInventoryItem(id, payload);
      toast.success('Equipment record updated.');
      setItem(res?.inventory || res || { ...item, ...payload });
      setIsEditOpen(false);
    } catch (err) {
      console.error('Failed to update gear', err);
      toast.error(err.response?.data?.message || 'Failed to update gear details.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      setAssignLoading(true);
      const projectId = Number(assignForm.projectId);
      if (!Number.isInteger(projectId) || projectId <= 0) {
        toast.error('A project is required for an equipment assignment.');
        return;
      }
      const payload = {
        projectId,
        quantity: Number(assignForm.quantity) || 1,
        notes: assignForm.notes || undefined,
      };
      await assignmentsApi.assignEquipment(id, payload);
      toast.success('Equipment assigned to deployment.');
      setIsAssignOpen(false);
      setAssignForm({ projectId: '', quantity: '1', notes: '' });
      fetchAllData();
    } catch (err) {
      console.error('Assignment failed', err);
      toast.error(err.response?.data?.message || 'Failed to assign equipment.');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleReturnEquipment = async (assignmentId) => {
    try {
      await assignmentsApi.returnEquipment(assignmentId);
      toast.success('Equipment marked as returned to locker.');
      fetchAllData();
    } catch (err) {
      console.error('Return failed', err);
      toast.error(err.response?.data?.message || 'Failed to return equipment.');
    }
  };

  const handleMaintSubmit = async (e) => {
    e.preventDefault();
    if (!maintForm.description.trim()) {
      toast.error('Maintenance description is required.');
      return;
    }
    try {
      setMaintLoading(true);
      const payload = {
        description: maintForm.description.trim(),
        cost: maintForm.cost ? Number(maintForm.cost) : undefined,
        date: maintForm.date || undefined,
        status: maintForm.status,
        notes: maintForm.notes || undefined,
      };
      await maintenanceApi.createMaintenanceRecord(id, payload);
      toast.success('Maintenance ticket logged.');
      setIsMaintOpen(false);
      setMaintForm({ description: '', cost: '', date: '', status: 'IN_PROGRESS', notes: '' });
      fetchAllData();
    } catch (err) {
      console.error('Failed to log maintenance', err);
      toast.error(err.response?.data?.message || 'Failed to record maintenance ticket.');
    } finally {
      setMaintLoading(false);
    }
  };

  const handleDeleteMaint = async () => {
    if (!deleteMaintTarget) return;
    try {
      setDeleteMaintLoading(true);
      await maintenanceApi.deleteMaintenanceRecord(deleteMaintTarget.id);
      toast.success('Maintenance record deleted.');
      setDeleteMaintTarget(null);
      setMaintenance((prev) => prev.filter((m) => m.id !== deleteMaintTarget.id));
    } catch (err) {
      console.error('Failed to delete maintenance record', err);
      toast.error(err.response?.data?.message || 'Failed to delete maintenance.');
    } finally {
      setDeleteMaintLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    try {
      setDeleteLoading(true);
      await inventoryApi.deleteInventoryItem(id);
      toast.success('Equipment asset removed from inventory.');
      navigate('/inventory');
    } catch (err) {
      console.error('Delete item failed', err);
      toast.error(err.response?.data?.message || 'Failed to delete equipment.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="ACCESSING EQUIPMENT DOSSIER..." />;
  }

  if (!item) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <Link
          to="/inventory"
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
          <ArrowLeft size={13} /> Back to Gear Inventory
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="editorial-tag">ASSET // #{item.id}</span>
            <span className="editorial-tag" style={{ color: '#ffffff' }}>
              {item.category}
            </span>
            <StatusBadge status={item.status} />
            <StatusBadge status={item.condition} />
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '0 0 10px' }}>
            {item.name}
          </h1>

          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '13px',
              color: '#a1a1aa',
            }}
          >
            SERIAL NO: {item.serialNumber || 'UNASSIGNED'}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setIsAssignOpen(true)}
            className="studio-btn studio-btn-primary"
          >
            <User size={14} /> Assign Gear
          </button>
          <button
            type="button"
            onClick={() => setIsMaintOpen(true)}
            className="studio-btn studio-btn-outline"
          >
            <Wrench size={14} /> Log Maintenance
          </button>
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="studio-btn studio-btn-outline"
          >
            <Edit2 size={14} /> Edit
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="studio-btn studio-btn-danger"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Specifications Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        <div className="studio-card" style={{ padding: '20px' }}>
          <span className="editorial-tag">LOGISTICS DETAILS</span>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: '#71717a' }}>Category</span>
              <span className="font-mono">{item.category}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: '#71717a' }}>Condition</span>
              <span className="font-mono">{item.condition}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#71717a' }}>Status</span>
              <span className="font-mono">{item.status}</span>
            </div>
          </div>
        </div>

        <div className="studio-card" style={{ padding: '20px' }}>
          <span className="editorial-tag">FINANCIAL & PURCHASE</span>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: '#71717a' }}>Purchase Price</span>
              <span className="font-mono" style={{ color: '#ffffff' }}>
                {item.purchasePrice ? `$${Number(item.purchasePrice).toLocaleString()}` : '—'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: '#71717a' }}>Purchase Date</span>
              <span className="font-mono">
                {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : '—'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#71717a' }}>Registered At</span>
              <span className="font-mono">
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Assignments Section */}
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
            <span className="editorial-tag">DEPLOYMENT REGISTRY</span>
            <h3 style={{ fontSize: '16px', margin: '4px 0 0' }}>
              Active & Historic Assignments ({assignments.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsAssignOpen(true)}
            className="studio-btn studio-btn-outline"
            style={{ padding: '6px 12px', fontSize: '11px' }}
          >
            <Plus size={12} /> Assign To Field
          </button>
        </div>

        {assignments.length === 0 ? (
          <p style={{ color: '#71717a', fontSize: '13px' }}>
            No gear assignments on record. Equipment currently resting in studio locker.
          </p>
        ) : (
          <div className="studio-table-container">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>Assignment ID</th>
                  <th>Assigned Operator</th>
                  <th>Project / Booking</th>
                  <th>Date Assigned</th>
                  <th>Return Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td className="font-mono" style={{ color: '#71717a', fontSize: '11px' }}>
                      #{a.id}
                    </td>
                    <td style={{ fontWeight: 500, color: '#ffffff' }}>
                      {a.project?.name || (a.projectId ? `Project #${a.projectId}` : '—')}
                    </td>
                    <td style={{ color: '#a1a1aa' }}>
                      {a.project?.name || (a.projectId ? `Project #${a.projectId}` : '—')}
                    </td>
                    <td className="font-mono" style={{ fontSize: '11px', color: '#71717a' }}>
                      {a.assignedAt ? new Date(a.assignedAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      {a.returnedAt ? (
                        <span style={{ color: '#4ade80', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                          RETURNED ({new Date(a.returnedAt).toLocaleDateString()})
                        </span>
                      ) : (
                        <span style={{ color: '#fb923c', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                          IN FIELD / DEPLOYED
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {!a.returnedAt && (
                        <button
                          type="button"
                          onClick={() => handleReturnEquipment(a.id)}
                          className="studio-btn studio-btn-outline"
                          style={{ padding: '4px 8px', fontSize: '10px' }}
                        >
                          <CheckCircle size={12} /> Mark Returned
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Equipment Maintenance Section */}
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
            <span className="editorial-tag">SERVICE & REPAIR LOG</span>
            <h3 style={{ fontSize: '16px', margin: '4px 0 0' }}>
              Maintenance Records ({maintenance.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsMaintOpen(true)}
            className="studio-btn studio-btn-outline"
            style={{ padding: '6px 12px', fontSize: '11px' }}
          >
            <Plus size={12} /> Log Service Ticket
          </button>
        </div>

        {maintenance.length === 0 ? (
          <p style={{ color: '#71717a', fontSize: '13px' }}>
            Zero service incidents or repair records logged. Equipment is operational.
          </p>
        ) : (
          <div className="studio-table-container">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Reported Issue</th>
                  <th>Cost ($)</th>
                  <th>Service Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.map((m) => (
                  <tr key={m.id}>
                    <td className="font-mono" style={{ color: '#71717a', fontSize: '11px' }}>
                      #{m.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#ffffff' }}>{m.description}</div>
                      {m.notes && (
                        <div style={{ color: '#71717a', fontSize: '12px' }}>{m.notes}</div>
                      )}
                    </td>
                    <td className="font-mono" style={{ color: '#d4d4d8' }}>
                      {m.cost ? `$${Number(m.cost).toLocaleString()}` : '—'}
                    </td>
                    <td className="font-mono" style={{ fontSize: '11px', color: '#71717a' }}>
                      {m.date ? new Date(m.date).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <StatusBadge status={m.status || 'IN_PROGRESS'} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setDeleteMaintTarget(m)}
                        className="studio-btn studio-btn-ghost"
                        style={{ padding: '6px', color: '#ef4444' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Equipment Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Revise Equipment Specifications"
        subtitle={`UPDATE HARDWARE #${item.id}`}
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="studio-label">Name *</label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="studio-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="studio-label">Category</label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
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
                value={editForm.serialNumber}
                onChange={(e) => setEditForm({ ...editForm, serialNumber: e.target.value })}
                className="studio-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="studio-label">Condition</label>
              <select
                value={editForm.condition}
                onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
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
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
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
                value={editForm.purchaseDate}
                onChange={(e) => setEditForm({ ...editForm, purchaseDate: e.target.value })}
                className="studio-input"
              />
            </div>
            <div>
              <label className="studio-label">Purchase Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={editForm.purchasePrice}
                onChange={(e) => setEditForm({ ...editForm, purchasePrice: e.target.value })}
                className="studio-input"
              />
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

      {/* Assign Gear Modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Assign Gear To Deployment"
        subtitle={`CHECK OUT EQUIPMENT #${item.id}`}
      >
        <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="studio-label">Quantity *</label>
            <input
              type="number"
              min="1"
              required
              value={assignForm.quantity}
              onChange={(e) => setAssignForm({ ...assignForm, quantity: e.target.value })}
              className="studio-input"
            />
          </div>

          <div>
            <label className="studio-label">Deploy To Project *</label>
            <select
              value={assignForm.projectId}
              onChange={(e) => setAssignForm({ ...assignForm, projectId: e.target.value })}
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
            <label className="studio-label">Deployment Notes</label>
            <textarea
              rows={3}
              placeholder="Checked out with 4 batteries, 2 CFexpress Type A cards, battery charger..."
              value={assignForm.notes}
              onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
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
              onClick={() => setIsAssignOpen(false)}
              className="studio-btn studio-btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignLoading}
              className="studio-btn studio-btn-primary"
            >
              {assignLoading ? 'Deploying...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Log Maintenance Modal */}
      <Modal
        isOpen={isMaintOpen}
        onClose={() => setIsMaintOpen(false)}
        title="Log Service Ticket"
        subtitle={`MAINTENANCE PROTOCOL // ASSET #${item.id}`}
      >
        <form onSubmit={handleMaintSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="studio-label">Service Issue / Inspection Details *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sensor cleaning, lens calibration, mount repair"
              value={maintForm.description}
              onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })}
              className="studio-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="studio-label">Repair Cost ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="250.00"
                value={maintForm.cost}
                onChange={(e) => setMaintForm({ ...maintForm, cost: e.target.value })}
                className="studio-input"
              />
            </div>
            <div>
              <label className="studio-label">Ticket Status</label>
              <select
                value={maintForm.status}
                onChange={(e) => setMaintForm({ ...maintForm, status: e.target.value })}
                className="studio-select"
              >
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="studio-label">Service Date</label>
              <input
                type="date"
                value={maintForm.date}
                onChange={(e) => setMaintForm({ ...maintForm, date: e.target.value })}
                className="studio-input"
              />
            </div>
            
          </div>

          <div>
            <label className="studio-label">Service Center Notes</label>
            <textarea
              rows={3}
              placeholder="Sent to authorized Sony Pro Service facility in New Jersey."
              value={maintForm.notes}
              onChange={(e) => setMaintForm({ ...maintForm, notes: e.target.value })}
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
              onClick={() => setIsMaintOpen(false)}
              className="studio-btn studio-btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={maintLoading}
              className="studio-btn studio-btn-primary"
            >
              {maintLoading ? 'Submitting...' : 'Log Ticket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Item Confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteItem}
        title={`Delete Equipment #${item.id}`}
        message={`Are you sure you want to permanently erase ${item.name} from the hardware registry?`}
        confirmText="Confirm Delete"
        loading={deleteLoading}
      />

      {/* Delete Maintenance Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteMaintTarget)}
        onClose={() => setDeleteMaintTarget(null)}
        onConfirm={handleDeleteMaint}
        title={`Delete Maintenance Record #${deleteMaintTarget?.id}`}
        message="Are you sure you want to delete this service record?"
        confirmText="Confirm Delete"
        loading={deleteMaintLoading}
      />
    </div>
  );
}
