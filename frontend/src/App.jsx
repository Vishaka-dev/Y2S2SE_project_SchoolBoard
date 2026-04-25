import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { MessageProvider } from './context/MessageContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuth2Redirect from './pages/OAuth2Redirect';
import EditProfile from './pages/EditProfile';
import ConfirmDelete from './pages/ConfirmDelete';
import CompleteProfile from './pages/CompleteProfile';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Connections from './pages/Connections';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import ResourceHub from './pages/ResourceHub';
import MyGroups from './pages/MyGroups';
import CreateGroup from './pages/CreateGroup';
import GroupDetails from './pages/GroupDetails';
import EditGroup from './pages/EditGroup';
import Events from './pages/Events';
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
      <Route 
        path="/" 
        element={
          loading ? (
            <LoadingSpinner />
          ) : user ? (
            <Navigate to="/feed" replace />
          ) : (
            <Landing />
          )
        } 
      />
      
      {/* Login Route - Check if user is already authenticated */}
      <Route 
        path="/login" 
        element={
          loading ? (
            <LoadingSpinner />
          ) : user ? (
            <Navigate to="/feed" replace />
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
            <Navigate to="/feed" replace />
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
        path="/feed" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
      </Route>

      <Route
        path="/dashboard"
        element={<Navigate to="/feed" replace />}
      />
      <Route 
        path="/posts/:targetPostId" 
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
        path="/profile/:userId"
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

      <Route
        path="/resource-hub"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ResourceHub />} />
      </Route>

      {/* Group Routes */}
      <Route
        path="/groups"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MyGroups />} />
      </Route>

      <Route
        path="/groups/create"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CreateGroup />} />
      </Route>

      <Route
        path="/groups/:groupId"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<GroupDetails />} />
      </Route>

      <Route
        path="/groups/:groupId/edit"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EditGroup />} />
      </Route>

      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Events />} />
      </Route>
      
      {/* Account Management Routes - Also in DashboardLayout */}
      <Route 
        path="/account/edit-profile" 
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/complete-profile"
        element={
          <ProtectedRoute>
            <CompleteProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/confirm-delete"
        element={<ConfirmDelete />}
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
        <NotificationProvider>
          <MessageProvider>
            <AppRoutes />
          </MessageProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

