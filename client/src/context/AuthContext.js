import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';
import { safeLocalStorage } from '../utils/storage';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = safeLocalStorage.getItem('token');
    const savedUser = safeLocalStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
        // Verify token is still valid
        verifyToken();
      } catch (error) {
        console.error('Error parsing saved user:', error);
        logout();
      }
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyToken = async () => {
    try {
      const response = await authAPI.getMe();
      if (response.data.success) {
        setUser(response.data.data);
        safeLocalStorage.setItem('user', JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      if (response.data.success) {
        const { user, token } = response.data.data;
        safeLocalStorage.setItem('token', token);
        safeLocalStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setIsAuthenticated(true);
        return { success: true, user };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      if (response.data.success) {
        const { user, token } = response.data.data;
        safeLocalStorage.setItem('token', token);
        safeLocalStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setIsAuthenticated(true);
        return { success: true, user };
      }
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    safeLocalStorage.removeItem('token');
    safeLocalStorage.removeItem('user');
    // Clear quiz completion on logout to prevent cross-user issues
    safeLocalStorage.removeItem('quiz_completed');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    safeLocalStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions[permission] === true;
  };

  const isRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  // Check if quiz is passed (permanent - no expiration, user-specific)
  // Checks backend first, then falls back to localStorage
  const checkQuizStatus = () => {
    try {
      // Must have a user to check quiz status
      if (!user) {
        return { passed: false, needsQuiz: true };
      }

      const currentUserId = user._id || user.id;
      if (!currentUserId) {
        return { passed: false, needsQuiz: true };
      }

      // FIRST: Check backend (user object from server) - this persists across repushes
      if (user.quizCompleted && user.quizCompleted.passed && user.quizCompleted.permanent && user.quizCompleted.score >= 80) {
        // Also sync to localStorage as backup
        const quizData = {
          userId: currentUserId,
          role: user.role,
          score: user.quizCompleted.score,
          passed: true,
          completedAt: user.quizCompleted.completedAt || new Date().toISOString(),
          permanent: true
        };
        safeLocalStorage.setItem('quiz_completed', JSON.stringify(quizData));
        return { passed: true, needsQuiz: false };
      }

      // SECOND: Check localStorage as fallback (for backwards compatibility)
      const quizData = safeLocalStorage.getItem('quiz_completed');
      if (quizData) {
        const quiz = JSON.parse(quizData);
        
        // CRITICAL: Verify this quiz completion belongs to the current user
        const quizUserId = quiz.userId;
        if (quizUserId && quizUserId.toString() === currentUserId.toString()) {
          // Check if quiz was passed with required score (80%) and not skipped
          if (quiz.passed && quiz.permanent && quiz.score >= 80 && !quiz.skipped) {
            return { passed: true, needsQuiz: false };
          }
        }
      }

      // No valid quiz completion found
      return { passed: false, needsQuiz: true };
    } catch (error) {
      console.error('Error checking quiz status:', error);
      return { passed: false, needsQuiz: true };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    hasPermission,
    isRole,
    checkQuizStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

