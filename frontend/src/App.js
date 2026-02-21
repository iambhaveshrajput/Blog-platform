import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import { ToastProvider } from './context/ToastContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import MyPosts from './pages/MyPosts';
import Bookmarks from './pages/Bookmarks';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import UserProfile from './pages/UserProfile';
import Trending from './pages/Trending';
import './App.css';

// PrivateRoute: while auth is loading, show inline spinner instead of redirecting.
// This prevents flashing to /login before the token check finishes.
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center mt-5 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// FIX: Router is now at the TOP level and never unmounts.
// Previously Router lived inside AppContent which returned early (nothing)
// when loading=true — this caused the entire Router to unmount/remount on
// every auth state change, producing a full white-screen flash each time.
// Now the Router always stays mounted; only the page content area shows a
// spinner during the brief auth initialization window.
function AppContent() {
  const { loading } = useAuth();

  return (
    <div className="App">
      {/* Navigation always renders — it reads auth state itself */}
      <Navigation />

      {/* 
        If auth is still initializing (checking token validity on app load),
        show a small top-level spinner. This lasts < 1 second typically.
        Crucially the Router and Navigation stay mounted — no white flash.
      */}
      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 70px)',
          background: 'transparent',
        }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/posts/:slug" element={<PostDetail />} />
          <Route path="/user/:username" element={<UserProfile />} />
          <Route path="/trending" element={<Trending />} />

          <Route path="/create-post" element={<PrivateRoute><CreatePost /></PrivateRoute>} />
          <Route path="/edit-post/:slug" element={<PrivateRoute><EditPost /></PrivateRoute>} />
          <Route path="/my-posts" element={<PrivateRoute><MyPosts /></PrivateRoute>} />
          <Route path="/bookmarks" element={<PrivateRoute><Bookmarks /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/edit-profile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
        </Routes>
      )}
    </div>
  );
}

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <ToastProvider>
          {/* Router wraps everything — lives outside AppContent so it NEVER unmounts */}
          <Router>
            <AppContent />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;
