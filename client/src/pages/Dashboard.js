import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  CubeIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  QrCodeIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData(true); // true = silent refresh (no loading spinner)
    }, 30000);
    
    // Refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const response = await analyticsAPI.getDashboard();
      if (response.data.success) {
        setDashboardData(response.data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      if (!silent) {
        toast.error('Failed to load dashboard data');
      }
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleManualRefresh = () => {
    toast.info('Refreshing dashboard...');
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  const { summary, recentActivity, topItems, categoryDistribution } = dashboardData || {};

  const StatCard = ({ title, value, icon: Icon, color, link, gradient }) => (
    <Link
      to={link}
      className="group relative overflow-hidden stat-card animate-fade-in"
    >
      {/* Gradient background overlay */}
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-extrabold text-gray-900 mt-3 mb-2">{value}</p>
          <div className="flex items-center text-xs text-gray-500">
            <span className="font-medium">View details →</span>
          </div>
        </div>
        <div className={`p-4 rounded-2xl ${color} shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          <Icon className="w-10 h-10 text-white" />
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
    </Link>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 animate-fade-in">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            {user?.team && (
              <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-lg animate-scale-in">
                {user.team}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <p className="text-gray-600 text-lg">Welcome back! Here's what's happening with your {user?.team || 'team'}'s inventory.</p>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Last updated: {format(lastUpdated, 'h:mm a')}
            </span>
            {refreshing && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full animate-pulse font-medium">
                Refreshing...
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleManualRefresh}
            className="btn-secondary flex items-center gap-2 shadow-md hover:shadow-lg"
            disabled={refreshing}
          >
            <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link to="/qr-scanner" className="btn-primary shadow-md hover:shadow-lg">
            <QrCodeIcon className="w-5 h-5 inline mr-2" />
            <span className="hidden sm:inline">Scan QR</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Items"
          value={summary?.totalItems || 0}
          icon={CubeIcon}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          link="/items"
        />
        <StatCard
          title="Active Transactions"
          value={summary?.activeCheckouts || 0}
          icon={ArrowTrendingUpIcon}
          color="bg-gradient-to-br from-green-500 to-emerald-600"
          gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          link="/transactions?status=active"
        />
        <StatCard
          title="Total Users"
          value={summary?.totalUsers || 0}
          icon={CubeIcon}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          link="/users"
        />
        <StatCard
          title="Overdue Items"
          value={summary?.overdueCheckouts || 0}
          icon={ExclamationTriangleIcon}
          color="bg-gradient-to-br from-red-500 to-red-600"
          gradient="bg-gradient-to-br from-red-500 to-red-600"
          link="/transactions?status=overdue"
        />
      </div>

      {/* Alerts */}
      {summary?.overdueCheckouts > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-red-50 via-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-xl shadow-lg animate-slide-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 rounded-full -mr-16 -mt-16 opacity-20"></div>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-red-900 font-bold text-lg">Overdue Items Alert</h3>
              <p className="text-red-700 text-sm mt-1">
                You have <span className="font-bold">{summary.overdueCheckouts}</span> overdue item(s) that require immediate attention.
              </p>
            </div>
            <Link
              to="/transactions?status=overdue"
              className="btn-danger whitespace-nowrap shadow-md hover:shadow-lg"
            >
              View Overdue
            </Link>
          </div>
        </div>
      )}

      {summary?.pendingApprovals > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-yellow-50 via-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-6 rounded-xl shadow-lg animate-slide-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200 rounded-full -mr-16 -mt-16 opacity-20"></div>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-yellow-900 font-bold text-lg">Pending Approvals</h3>
              <p className="text-yellow-700 text-sm mt-1">
                <span className="font-bold">{summary.pendingApprovals}</span> checkout request(s) waiting for your approval.
              </p>
            </div>
            <Link
              to="/transactions?status=pending"
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 font-medium shadow-md hover:shadow-lg transition-all whitespace-nowrap"
            >
              Review Requests
            </Link>
          </div>
        </div>
      )}

      {/* Recent Activity & Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
            <Link
              to="/transactions"
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 group"
            >
              View all
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((transaction, index) => (
                <div
                  key={transaction._id || transaction.id}
                  className="activity-item group cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {transaction.item?.name || 'Unknown Item'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">{transaction.user?.name || 'Unknown User'}</span>
                        <span className="mx-1">•</span>
                        <span className="capitalize">{transaction.type}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy • h:mm a')}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
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
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="inline-block p-4 bg-gray-100 rounded-full mb-3">
                  <ArrowsRightLeftIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No recent activity</p>
                <p className="text-gray-400 text-sm mt-1">Transactions will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Items */}
        <div className="card animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Most Checked Out Items</h2>
            <Link
              to="/items"
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 group"
            >
              View all
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="space-y-3">
            {topItems && topItems.length > 0 ? (
              topItems.map((item, index) => (
                <div
                  key={item._id || item.id}
                  className="activity-item group cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white mr-4 shadow-md transform group-hover:scale-110 transition-transform ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                        'bg-gradient-to-br from-blue-500 to-blue-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{item.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {item.category}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {item.checkoutCount}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">checkouts</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="inline-block p-4 bg-gray-100 rounded-full mb-3">
                  <CubeIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No data available</p>
                <p className="text-gray-400 text-sm mt-1">Popular items will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      {categoryDistribution && categoryDistribution.length > 0 && (
        <div className="card animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Items by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryDistribution.map((category, index) => {
              const colors = [
                'from-blue-500 to-blue-600',
                'from-purple-500 to-purple-600',
                'from-pink-500 to-pink-600',
                'from-green-500 to-green-600',
                'from-yellow-500 to-yellow-600',
                'from-red-500 to-red-600',
                'from-indigo-500 to-indigo-600',
                'from-teal-500 to-teal-600',
              ];
              const bgColors = [
                'from-blue-50 to-blue-100',
                'from-purple-50 to-purple-100',
                'from-pink-50 to-pink-100',
                'from-green-50 to-green-100',
                'from-yellow-50 to-yellow-100',
                'from-red-50 to-red-100',
                'from-indigo-50 to-indigo-100',
                'from-teal-50 to-teal-100',
              ];
              const textColor = colors[index % colors.length];
              const bgColor = bgColors[index % bgColors.length];
              
              return (
                <div
                  key={category.name}
                  className={`group relative overflow-hidden p-6 bg-gradient-to-br ${bgColor} rounded-2xl text-center shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:scale-105`}
                >
                  <div className="relative z-10">
                    <p className={`text-4xl font-extrabold bg-gradient-to-r ${textColor} bg-clip-text text-transparent mb-2`}>
                      {category.value}
                    </p>
                    <p className="text-sm text-gray-700 font-semibold">{category.name}</p>
                  </div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full -mr-10 -mt-10 opacity-20"></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="card animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/checkout"
            className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-3 group-hover:scale-110 transition-transform shadow-md">
                <ArrowTrendingUpIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Checkout Items</h3>
              <p className="text-sm text-gray-600">Check out items from inventory</p>
            </div>
          </Link>
          
          <Link
            to="/items/new"
            className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mb-3 group-hover:scale-110 transition-transform shadow-md">
                <CubeIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Add New Item</h3>
              <p className="text-sm text-gray-600">Add a new item to inventory</p>
            </div>
          </Link>
          
          <Link
            to="/transactions"
            className="group p-6 bg-gradient-to-br from-purple-50 to-purple-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-3 group-hover:scale-110 transition-transform shadow-md">
                <ArrowsRightLeftIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">View Transactions</h3>
              <p className="text-sm text-gray-600">Manage all transactions</p>
            </div>
          </Link>
          
          <Link
            to="/analytics"
            className="group p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl mb-3 group-hover:scale-110 transition-transform shadow-md">
                <ChartBarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">View Analytics</h3>
              <p className="text-sm text-gray-600">Detailed reports and insights</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

