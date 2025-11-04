import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { PlusIcon, MagnifyingGlassIcon, QrCodeIcon } from '@heroicons/react/24/outline';

const Items = () => {
  const { hasPermission } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchItems();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, status]);

  const fetchItems = async () => {
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
  };

  const fetchCategories = async () => {
    try {
      const response = await itemsAPI.getCategories();
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

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

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

