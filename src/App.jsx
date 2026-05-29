import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import MainLayout from './layouts/MainLayout';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import InstagramCallback from './features/auth/InstagramCallback';
import Dashboard from './features/dashboard/Dashboard';
import CreatePost from './features/posts/CreatePost';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Guard (Redirects to home if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public auth pages */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* Instagram OAuth redirect callback landing page */}
        <Route 
          path="/auth/instagram/callback" 
          element={
            <ProtectedRoute>
              <InstagramCallback />
            </ProtectedRoute>
          } 
        />

        {/* Dashboard & Create post pages */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreatePost />
              </MainLayout>
            </ProtectedRoute>
          } 
        />

        {/* Fallback routing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
