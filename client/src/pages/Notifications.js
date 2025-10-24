import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading notifications..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <button onClick={handleMarkAllAsRead} className="btn-secondary">
          Mark All as Read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification._id || notification.id}
            className={`card cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
            onClick={() => !notification.isRead && handleMarkAsRead(notification._id || notification.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </div>
                <p className="text-gray-700">{notification.message}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <span className={`badge ${
                notification.priority === 'urgent' ? 'badge-danger' :
                notification.priority === 'high' ? 'badge-warning' :
                'badge-info'
              }`}>
                {notification.priority}
              </span>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No notifications</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;

