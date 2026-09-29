import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import AppLayout from './components/layout/AppLayout';

// Core Studio Modules
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import ClientsPage from './pages/clients/ClientsPage';
import ClientDetailPage from './pages/clients/ClientDetailPage';
import BookingsPage from './pages/bookings/BookingsPage';
import QuotesPage from './pages/quotes/QuotesPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import DeliveriesPage from './pages/deliveries/DeliveriesPage';
import InventoryPage from './pages/inventory/InventoryPage';
import InventoryDetailPage from './pages/inventory/InventoryDetailPage';
import SettingsPage from './pages/settings/SettingsPage';

// 404 Fallback
import NotFoundPage from './pages/notFound/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Core OS Layout & Modules (Direct Access) */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:id" element={<ProjectDetailPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="clients/:id" element={<ClientDetailPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="quotes" element={<QuotesPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="deliveries" element={<DeliveriesPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="inventory/:id" element={<InventoryDetailPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Legacy Auth Redirections */}
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/register" element={<Navigate to="/dashboard" replace />} />

            {/* 404 Route */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
