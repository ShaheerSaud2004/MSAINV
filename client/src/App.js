import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Main Pages
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import ItemDetail from './pages/ItemDetail';
import AddEditItem from './pages/AddEditItem';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import Users from './pages/Users';
import Notifications from './pages/Notifications';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import QRScanner from './pages/QRScanner';
import CheckoutForm from './pages/CheckoutForm';
import MultiCheckout from './pages/MultiCheckout';
import PrintQRCodes from './pages/PrintQRCodes';
import AdminPanel from './pages/AdminPanel';
import GuestRequest from './pages/GuestRequest';
import Tutorial from './pages/Tutorial';
import Quiz from './pages/Quiz';
import QuizConfirmation from './pages/QuizConfirmation';

// Layout
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, checkQuizStatus, quizPromptAnswered } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check quiz status - skip for tutorial and quiz pages
  const currentPath = window.location.pathname;
  if (currentPath !== '/tutorial' && currentPath !== '/quiz' && currentPath !== '/quiz-confirmation') {
    const quizStatus = checkQuizStatus();
    if (quizStatus.needsQuiz && !quizPromptAnswered) {
      return <Navigate to="/quiz-confirmation" replace />;
    }
  }

  // Don't show layout for tutorial, quiz, or quiz confirmation pages
  if (currentPath === '/tutorial' || currentPath === '/quiz' || currentPath === '/quiz-confirmation') {
    return <>{children}</>;
  }

  return <Layout>{children}</Layout>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
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
        <Route path="/guest" element={<GuestRequest />} />

        {/* Tutorial & Quiz Routes (no layout) */}
        <Route
          path="/tutorial"
          element={
            <ProtectedRoute>
              <Tutorial />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz-confirmation"
          element={
            <ProtectedRoute>
              <QuizConfirmation />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items"
          element={
            <ProtectedRoute>
              <Items />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items/add"
          element={
            <ProtectedRoute>
              <AddEditItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items/edit/:id"
          element={
            <ProtectedRoute>
              <AddEditItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items/:id"
          element={
            <ProtectedRoute>
              <ItemDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/:id"
          element={
            <ProtectedRoute>
              <CheckoutForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/multi"
          element={
            <ProtectedRoute>
              <MultiCheckout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions/:id"
          element={
            <ProtectedRoute>
              <TransactionDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/qr-scanner"
          element={
            <ProtectedRoute>
              <QRScanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/print-qr-codes"
          element={
            <ProtectedRoute>
              <PrintQRCodes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

