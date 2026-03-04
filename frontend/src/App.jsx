import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuth2Redirect from './pages/OAuth2Redirect';
import AccountSettings from './pages/AccountSettings';
import EditProfile from './pages/EditProfile';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Connections from './pages/Connections';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

/**
 * AppRoutes component - handles all routing logic with authentication context
 * Separated from App to have access to AuthContext
 */
function AppRoutes() {
  const { user, loading } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      
      {/* Login Route - Check if user is already authenticated */}
      <Route 
        path="/login" 
        element={
          loading ? (
            <LoadingSpinner />
          ) : user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login />
          )
        } 
      />
      
      {/* Register Route - Check if user is already authenticated */}
      <Route 
        path="/register" 
        element={
          loading ? (
            <LoadingSpinner />
          ) : user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Register />
          )
        } 
      />
      
      {/* OAuth2 Routes */}
      <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
      <Route path="/oauth2/success" element={<OAuth2Redirect />} />
      
      {/* Protected Dashboard Routes - All wrapped in DashboardLayout */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
      </Route>
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      
      <Route 
        path="/connections" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Connections />} />
      </Route>
      
      <Route 
        path="/messages" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Messages />} />
      </Route>
      
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Notifications />} />
      </Route>
      
      {/* Account Management Routes - Also in DashboardLayout */}
      <Route 
        path="/account/settings" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AccountSettings />} />
      </Route>
      
      <Route 
        path="/account/edit-profile" 
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

