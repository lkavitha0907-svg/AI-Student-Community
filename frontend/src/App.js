import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import RulesPage from './pages/RulesPage';
import { QuizListPage, QuizPlayerPage } from './pages/QuizPage';
import NotesPage from './pages/NotesPage';
import ChatPage from './pages/ChatPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-screen" style={{ minHeight: '100vh' }}>
      <div className="spinner" />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
        Entering Arena...
      </span>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
      } />
      <Route path="/quiz" element={
        <ProtectedRoute><AppLayout><QuizListPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/quiz/:id" element={
        <ProtectedRoute><AppLayout><QuizPlayerPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/notes" element={
        <ProtectedRoute><AppLayout><NotesPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute><AppLayout><ChatPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute><AppLayout><LeaderboardPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/rules" element={
        <ProtectedRoute><AppLayout><RulesPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
