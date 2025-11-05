import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ChartBarIcon,
  UserGroupIcon,
  CubeIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [itemUtilization, setItemUtilization] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [overduePatterns, setOverduePatterns] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const [utilizationRes, activityRes, overdueRes] = await Promise.all([
        analyticsAPI.getItemUtilization().catch(() => ({ data: { success: false } })),
        analyticsAPI.getUserActivity().catch(() => ({ data: { success: false } })),
        analyticsAPI.getOverduePatterns().catch(() => ({ data: { success: false } }))
      ]);

      if (utilizationRes.data.success) {
        setItemUtilization(utilizationRes.data.data.slice(0, 10));
      }

      if (activityRes.data.success) {
        setUserActivity(activityRes.data.data.slice(0, 10));
      }

      if (overdueRes.data.success) {
        setOverduePatterns(overdueRes.data.data);
      }
    } catch (error) {
      console.error('Analytics error:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Comprehensive insights into your inventory system</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'utilization', label: 'Item Utilization', icon: CubeIcon },
            { id: 'users', label: 'User Activity', icon: UserGroupIcon },
            { id: 'overdue', label: 'Overdue Patterns', icon: ExclamationTriangleIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {itemUtilization.length > 0 ? itemUtilization.reduce((sum, item) => sum + (item.item?.totalQuantity || 0), 0) : 0}
                </p>
              </div>
              <CubeIcon className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{userActivity.length}</p>
              </div>
              <UserGroupIcon className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Checkouts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {userActivity.reduce((sum, user) => sum + (user.totalCheckouts || 0), 0)}
                </p>
              </div>
              <ArrowTrendingUpIcon className="w-12 h-12 text-purple-500" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {overduePatterns?.summary?.totalOverdue || 0}
                </p>
              </div>
              <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Item Utilization Tab */}
      {activeTab === 'utilization' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Top Items by Utilization Rate</h2>
            {itemUtilization.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={itemUtilization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="item.name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="utilizationRate" fill="#3b82f6" name="Utilization %" />
                  <Bar dataKey="totalCheckouts" fill="#8b5cf6" name="Total Checkouts" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CubeIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p>No utilization data available</p>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Item Utilization Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilization %</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Checkouts</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currently Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {itemUtilization.slice(0, 10).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{item.item?.name || 'N/A'}</td>
                      <td className="px-4 py-3">{item.item?.category || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className="badge badge-info">{item.utilizationRate}%</span>
                      </td>
                      <td className="px-4 py-3">{item.totalCheckouts}</td>
                      <td className="px-4 py-3">{item.currentlyCheckedOut}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Activity Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Top Users by Activity</h2>
            {userActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="user.name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalCheckouts" fill="#10b981" name="Total Checkouts" />
                  <Bar dataKey="activeCheckouts" fill="#3b82f6" name="Active" />
                  <Bar dataKey="overdueCheckouts" fill="#ef4444" name="Overdue" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <UserGroupIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p>No user activity data available</p>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">User Activity Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overdue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {userActivity.slice(0, 10).map((activity, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{activity.user?.name || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className="badge badge-info capitalize">{activity.user?.role || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">{activity.totalCheckouts}</td>
                      <td className="px-4 py-3">
                        <span className="badge badge-success">{activity.activeCheckouts}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge badge-danger">{activity.overdueCheckouts}</span>
                      </td>
                      <td className="px-4 py-3">{activity.completedCheckouts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Overdue Patterns Tab */}
      {activeTab === 'overdue' && overduePatterns && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Overdue Summary</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total Overdue Items</p>
                  <p className="text-3xl font-bold text-red-600">{overduePatterns.summary?.totalOverdue || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Days Overdue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {overduePatterns.summary?.averageDaysOverdue || '0.00'} days
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-4">Overdue by User</h2>
              {overduePatterns.overdueByUser?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={overduePatterns.overdueByUser.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="user.name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ef4444" name="Overdue Items" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No overdue items by user</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Overdue Items by User</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overdue Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {overduePatterns.overdueByUser?.slice(0, 10).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{item.user?.name || 'Unknown'}</td>
                      <td className="px-4 py-3">{item.user?.email || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className="badge badge-danger">{item.count}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Overdue Items by Item</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overdue Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {overduePatterns.overdueByItem?.slice(0, 10).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{item.item?.name || 'Unknown'}</td>
                      <td className="px-4 py-3">{item.item?.category || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className="badge badge-danger">{item.count}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'overdue' && !overduePatterns && (
        <div className="card">
          <div className="text-center py-12 text-gray-500">
            <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p>No overdue pattern data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
