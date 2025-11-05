import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsAPI, transactionsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeftIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const CheckoutForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showWhatsAppMessage, setShowWhatsAppMessage] = useState(false);
  const [createdTransaction, setCreatedTransaction] = useState(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    // User Information
    fullName: user?.name || '',
    team: '',
    phoneNumber: user?.phone || '',
    email: user?.email || '',
    
    // Checkout Details
    quantity: 1,
    purpose: '',
    expectedReturnDate: '',
    destination: {
      building: '',
      room: '',
      location: ''
    },
    notes: '',
    
    // Agreement
    agreeToTerms: false
  });

  useEffect(() => {
    fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await itemsAPI.getById(id);
      if (response.data.success) {
        setItem(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load item');
      navigate('/items');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.team || !formData.phoneNumber || !formData.email) {
      toast.error('Please fill in all required personal information');
      return;
    }

    if (!formData.purpose || !formData.expectedReturnDate) {
      toast.error('Please provide purpose and expected return date');
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    if (formData.quantity > item.availableQuantity) {
      toast.error(`Only ${item.availableQuantity} units available`);
      return;
    }

    setSubmitting(true);

    try {
      const checkoutData = {
        item: id,
        quantity: parseInt(formData.quantity),
        purpose: formData.purpose,
        expectedReturnDate: formData.expectedReturnDate,
        destination: formData.destination,
        notes: `
Checked out by: ${formData.fullName}
Team: ${formData.team}
Phone: ${formData.phoneNumber}
Email: ${formData.email}
${formData.notes ? `\nAdditional notes: ${formData.notes}` : ''}
        `.trim()
      };

      const response = await transactionsAPI.checkout(checkoutData);

      if (response.data.success) {
        setCreatedTransaction(response.data.data);
        setShowWhatsAppMessage(true);
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }

  if (!item) return null;

  // Calculate minimum return date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Generate WhatsApp message
  const generateWhatsAppMessage = () => {
    if (!item || !formData.fullName) return '';
    
    const itemName = item.name;
    const quantity = formData.quantity;
    const purpose = formData.purpose;
    const eventDate = formData.expectedReturnDate 
      ? format(new Date(formData.expectedReturnDate), 'MMMM dd, yyyy')
      : 'the requested date';
    
    return `Hi Maimuna, my name is ${formData.fullName}${formData.team ? ` from ${formData.team}` : ''}, and I want to checkout ${quantity} ${itemName}${quantity > 1 ? 's' : ''} for ${purpose} on ${eventDate}. I want to check it out and go to storage. Please review the request and let me know.`;
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Checkout Item</h1>
          <p className="text-gray-600 mt-1">Fill in all required information to checkout</p>
        </div>
        <button onClick={() => navigate(`/items/${id}`)} className="btn-secondary">
          <ArrowLeftIcon className="w-5 h-5 inline mr-2" />
          Back
        </button>
      </div>

      {/* Item Info Card */}
      <div className="card bg-blue-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
            <p className="text-gray-600 mt-1">{item.description}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="badge badge-info">{item.category}</span>
              <span className="badge badge-success">
                {item.availableQuantity} / {item.totalQuantity} available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
            👤 Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                required
                className="input-field"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team / Department *
              </label>
              <input
                type="text"
                name="team"
                required
                className="input-field"
                placeholder="e.g., MSA Events, Youth, etc."
                value={formData.team}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                required
                className="input-field"
                placeholder="(555) 123-4567"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                className="input-field"
                placeholder="your.email@example.com"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                required
                min="1"
                max={item.availableQuantity}
                className="input-field"
                value={formData.quantity}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum: {item.availableQuantity} units
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Return Date *
              </label>
              <input
                type="date"
                name="expectedReturnDate"
                required
                min={minDate}
                className="input-field"
                value={formData.expectedReturnDate}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose / Reason for Checkout *
              </label>
              <textarea
                name="purpose"
                required
                rows="3"
                className="input-field"
                placeholder="e.g., MSA Game Night, Youth Event, Friday Prayer setup, etc."
                value={formData.purpose}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                Please be specific about why you need this item
              </p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building
              </label>
              <input
                type="text"
                name="destination.building"
                className="input-field"
                placeholder="e.g., Masjid, Community Center"
                value={formData.destination.building}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room
              </label>
              <input
                type="text"
                name="destination.room"
                className="input-field"
                placeholder="e.g., Main Hall, Room 101"
                value={formData.destination.room}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specific Location
              </label>
              <input
                type="text"
                name="destination.location"
                className="input-field"
                placeholder="e.g., Storage closet, Stage area"
                value={formData.destination.location}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes (Optional)
          </label>
          <textarea
            name="notes"
            rows="3"
            className="input-field"
            placeholder="Any special instructions or additional information..."
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        {/* Terms & Conditions */}
        <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-5">
          <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Terms & Conditions
          </h4>
          <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-3 rounded">
            <p className="text-sm font-bold text-red-800">
              ⚠️ IMPORTANT: Items must be returned in the SAME location and condition as received. 
              Failure to do so will result in ACCESS REMOVAL.
            </p>
          </div>
          <ul className="text-sm text-gray-700 space-y-2 mb-4">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>I agree to return the item(s) by the specified return date</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>I will take full responsibility for the item(s) while in my possession</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>I understand that late returns may result in penalties</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>I will return the item(s) in the same location and condition as received</strong></span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>I will notify MSA immediately if the item is lost or damaged</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>I understand that failure to return items properly will result in access being removed</strong></span>
            </li>
          </ul>
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

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate(`/items/${id}`)}
            className="btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Processing...' : item.requiresApproval ? 'Submit for Approval' : 'Checkout Item'}
          </button>
        </div>
      </form>

      {/* WhatsApp Message Modal */}
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
                  navigate(createdTransaction ? `/transactions/${createdTransaction._id || createdTransaction.id}` : '/transactions');
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

export default CheckoutForm;

