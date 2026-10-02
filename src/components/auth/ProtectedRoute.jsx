import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-base, #080808)',
        }}
      >
        <LoadingSpinner text="VERIFYING OPERATOR CLEARANCE..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login preserving the attempted destination
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
