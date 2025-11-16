import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { transactionsAPI } from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Transactions = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [whatsappConfirmations, setWhatsappConfirmations] = useState({
    copiedMessage: false,
    sentMessage: false
  });

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter]);

  const fetchTransactions = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const response = await transactionsAPI.getAll(params);
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedTransactions([]);
  }, [statusFilter, typeFilter]);

  const isAllSelected = useMemo(() => {
    if (!transactions.length) return false;
    return selectedTransactions.length === transactions.length;
  }, [transactions, selectedTransactions]);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedTransactions([]);
    } else {
      const allIds = transactions.map(tx => tx._id || tx.id).filter(Boolean);
      setSelectedTransactions(allIds);
    }
  };

  const toggleTransactionSelection = (transactionId) => {
    setSelectedTransactions((prev) =>
      prev.includes(transactionId) ? prev.filter(id => id !== transactionId) : [...prev, transactionId]
    );
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    try {
      return format(new Date(dateValue), 'MMM dd, yyyy');
    } catch (e) {
      return '';
    }
  };

  const selectedDetails = useMemo(() => {
    if (!selectedTransactions.length) return [];
    return transactions.filter(tx => selectedTransactions.includes(tx._id || tx.id));
  }, [transactions, selectedTransactions]);

  const getTransactionReference = (tx) =>
    tx.transactionNumber || tx.reference || tx.shortId || tx.code || tx._id || tx.id;

  const generateWhatsAppMessage = () => {
    if (!selectedDetails.length) return '';

    const displayName = user?.name || 'MSA member';
    const header = `Hi Maimuna, this is ${displayName}. I'm sending one update covering ${selectedDetails.length} transaction${selectedDetails.length > 1 ? 's' : ''} from the Storage system:`;

    const lines = selectedDetails
      .map((tx, index) => {
        const itemName = tx.item?.name || 'Unknown item';
        const qty = tx.quantity || 1;
        const statusLabel = formatStatus(tx.status);
        const requestedOn = formatDate(tx.checkoutDate || tx.createdAt);
        const returnDue = formatDate(tx.expectedReturnDate);
        const reference = getTransactionReference(tx);
        const purpose = tx.purpose || '';

        const parts = [`${index + 1}. ${itemName} × ${qty}`];
        if (purpose) parts.push(`(${purpose})`);
        if (statusLabel) parts.push(`Status: ${statusLabel}`);
        if (requestedOn) parts.push(`Requested: ${requestedOn}`);
        if (returnDue) parts.push(`Return: ${returnDue}`);
        if (reference) parts.push(`Ref: ${reference}`);

        return parts.join(' • ');
      })
      .join('\n');

    const footer = 'Please review these together and let me know if you need anything else. Thank you!';

    return `${header}\n${lines}\n${footer}`;
  };

  const handleCopyToClipboard = async () => {
    const message = generateWhatsAppMessage();
    if (!message) {
      toast.error('Select at least one transaction to build the WhatsApp message.');
      return;
    }

    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setWhatsappConfirmations((prev) => ({ ...prev, copiedMessage: true }));
      toast.success('Combined WhatsApp message copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy. Please try again or copy manually.');
    }
  };

  const openWhatsAppModal = () => {
    if (!selectedTransactions.length) {
      toast.error('Select at least one transaction first.');
      return;
    }

    setWhatsappConfirmations({ copiedMessage: false, sentMessage: false });
    setShowWhatsAppModal(true);
  };

  const closeWhatsAppModal = () => {
    setShowWhatsAppModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading transactions..." />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-success',
      pending: 'badge-warning',
      overdue: 'badge-danger',
      returned: 'badge-gray',
      cancelled: 'badge-gray',
      approved: 'badge-success',
      rejected: 'badge-danger'
    };
    return badges[status] || 'badge-gray';
  };

  const formatStatus = (status) => {
    if (!status) return '';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600 mt-1">View and manage item transactions</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="overdue">Overdue</option>
              <option value="returned">Returned</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              className="input-field"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="checkout">Checkout</option>
              <option value="return">Return</option>
              <option value="reserve">Reserve</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label="Select all transactions"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction._id || transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedTransactions.includes(transaction._id || transaction.id)}
                      onChange={() => toggleTransactionSelection(transaction._id || transaction.id)}
                      aria-label={`Select transaction ${transaction.transactionNumber || transaction._id || transaction.id}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                    {transaction.transactionNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.item?.name || 'Unknown Item'}
                    </div>
                    <div className="text-sm text-gray-500">Qty: {transaction.quantity}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{transaction.user?.name || 'Unknown User'}</div>
                    <div className="text-sm text-gray-500">{transaction.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {transaction.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getStatusBadge(transaction.status)}`}>
                      {formatStatus(transaction.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(transaction.checkoutDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      to={`/transactions/${transaction._id || transaction.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No transactions found</p>
        </div>
      )}

      {selectedTransactions.length > 0 && (
        <div className="fixed bottom-4 inset-x-0 flex justify-center pointer-events-none">
          <div className="pointer-events-auto bg-white shadow-xl border border-gray-200 rounded-full px-6 py-3 flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900">
              {selectedTransactions.length} transaction{selectedTransactions.length > 1 ? 's' : ''} selected
            </span>
            <button
              className="btn-primary !py-2 !px-4"
              onClick={openWhatsAppModal}
            >
              Build WhatsApp Message
            </button>
            <button
              className="btn-secondary !py-2 !px-4"
              onClick={() => setSelectedTransactions([])}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📱 Combined WhatsApp Message</h2>
            <p className="text-gray-600 mb-2">
              Send this one message covering all selected transactions to the Storage WhatsApp chat.
            </p>
            <p className="text-sm text-blue-700 font-semibold mb-4">
              Make sure you copied it and already sent it before closing this window.
            </p>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-gray-800 whitespace-pre-wrap font-mono text-sm">
                {generateWhatsAppMessage()}
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900 space-y-2">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={whatsappConfirmations.copiedMessage}
                    onChange={(e) =>
                      setWhatsappConfirmations((prev) => ({
                        ...prev,
                        copiedMessage: e.target.checked
                      }))
                    }
                  />
                  <span>I copied this combined WhatsApp message.</span>
                </label>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={whatsappConfirmations.sentMessage}
                    onChange={(e) =>
                      setWhatsappConfirmations((prev) => ({
                        ...prev,
                        sentMessage: e.target.checked
                      }))
                    }
                  />
                  <span>I already sent it in the Storage WhatsApp chat.</span>
                </label>
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
                      Copy Message
                    </>
                  )}
                </button>
                <button
                  onClick={closeWhatsAppModal}
                  className="btn-secondary flex-1"
                  disabled={!whatsappConfirmations.copiedMessage || !whatsappConfirmations.sentMessage}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;

