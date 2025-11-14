import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { CubeIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, checkQuizStatus } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success('Login successful!');
        const quizStatus = checkQuizStatus(result.user);
        if (quizStatus.needsQuiz) {
          navigate('/quiz-confirmation');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email, password, role) => {
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success(`Quick login as ${role} successful!`);
        const quizStatus = checkQuizStatus(result.user);
        if (quizStatus.needsQuiz) {
          navigate('/quiz-confirmation');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(result.message || 'Quick login failed');
      }
    } catch (error) {
      toast.error('An error occurred during quick login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div>
          <div className="flex justify-center">
            <CubeIcon className="w-16 h-16 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            MSA Inventory
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-field"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Register here
              </Link>
            </p>
          </div>
        </form>

        {/* Quick Login Options */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">⚡ Quick Login (Demo)</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <button
              onClick={() => quickLogin('admin@msa.com', 'admin123', 'Admin')}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 rounded-lg shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Login as Admin (Full Access)
            </button>
          </div>

          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              💡 Quick login for testing. Use the buttons above to instantly sign in with demo accounts.
            </p>
          </div>
        </div>

        {/* Quick Team Login */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">🏷️ Quick Team Login</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => quickLogin('iaw@msa.com', 'iaw123', 'IAW Team')}
              disabled={loading}
              className="w-full px-4 py-2 border border-indigo-300 rounded-lg shadow-sm text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🌟 IAW Team
            </button>
            <button
              onClick={() => quickLogin('hope@msa.com', 'hope123', 'Hope Team')}
              disabled={loading}
              className="w-full px-4 py-2 border border-emerald-300 rounded-lg shadow-sm text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              💚 Hope Team
            </button>
            <button
              onClick={() => quickLogin('submissions@msa.com', 'submissions123', 'Submissions Team')}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              📝 Submissions Team
            </button>
            <button
              onClick={() => quickLogin('ept@msa.com', 'ept123', 'EPT Team')}
              disabled={loading}
              className="w-full px-4 py-2 border border-purple-300 rounded-lg shadow-sm text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ⚙️ EPT Team
            </button>
            <button
              onClick={() => quickLogin('ladders@msa.com', 'ladders123', 'Ladders Team')}
              disabled={loading}
              className="w-full px-4 py-2 border border-yellow-300 rounded-lg shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🪜 Ladders Team
            </button>
            <button
              onClick={() => quickLogin('r2r@msa.com', 'r2r123', 'R2R Team')}
              disabled={loading}
              className="w-full px-4 py-2 border border-pink-300 rounded-lg shadow-sm text-sm font-medium text-pink-700 bg-pink-50 hover:bg-pink-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🎯 R2R Team
            </button>
            <button
              onClick={() => quickLogin('brothers@msa.com', 'brothers123', 'Brothers Social')}
              disabled={loading}
              className="w-full px-4 py-2 border border-blue-300 rounded-lg shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              👥 Brothers Social
            </button>
            <button
              onClick={() => quickLogin('sisters@msa.com', 'sisters123', 'Sisters Social')}
              disabled={loading}
              className="w-full px-4 py-2 border border-rose-300 rounded-lg shadow-sm text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              👭 Sisters Social
            </button>
          </div>

          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              Each team logs into its own workspace. Data is isolated per team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

