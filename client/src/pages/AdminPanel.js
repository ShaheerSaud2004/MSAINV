import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionsAPI, authAPI, guestRequestsAPI, storageVisitsAPI } from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loginActivity, setLoginActivity] = useState([]);
  const [guestRequests, setGuestRequests] = useState([]);
  const [storageVisits, setStorageVisits] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState({});
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    activeCheckouts: 0,
    totalUsers: 0,
    overdueItems: 0,
    storageVisits: 0
  });

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'manager')) {
      fetchAdminData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch transactions
      const transactionsResponse = await transactionsAPI.getAll();
      if (transactionsResponse.data.success) {
        const transactions = transactionsResponse.data.data;
        
        // Filter pending approvals
        const pending = transactions.filter(t => t.status === 'pending');
        setPendingApprovals(pending);
        
        // Get active checkouts
        const active = transactions.filter(t => t.status === 'active');
        
        // Get overdue items
        const now = new Date();
        const overdue = active.filter(t => new Date(t.expectedReturnDate) < now);
        
        // Recent activity (last 20 transactions)
        const recent = [...transactions]
          .sort((a, b) => new Date(b.createdAt || b.checkoutDate) - new Date(a.createdAt || a.checkoutDate))
          .slice(0, 20);
        setRecentActivity(recent);
        
        setStats({
          pendingApprovals: pending.length,
          activeCheckouts: active.length,
          totalUsers: new Set(transactions.map(t => t.user)).size,
          overdueItems: overdue.length
        });
      }

      // Fetch login activity
      const loginResponse = await authAPI.getLoginActivity({ limit: 50 });
      if (loginResponse.data.success) {
        setLoginActivity(loginResponse.data.data);
      }

      // Fetch guest requests
      try {
        const gr = await guestRequestsAPI.list();
        if (gr.data.success) setGuestRequests(gr.data.data);
      } catch (e) {
        // ignore if endpoint unavailable
      }

      // Fetch storage visits/photos
      try {
        const visitsResponse = await storageVisitsAPI.list();
        if (visitsResponse.data.success) {
          setStorageVisits(visitsResponse.data.data || []);
          setStats(prev => ({
            ...prev,
            storageVisits: visitsResponse.data.count ?? (visitsResponse.data.data || []).length
          }));
        }
      } catch (error) {
        console.error('Error fetching storage visits:', error);
        // Non-blocking; just show toast once
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clean up selection when pending list changes
    setSelectedTransactions(prev => {
      const next = {};
      pendingApprovals.forEach(t => {
        const id = t._id || t.id;
        if (prev[id]) {
          next[id] = true;
        }
      });
      return next;
    });
  }, [pendingApprovals]);

  const toggleTransactionSelection = (transactionId) => {
    setSelectedTransactions(prev => {
      const next = { ...prev };
      if (next[transactionId]) {
        delete next[transactionId];
      } else {
        next[transactionId] = true;
      }
      return next;
    });
  };

  const clearSelectedTransactions = () => setSelectedTransactions({});

  const selectAllTransactions = () => {
    const next = {};
    pendingApprovals.forEach(t => {
      const id = t._id || t.id;
      next[id] = true;
    });
    setSelectedTransactions(next);
  };

  const selectedPendingIds = pendingApprovals
    .map(t => t._id || t.id)
    .filter(id => selectedTransactions[id]);

  const handleBulkApprove = async () => {
    if (!selectedPendingIds.length) {
      toast.error('Select at least one request to approve.');
      return;
    }
    try {
      const response = await transactionsAPI.bulkApprove({ ids: selectedPendingIds });
      if (response.data.success) {
        toast.success(`Approved ${selectedPendingIds.length} request(s)`);
      } else {
        toast.warn(response.data.message || 'Some approvals failed');
      }
      clearSelectedTransactions();
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve selected requests');
    }
  };

  const handleApprove = async (transactionId) => {
    try {
      const response = await transactionsAPI.approve(transactionId, {
        approved: true,
        approvalNotes: 'Approved by admin'
      });
      
      if (response.data.success) {
        toast.success('Transaction approved successfully!');
        fetchAdminData(); // Refresh data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve transaction');
    }
  };

  const handleReject = async (transactionId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      const response = await transactionsAPI.approve(transactionId, {
        approved: false,
        approvalNotes: reason
      });
      
      if (response.data.success) {
        toast.success('Transaction rejected');
        fetchAdminData(); // Refresh data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject transaction');
    }
  };

  const handleApproveGuest = async (id) => {
    try {
      await guestRequestsAPI.approve(id);
      toast.success('Guest request approved');
      fetchAdminData();
    } catch (e) {
      toast.error('Failed to approve guest request');
    }
  };

  const handleRejectGuest = async (id) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    try {
      await guestRequestsAPI.reject(id, { reason });
      toast.success('Guest request rejected');
      fetchAdminData();
    } catch (e) {
      toast.error('Failed to reject guest request');
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return (
      <div className="card text-center py-12">
        <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You need admin or manager privileges to access this panel.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading admin panel..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-1">Manage approvals, view activity, and monitor the system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pending Approvals</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.pendingApprovals}</p>
            </div>
            <ClockIcon className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Active Checkouts</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.activeCheckouts}</p>
            </div>
            <ShoppingCartIcon className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Active Users</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.totalUsers}</p>
            </div>
            <UserGroupIcon className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Overdue Items</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{stats.overdueItems}</p>
            </div>
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
          </div>
        </div>
        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Storage Photos</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{stats.storageVisits}</p>
            </div>
            <PhotoIcon className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-0">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClockIcon className="w-5 h-5 inline mr-2" />
              Pending Approvals ({stats.pendingApprovals})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ShoppingCartIcon className="w-5 h-5 inline mr-2" />
              Recent Activity
            </button>
            <button
              onClick={() => setActiveTab('logins')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'logins'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserGroupIcon className="w-5 h-5 inline mr-2" />
              Login Activity
            </button>
            <button
              onClick={() => setActiveTab('guest')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'guest'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CubeIcon className="w-5 h-5 inline mr-2" />
              Guest Requests
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'photos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <PhotoIcon className="w-5 h-5 inline mr-2" />
              Storage Photos
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Pending Approvals Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingApprovals.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-blue-900 font-semibold">
                    {selectedPendingIds.length} of {pendingApprovals.length} selected
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="btn-secondary text-sm" onClick={selectAllTransactions}>
                      Select All
                    </button>
                    <button className="btn-secondary text-sm" onClick={clearSelectedTransactions}>
                      Clear
                    </button>
                    <button className="btn-primary text-sm" onClick={handleBulkApprove}>
                      Approve Selected
                    </button>
                  </div>
                </div>
              )}
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                  <p className="text-gray-600">No pending approvals at the moment.</p>
                </div>
              ) : (
                pendingApprovals.map((transaction) => (
                  <div key={transaction._id || transaction.id} className={`border rounded-lg p-4 bg-yellow-50 relative ${selectedTransactions[transaction._id || transaction.id] ? 'ring-2 ring-blue-400' : ''}`}>
                    <div className="absolute top-3 right-3">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="h-5 w-5 text-blue-600 rounded border-gray-300"
                          checked={!!selectedTransactions[transaction._id || transaction.id]}
                          onChange={() => toggleTransactionSelection(transaction._id || transaction.id)}
                        />
                      </label>
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="badge badge-warning">Pending Approval</span>
                          <span className="badge badge-info">{transaction.type}</span>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {transaction.item?.name || 'Unknown Item'}
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">User:</span>{' '}
                            {transaction.user?.name || transaction.user?.email || 'Unknown User'}
                          </div>
                          <div>
                            <span className="font-medium">Quantity:</span> {transaction.quantity}
                          </div>
                          <div>
                            <span className="font-medium">Purpose:</span> {transaction.purpose || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Expected Return:</span>{' '}
                            {transaction.expectedReturnDate
                              ? format(new Date(transaction.expectedReturnDate), 'MMM dd, yyyy')
                              : 'N/A'}
                          </div>
                        </div>

                        {transaction.notes && (
                          <div className="text-sm text-gray-600 bg-white rounded p-3 mb-3">
                            <span className="font-medium">Notes:</span> {transaction.notes}
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          Requested: {transaction.checkoutDate
                            ? format(new Date(transaction.checkoutDate), 'MMM dd, yyyy h:mm a')
                            : 'Unknown'}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => handleApprove(transaction._id || transaction.id)}
                          className="btn-success flex items-center gap-2 whitespace-nowrap"
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(transaction._id || transaction.id)}
                          className="btn-danger flex items-center gap-2 whitespace-nowrap"
                        >
                          <XCircleIcon className="w-5 h-5" />
                          Reject
                        </button>
                        <button
                          onClick={() => navigate(`/transactions/${transaction._id || transaction.id}`)}
                          className="btn-secondary whitespace-nowrap"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Recent Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <CubeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activity Yet</h3>
                  <p className="text-gray-600">Transaction activity will appear here.</p>
                </div>
              ) : (
                recentActivity.map((transaction) => (
                  <div
                    key={transaction._id || transaction.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/transactions/${transaction._id || transaction.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`badge ${
                            transaction.status === 'active' ? 'badge-success' :
                            transaction.status === 'pending' ? 'badge-warning' :
                            transaction.status === 'returned' ? 'badge-info' :
                            'badge-secondary'
                          }`}>
                            {transaction.status}
                          </span>
                          <span className="badge badge-secondary">{transaction.type}</span>
                        </div>
                        
                        <div className="font-medium text-gray-900">
                          {transaction.item?.name || 'Unknown Item'} - {transaction.quantity} unit(s)
                        </div>
                        
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">User:</span>{' '}
                          {transaction.user?.name || transaction.user?.email || 'Unknown'}
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-1">
                          {transaction.checkoutDate
                            ? format(new Date(transaction.checkoutDate), 'MMM dd, yyyy h:mm a')
                            : 'Unknown date'}
                        </div>
                      </div>

                      {transaction.isOverdue && (
                        <div className="ml-4">
                          <span className="badge badge-danger">OVERDUE</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Login Activity Tab */}
          {activeTab === 'logins' && (
            <div className="space-y-3">
              {loginActivity.length === 0 ? (
                <div className="text-center py-12">
                  <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Login Activity</h3>
                  <p className="text-gray-600">Login activity will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Device
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loginActivity.map((activity, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-gray-900">
                                {activity.userName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {activity.userEmail}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`badge ${
                              activity.userRole === 'admin' ? 'badge-primary' :
                              activity.userRole === 'manager' ? 'badge-success' :
                              'badge-secondary'
                            }`}>
                              {activity.userRole}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {activity.timestamp
                              ? format(new Date(activity.timestamp), 'MMM dd, yyyy h:mm a')
                              : 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {activity.ipAddress || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {activity.userAgent?.substring(0, 50) || 'Unknown'}...
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Guest Requests Tab */}
          {activeTab === 'guest' && (
            <div className="space-y-3">
              {guestRequests.length === 0 ? (
                <div className="text-center py-12">
                  <CubeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Guest Requests</h3>
                  <p className="text-gray-600">Guest requests will appear here.</p>
                </div>
              ) : (
                guestRequests.map((r) => (
                  <div key={r._id || r.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`badge ${r.status === 'pending' ? 'badge-warning' : r.status === 'approved' ? 'badge-success' : 'badge-danger'}`}>{r.status}</span>
                          <span className="badge badge-secondary">{r.team}</span>
                        </div>
                        <div className="font-medium text-gray-900">{r.itemName || 'Requested Item'}</div>
                        <div className="text-sm text-gray-600 mt-1">From: {r.requester?.name} ({r.requester?.email})</div>
                        <div className="text-sm text-gray-600 mt-1">Purpose: {r.purpose}</div>
                        {r.notes && <div className="text-sm text-gray-500 mt-1">Notes: {r.notes}</div>}
                        {(r.photos?.itemPhoto || r.photos?.departurePhoto) && (
                          <div className="mt-3 grid grid-cols-2 gap-3">
                            {r.photos?.itemPhoto && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Item photo</div>
                                <img src={r.photos.itemPhoto} alt="Item" className="h-28 w-auto rounded border" />
                              </div>
                            )}
                            {r.photos?.departurePhoto && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Departure photo</div>
                                <img src={r.photos.departurePhoto} alt="Departure" className="h-28 w-auto rounded border" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {r.status === 'pending' && (
                        <div className="flex flex-col gap-2 ml-4">
                          <button onClick={() => handleApproveGuest(r._id || r.id)} className="btn-success">Approve</button>
                          <button onClick={() => handleRejectGuest(r._id || r.id)} className="btn-danger">Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Storage Photos Tab */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              {storageVisits.length === 0 ? (
                <div className="text-center py-12">
                  <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Storage Photos Yet</h3>
                  <p className="text-gray-600">
                    When teams upload storage visit photos, they will appear here for quick review.
                  </p>
                </div>
              ) : (
                storageVisits.map((visit, index) => {
                  const transaction = visit.transaction || {};
                  const item = transaction.item || {};
                  const visitUser = visit.user || visit.userId || transaction.user || {};
                  const photos = visit.photos || [];

                  const resolvePhotoUrl = (url) => {
                    if (!url) return '';
                    if (url.startsWith('http://') || url.startsWith('https://')) return url;
                    if (url.startsWith('/')) return url;
                    return `/${url}`;
                  };

                  return (
                    <div key={index} className="border rounded-xl p-5 bg-white shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="badge badge-secondary uppercase">{visit.visitType || 'visit'}</span>
                            {visit.verifiedBy && <span className="badge badge-success">Verified</span>}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.name || 'Unknown Item'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Transaction: <span className="font-mono">{transaction.transactionNumber || transaction.id || 'N/A'}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            User: {visitUser.name || visitUser.email || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Visit Date: {visit.visitDate ? format(new Date(visit.visitDate), 'MMM dd, yyyy h:mm a') : 'N/A'}
                          </p>
                          {visit.notes && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Notes:</span> {visit.notes}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => navigate(`/transactions/${transaction.id || transaction._id}`)}
                          className="btn-secondary"
                        >
                          View Transaction
                        </button>
                      </div>

                      {photos.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {photos.map((photo, idx) => (
                            <div key={idx} className="group relative">
                              <img
                                src={resolvePhotoUrl(photo.url)}
                                alt={photo.caption || `Storage visit photo ${idx + 1}`}
                                className="h-32 w-full object-cover rounded-lg border border-gray-200 group-hover:border-blue-400 transition-colors cursor-pointer"
                                onClick={() => window.open(resolvePhotoUrl(photo.url), '_blank')}
                              />
                              {photo.caption && (
                                <p className="text-xs text-gray-600 mt-2 truncate">{photo.caption}</p>
                              )}
                              {photo.uploadDate && (
                                <p className="text-2xs text-gray-400">
                                  {format(new Date(photo.uploadDate), 'MMM dd, yyyy h:mm a')}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

