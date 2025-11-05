import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { resetTour } from '../utils/tourConfig';
import { PlayIcon } from '@heroicons/react/24/outline';

const Settings = () => {
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleRestartTour = () => {
    if (user) {
      resetTour(user.role);
      toast.success('Tour reset! Refresh the page or go to Dashboard to see the tour again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      {/* Tour Settings */}
      <div className="card">
        <h3 className="font-semibold text-lg mb-4">Guided Tour</h3>
        <p className="text-gray-600 mb-4">
          Restart the interactive tour to learn about all features of the inventory system.
        </p>
        <button
          onClick={handleRestartTour}
          className="btn-primary flex items-center gap-2"
        >
          <PlayIcon className="w-5 h-5" />
          Restart Guided Tour
        </button>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg mb-4">Change Password</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              required
              className="input-field"
              value={passwordData.currentPassword}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              name="newPassword"
              required
              className="input-field"
              value={passwordData.newPassword}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              className="input-field"
              value={passwordData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;

