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
  const { login } = useAuth();
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
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email, password, team) => {
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success(`Welcome ${team} Team! 🎉`);
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Quick login failed');
      }
    } catch (error) {
      toast.error('An error occurred during quick login');
    } finally {
      setLoading(false);
    }
  };

  const teams = [
    { name: 'IAW', email: 'iaw@msa.com', password: 'iaw123', color: 'blue', icon: '🌟' },
    { name: 'Ladders', email: 'ladders@msa.com', password: 'ladders123', color: 'purple', icon: '🪜' },
    { name: 'R2R', email: 'r2r@msa.com', password: 'r2r123', color: 'green', icon: '🎯' },
    { name: 'Brothers Social', email: 'brothers@msa.com', password: 'brothers123', color: 'amber', icon: '👥' },
    { name: 'Sister Social', email: 'sisters@msa.com', password: 'sisters123', color: 'pink', icon: '👭' },
    { name: 'Hope', email: 'hope@msa.com', password: 'hope123', color: 'teal', icon: '💚' },
    { name: 'Submissions', email: 'submissions@msa.com', password: 'submissions123', color: 'red', icon: '📝' }
  ];

  const getTeamColorClasses = (color) => {
    const colors = {
      blue: 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100',
      purple: 'border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100',
      green: 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100',
      amber: 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100',
      pink: 'border-pink-300 text-pink-700 bg-pink-50 hover:bg-pink-100',
      teal: 'border-teal-300 text-teal-700 bg-teal-50 hover:bg-teal-100',
      red: 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
    };
    return colors[color] || colors.blue;
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

        {/* Team Quick Login Options */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-600 font-semibold">⚡ Quick Team Login</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2">
            {teams.map((team) => (
              <button
                key={team.name}
                onClick={() => quickLogin(team.email, team.password, team.name)}
                disabled={loading}
                className={`w-full flex items-center justify-center px-4 py-3 border rounded-xl shadow-sm text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 hover:shadow-md ${getTeamColorClasses(team.color)}`}
              >
                <span className="text-2xl mr-3">{team.icon}</span>
                <span className="flex-1 text-left">{team.name}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            ))}
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              🎯 Each team has separate storage and inventory
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

