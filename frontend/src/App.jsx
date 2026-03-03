import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OAuth2Redirect from './pages/OAuth2Redirect';
import ProtectedRoute from './components/ProtectedRoute';
import authService from './services/authService';
import StyleGuide from './pages/StyleGuide';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/style-guide" element={<StyleGuide />} />
        <Route 
          path="/login" 
          element={
            authService.isAuthenticated() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            authService.isAuthenticated() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          } 
        />
        
        {/* OAuth2 Routes */}
        <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
        <Route path="/oauth2/success" element={<OAuth2Redirect />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

