import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  CubeIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  const { summary, recentActivity, topItems, categoryDistribution } = dashboardData || {};

  const StatCard = ({ title, value, icon: Icon, color, link }) => (
    <Link
      to={link}
      className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </Link>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <Link to="/qr-scanner" className="btn-primary">
          <QrCodeIcon className="w-5 h-5 inline mr-2" />
          Scan QR Code
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Items"
          value={summary?.totalItems || 0}
          icon={CubeIcon}
          color="bg-blue-500"
          link="/items"
        />
        <StatCard
          title="Active Checkouts"
          value={summary?.activeCheckouts || 0}
          icon={ArrowTrendingUpIcon}
          color="bg-green-500"
          link="/transactions?status=active"
        />
        <StatCard
          title="Overdue Items"
          value={summary?.overdueCheckouts || 0}
          icon={ExclamationTriangleIcon}
          color="bg-red-500"
          link="/transactions?status=overdue"
        />
        <StatCard
          title="Pending Approvals"
          value={summary?.pendingApprovals || 0}
          icon={ClockIcon}
          color="bg-yellow-500"
          link="/transactions?status=pending"
        />
      </div>

      {/* Alerts */}
      {summary?.overdueCheckouts > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-3" />
            <div>
              <h3 className="text-red-800 font-semibold">Overdue Items Alert</h3>
              <p className="text-red-700 text-sm mt-1">
                You have {summary.overdueCheckouts} overdue item(s) that require attention.
              </p>
            </div>
            <Link
              to="/transactions?status=overdue"
              className="ml-auto btn-danger"
            >
              View Overdue
            </Link>
          </div>
        </div>
      )}

      {summary?.pendingApprovals > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-center">
            <ClockIcon className="w-6 h-6 text-yellow-500 mr-3" />
            <div>
              <h3 className="text-yellow-800 font-semibold">Pending Approvals</h3>
              <p className="text-yellow-700 text-sm mt-1">
                {summary.pendingApprovals} checkout request(s) waiting for approval.
              </p>
            </div>
            <Link
              to="/transactions?status=pending"
              className="ml-auto px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Review Requests
            </Link>
          </div>
        </div>
      )}

      {/* Recent Activity & Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((transaction) => (
                <div
                  key={transaction._id || transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {transaction.item?.name || 'Unknown Item'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {transaction.user?.name || 'Unknown User'} •{' '}
                      {transaction.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`badge ${
                        transaction.status === 'active'
                          ? 'badge-success'
                          : transaction.status === 'overdue'
                          ? 'badge-danger'
                          : transaction.status === 'pending'
                          ? 'badge-warning'
                          : 'badge-gray'
                      }`}
                    >
                      {transaction.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
          <Link
            to="/transactions"
            className="block text-center text-blue-600 hover:text-blue-700 font-medium mt-4"
          >
            View All Transactions →
          </Link>
        </div>

        {/* Top Items */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Most Checked Out Items</h2>
          <div className="space-y-3">
            {topItems && topItems.length > 0 ? (
              topItems.map((item, index) => (
                <div
                  key={item._id || item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center flex-1">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{item.checkoutCount}</p>
                    <p className="text-xs text-gray-500">checkouts</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
          <Link
            to="/items"
            className="block text-center text-blue-600 hover:text-blue-700 font-medium mt-4"
          >
            View All Items →
          </Link>
        </div>
      </div>

      {/* Category Distribution */}
      {categoryDistribution && categoryDistribution.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Items by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryDistribution.map((category) => (
              <div
                key={category.name}
                className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg text-center"
              >
                <p className="text-3xl font-bold text-blue-600">{category.value}</p>
                <p className="text-sm text-gray-700 mt-1">{category.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

