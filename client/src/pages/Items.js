import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { itemsAPI, transactionsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { PlusIcon, MagnifyingGlassIcon, QrCodeIcon, ClockIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const normalizeString = (value) =>
  (value || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value) => normalizeString(value).split(' ').filter((token) => token.length >= 2);

const calculateSimilarity = (queryText, targetText) => {
  const queryTokens = tokenize(queryText);
  const targetTokens = tokenize(targetText);

  if (!queryTokens.length || !targetTokens.length) return 0;

  const targetSet = new Set(targetTokens);
  let hits = 0;

  queryTokens.forEach((token) => {
    if (targetSet.has(token)) {
      hits += 1.5;
    } else if (targetTokens.some((targetToken) => targetToken.includes(token) || token.includes(targetToken))) {
      hits += 1;
    }
  });

  const coverageScore = Math.min(1, hits / queryTokens.length);
  const contiguousBonus = normalizeString(targetText).includes(normalizeString(queryText)) ? 0.25 : 0;

  return Math.min(1, coverageScore + contiguousBonus);
};

const Items = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('active');
  const [categories, setCategories] = useState([]);
  const [recentCheckouts, setRecentCheckouts] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [bulkSearchInput, setBulkSearchInput] = useState('');
  const [bulkSearchResults, setBulkSearchResults] = useState([]);
  const [isSearchingBulk, setIsSearchingBulk] = useState(false);
  useEffect(() => {
    if (!items.length) {
      if (Object.keys(selectedItems).length) {
        setSelectedItems({});
      }
      return;
    }

    setSelectedItems(prev => {
      const next = {};
      items.forEach(item => {
        const id = item._id || item.id;
        if (prev[id]) {
          next[id] = true;
        }
      });
      return next;
    });
  }, [items]);

  const selectedIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
  const selectedCount = selectedIds.length;

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      const next = { ...prev };
      if (next[itemId]) {
        delete next[itemId];
      } else {
        next[itemId] = true;
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedItems({});

  const startBulkCheckout = () => {
    if (selectedCount === 0) {
      toast.error('Select at least one item to start a bulk checkout.');
      return;
    }
    navigate(`/checkout/multi?items=${selectedIds.join(',')}`);
  };

  const searchableItems = useMemo(() => {
    return items.map((item) => ({
      item,
      searchableText: normalizeString(
        [
          item.name,
          item.description,
          item.category,
          item.sku,
          item.location?.bin,
          item.location?.room,
          item.tags?.join(' '),
          item.keywords?.join(' ')
        ]
          .filter(Boolean)
          .join(' ')
      )
    }));
  }, [items]);

  const handleBulkLookup = () => {
    if (!items.length) {
      toast.error('Items are still loading. Please try again shortly.');
      return;
    }

    const lines = bulkSearchInput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      toast.error('Paste at least one line to search.');
      setBulkSearchResults([]);
      return;
    }

    setIsSearchingBulk(true);

    const results = lines.map((line, index) => {
      const normalizedQuery = normalizeString(line);

      const scoredMatches = searchableItems
        .map(({ item, searchableText }) => ({
          item,
          score: calculateSimilarity(normalizedQuery, searchableText)
        }))
        .filter(({ score }) => score >= 0.2)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      return {
        id: `${index}-${line}`,
        query: line,
        matches: scoredMatches,
        bestScore: scoredMatches[0]?.score || 0
      };
    });

    setBulkSearchResults(results);
    setIsSearchingBulk(false);
  };

  const addMatchToSelection = (itemId) => {
    setSelectedItems((prev) => ({ ...prev, [itemId]: true }));
  };


  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchRecentCheckouts();
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

  const fetchRecentCheckouts = async () => {
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

      {selectedCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="text-sm text-blue-800 font-semibold">
            {selectedCount} item{selectedCount > 1 ? 's' : ''} selected for bulk checkout
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-secondary text-sm"
              onClick={clearSelection}
            >
              Clear Selection
            </button>
            <button
              className="btn-primary text-sm"
              onClick={startBulkCheckout}
            >
              Start Bulk Checkout
            </button>
          </div>
        </div>
      )}

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

      {/* Bulk Similarity Search */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Paste &amp; Find Items</h2>
            <p className="text-sm text-gray-600">
              Paste any text (descriptions, bullet lists, spreadsheets). We&apos;ll look for similar items automatically.
            </p>
          </div>
            <ClipboardDocumentIcon className="w-6 h-6 text-gray-400" />
        </div>
        <textarea
          rows="4"
          className="input-field font-mono"
          placeholder="Example:&#10;- black table cloth&#10;- gold lantern centerpiece&#10;- acrylic podium sign"
          value={bulkSearchInput}
          onChange={(e) => setBulkSearchInput(e.target.value)}
        />
        <div className="flex flex-wrap gap-3">
          <button
            className="btn-primary"
            onClick={handleBulkLookup}
            disabled={isSearchingBulk}
          >
            {isSearchingBulk ? 'Searching...' : 'Find Similar Items'}
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              setBulkSearchInput('');
              setBulkSearchResults([]);
            }}
          >
            Clear
          </button>
        </div>

        {bulkSearchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Results ({bulkSearchResults.length})
            </h3>
            <div className="space-y-4">
              {bulkSearchResults.map((result) => (
                <div key={result.id} className="border rounded-xl p-4 bg-gray-50">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Input</p>
                  <p className="font-mono text-sm text-gray-900 mb-3">{result.query}</p>
                  {result.matches.length === 0 ? (
                    <p className="text-sm text-red-500 font-semibold">
                      No close matches found. Try different keywords.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {result.matches.map(({ item, score }) => {
                        const itemId = item._id || item.id;
                        const percent = Math.round(score * 100);
                        const canSelect = item.isCheckoutable && item.status === 'active' && item.availableQuantity > 0;
                        const isSelected = !!selectedItems[itemId];

                        return (
                          <div key={`${result.id}-${itemId}`} className="bg-white rounded-lg p-3 border">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500">
                                  {item.category || 'Uncategorized'} • Bin {item.location?.bin || 'N/A'} • SKU {item.sku || 'N/A'}
                                </p>
                              </div>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                  percent >= 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {percent}% match
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              <Link
                                to={`/items/${itemId}`}
                                className="btn-secondary text-sm"
                              >
                                View Item
                              </Link>
                              {canSelect && (
                                <button
                                  type="button"
                                  className={`btn-primary text-sm ${isSelected ? '!bg-green-600 !border-green-600' : ''}`}
                                  onClick={() => addMatchToSelection(itemId)}
                                >
                                  {isSelected ? 'Added for Bulk Checkout' : 'Add to Bulk Checkout'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const itemId = item._id || item.id;
          const isSelected = !!selectedItems[itemId];
          const canSelect = item.isCheckoutable && item.status === 'active' && item.availableQuantity > 0;

          return (
            <div
              key={itemId}
              className={`card hover:shadow-lg transition-shadow relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            >
              {canSelect && (
                <button
                  type="button"
                  className={`absolute top-3 right-3 p-2 rounded-full border ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItemSelection(itemId);
                  }}
                  aria-pressed={isSelected}
                >
                  <span className={`block w-3 h-3 rounded-full ${isSelected ? 'bg-white' : 'bg-transparent border border-gray-400'}`} />
                </button>
              )}
              {!canSelect && (
                <div className="absolute top-3 right-3 text-xs font-semibold text-gray-400">
                  Unavailable
                </div>
              )}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                </div>
                <QrCodeIcon className="w-6 h-6 text-gray-400 ml-2 mr-8" />
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
                  to={`/items/${itemId}`}
                  className="btn-secondary flex-1 text-center"
                >
                  View Details
                </Link>
                {item.isCheckoutable && item.availableQuantity > 0 && (
                  <Link
                    to={`/checkout/${itemId}`}
                    className="btn-primary flex-1 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Quick Checkout
                  </Link>
                )}
              </div>
            </div>
          );
        })}
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

