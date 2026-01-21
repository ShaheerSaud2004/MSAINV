import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { itemsAPI, transactionsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { PlusIcon, MagnifyingGlassIcon, QrCodeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const Items = () => {
  const { hasPermission } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [categories, setCategories] = useState([]);
  const [recentCheckouts, setRecentCheckouts] = useState([]);

  const fetchItems = useCallback(async () => {
    try {
      const params = {
        limit: 1000, // Request all items (up to 1000)
        page: 1
      };
      if (search) params.search = search;
      if (category) params.category = category;
      if (status) params.status = status;

      const response = await itemsAPI.getAll(params);
      if (response.data.success) {
        setItems(response.data.data);
        console.log(`Loaded ${response.data.data.length} items`);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [search, category, status]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await itemsAPI.getCategories();
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchRecentCheckouts = useCallback(async () => {
    try {
      const response = await transactionsAPI.getAll({ status: 'active', limit: 10 });
      if (response.data.success) {
        // Sort by checkout date, most recent first and add category from item
        const sorted = response.data.data
          .map(t => ({
            ...t,
            category: t.item?.category || t.category
          }))
          .sort((a, b) => new Date(b.checkoutDate || b.createdAt) - new Date(a.checkoutDate || a.createdAt))
          .slice(0, 5);
        setRecentCheckouts(sorted);
      }
    } catch (error) {
      console.error('Error fetching recent checkouts:', error);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchRecentCheckouts();
  }, [fetchItems, fetchCategories, fetchRecentCheckouts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading items..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Items</h1>
          <p className="text-gray-600 mt-1">Manage your inventory items</p>
        </div>
        {hasPermission('canManageItems') && (
          <Link to="/items/add" className="btn-primary">
            <PlusIcon className="w-5 h-5 inline mr-2" />
            Add Item
          </Link>
        )}
      </div>

      {/* Recently Checked Out Items */}
      {recentCheckouts.length > 0 && (
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Recently Checked Out</h2>
            </div>
            <Link to="/transactions?status=active" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentCheckouts.map((checkout) => (
              <Link
                key={checkout._id || checkout.id}
                to={`/items/${checkout.item?._id || checkout.item?.id || checkout.item}`}
                className="bg-white p-3 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 truncate">{checkout.item?.name || 'Unknown Item'}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {checkout.user?.name || 'Unknown User'} • {format(new Date(checkout.checkoutDate || checkout.createdAt), 'MMM dd, h:mm a')}
                    </p>
                    {checkout.category && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {checkout.category}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                className="input-field pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="input-field"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
        
        {/* Category Quick Filters */}
        {categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filter by Category</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  category === '' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    category === cat 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item._id || item.id}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
              </div>
              <QrCodeIcon className="w-6 h-6 text-gray-400 ml-2" />
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge badge-info">{item.category}</span>
              <span
                className={`badge ${
                  item.status === 'active' ? 'badge-success' : 'badge-gray'
                }`}
              >
                {item.status}
              </span>
              {item.isCheckoutable && item.availableQuantity > 0 && (
                <span className="badge badge-primary">Checkoutable</span>
              )}
            </div>
            <div className="flex justify-between items-center pt-3 border-t mb-4">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="font-bold text-gray-900">
                  {item.availableQuantity} / {item.totalQuantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">SKU</p>
                <p className="font-mono text-sm text-gray-900">{item.sku || 'N/A'}</p>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link
                to={`/items/${item._id || item.id}`}
                className="btn-secondary flex-1 text-center"
              >
                View Details
              </Link>
              {item.isCheckoutable && item.availableQuantity > 0 && (
                <Link
                  to={`/checkout/${item._id || item.id}`}
                  className="btn-primary flex-1 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  Quick Checkout
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <p>No items found</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="text-center py-4 text-gray-600">
          <p className="text-sm">Showing {items.length} items</p>
        </div>
      )}
    </div>
  );
};

export default Items;

