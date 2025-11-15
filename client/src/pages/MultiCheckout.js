import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { itemsAPI, transactionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeftIcon, ClipboardDocumentIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const MultiCheckout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itemParam = searchParams.get('items') || '';
  const itemIds = useMemo(
    () => itemParam.split(',').map(id => id.trim()).filter(Boolean),
    [itemParam]
  );

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showWhatsAppMessage, setShowWhatsAppMessage] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createdTransactions, setCreatedTransactions] = useState([]);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    team: '',
    phoneNumber: user?.phone || '',
    email: user?.email || '',
    purpose: '',
    expectedReturnDate: '',
    destination: {
      building: '',
      room: '',
      location: ''
    },
    notes: '',
    agreeToTerms: false
  });

  useEffect(() => {
    const fetchItems = async () => {
      if (itemIds.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const responses = await Promise.all(
          itemIds.map(id =>
            itemsAPI
              .getById(id)
              .then(res => res.data?.data)
              .catch(() => null)
          )
        );

        const validItems = responses
          .filter(Boolean)
          .filter(item => item.isCheckoutable && item.status === 'active' && item.availableQuantity > 0);

        if (validItems.length === 0) {
          toast.error('None of the selected items are available for checkout right now.');
          navigate('/items');
          return;
        }

        if (validItems.length !== itemIds.length) {
          toast.warn('Some selected items are no longer available and were removed from the list.');
        }

        setSelectedItems(
          validItems.map(item => ({
            item,
            quantity: 1
          }))
        );
      } catch (error) {
        console.error(error);
        toast.error('Failed to load selected items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [itemIds, navigate]);

  const updateQuantity = (id, quantity) => {
    setSelectedItems(prev =>
      prev.map(entry =>
        entry.item._id === id || entry.item.id === id
          ? {
              ...entry,
              quantity
            }
          : entry
      )
    );
  };

  const removeItem = (id) => {
    setSelectedItems(prev => prev.filter(entry => (entry.item._id || entry.item.id) !== id));
  };

  useEffect(() => {
    if (!loading && selectedItems.length === 0 && itemIds.length > 0) {
      // All items removed -> redirect back
      toast.info('No items selected. Please choose items to checkout.');
      navigate('/items');
    }
  }, [loading, selectedItems, itemIds, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const minimumReturnDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      toast.error('Select at least one item to checkout.');
      return;
    }

    if (!formData.fullName || !formData.team || !formData.phoneNumber || !formData.email) {
      toast.error('Please fill in all required personal information.');
      return;
    }

    if (!formData.purpose || !formData.expectedReturnDate) {
      toast.error('Please provide purpose and expected return date.');
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions.');
      return;
    }

    // Validate quantities
    for (const entry of selectedItems) {
      const available = entry.item.availableQuantity;
      if (entry.quantity < 1) {
        toast.error(`Quantity for ${entry.item.name} must be at least 1.`);
        return;
      }
      if (entry.quantity > available) {
        toast.error(`Only ${available} unit(s) of ${entry.item.name} are available.`);
        return;
      }
    }

    const payload = {
      items: selectedItems.map(entry => ({
        item: entry.item._id || entry.item.id,
        quantity: entry.quantity
      })),
      purpose: formData.purpose,
      expectedReturnDate: formData.expectedReturnDate,
      destination: formData.destination,
      requester: {
        fullName: formData.fullName,
        team: formData.team,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        notes: formData.notes
      }
    };

    setSubmitting(true);

    try {
      const response = await transactionsAPI.bulkCheckout(payload);
      if (response.data.success) {
        setCreatedTransactions(response.data.data || []);
        setShowWhatsAppMessage(true);
        toast.success('Bulk checkout request submitted for approval');
      }
    } catch (error) {
      const message = error.response?.data?.errors?.join(' ') || error.response?.data?.message || 'Bulk checkout failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const generateWhatsAppMessage = () => {
    if (!formData.fullName || selectedItems.length === 0) return '';

    const eventDate = formData.expectedReturnDate
      ? format(new Date(formData.expectedReturnDate), 'MMMM dd, yyyy')
      : 'the requested date';

    const list = selectedItems
      .map(entry => `• ${entry.quantity} × ${entry.item.name}`)
      .join('\n');

    return `Hi Maimuna, my name is ${formData.fullName}${formData.team ? ` from ${formData.team}` : ''}, and I want to checkout the following items for ${formData.purpose} on ${eventDate}:\n${list}\nPlease review the request and let me know.`;
  };

  const handleCopyToClipboard = async () => {
    const message = generateWhatsAppMessage();
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success('Message copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy. Please select and copy manually.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading selected items..." />
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">No Items Selected</h1>
        <p className="text-gray-600">
          Please select items from the inventory page to start a multi-checkout.
        </p>
        <button
          className="btn-primary"
          onClick={() => navigate('/items')}
        >
          Back to Items
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Checkout</h1>
          <p className="text-gray-600 mt-1">
            One form for multiple items. All requests still require admin approval.
          </p>
        </div>
        <button onClick={() => navigate('/items')} className="btn-secondary">
          <ArrowLeftIcon className="w-5 h-5 inline mr-2" />
          Back to Items
        </button>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Selected Items ({selectedItems.length})</h2>
            <p className="text-sm text-gray-500">Adjust quantities or remove items as needed.</p>
          </div>
          <button
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            onClick={() => navigate('/items')}
          >
            + Add More Items
          </button>
        </div>

        <div className="space-y-3">
          {selectedItems.map(({ item, quantity }) => {
            const itemId = item._id || item.id;
            return (
              <div
                key={itemId}
                className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <p className="text-lg font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.availableQuantity} / {item.totalQuantity} available • {item.category}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Box / Bin: {item.location?.bin || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={item.availableQuantity}
                      value={quantity}
                      onChange={(e) => updateQuantity(itemId, Math.min(Math.max(1, Number(e.target.value)), item.availableQuantity))}
                      className="input-field w-24 text-center"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Max: {item.availableQuantity}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                    onClick={() => removeItem(itemId)}
                    title="Remove item"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Personal Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
            👤 Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                className="input-field"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team / Department *</label>
              <input
                type="text"
                name="team"
                required
                className="input-field"
                value={formData.team}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phoneNumber"
                required
                className="input-field"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                required
                className="input-field"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Checkout Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
            📦 Checkout Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return Date *</label>
              <input
                type="date"
                name="expectedReturnDate"
                required
                min={minimumReturnDate}
                className="input-field"
                value={formData.expectedReturnDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
              <input
                type="text"
                name="purpose"
                required
                className="input-field"
                placeholder="e.g., Banquet, Youth Night, Fundraiser"
                value={formData.purpose}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Destination */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
            📍 Destination (Optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
              <input
                type="text"
                name="destination.building"
                className="input-field"
                value={formData.destination.building}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <input
                type="text"
                name="destination.room"
                className="input-field"
                value={formData.destination.room}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specific Location</label>
              <input
                type="text"
                name="destination.location"
                className="input-field"
                value={formData.destination.location}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes (Optional)
          </label>
          <textarea
            name="notes"
            rows="3"
            className="input-field"
            placeholder="Any special instructions or details..."
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        {/* Terms */}
        <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-5">
          <p className="text-sm text-gray-700 mb-3">
            ⚠️ IMPORTANT: Items must be returned in the SAME location and condition as received.
            Failure to do so will result in access being removed.
          </p>
          <label className="flex items-start bg-white p-3 rounded-lg border-2 border-gray-300">
            <input
              type="checkbox"
              name="agreeToTerms"
              required
              className="mr-3 h-5 w-5 mt-0.5 flex-shrink-0"
              checked={formData.agreeToTerms}
              onChange={handleChange}
            />
            <span className="text-sm font-bold text-gray-900">
              I agree to the terms and conditions *
            </span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/items')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Bulk Request'}
          </button>
        </div>
      </form>

      {/* WhatsApp Modal */}
      {showWhatsAppMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📱 Copy WhatsApp Message</h2>
            <p className="text-gray-600 mb-4">
              Copy this message and send it to Maimuna on the Storage WhatsApp Chat:
            </p>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-gray-800 whitespace-pre-wrap font-mono text-sm">
                {generateWhatsAppMessage()}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopyToClipboard}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="w-5 h-5" />
                    Copy to Clipboard
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowWhatsAppMessage(false);
                  navigate(createdTransactions.length ? `/transactions/${createdTransactions[0]._id || createdTransactions[0].id}` : '/transactions');
                }}
                className="btn-secondary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiCheckout;


