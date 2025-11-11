import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transactionsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeftIcon, CheckCircleIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission, user } = useAuth();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedReturn, setCopiedReturn] = useState(false);
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    fetchTransaction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchTransaction = async () => {
    try {
      const response = await transactionsAPI.getById(id);
      if (response.data.success) {
        setTransaction(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load transaction');
      navigate('/transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await transactionsAPI.approve(id);
      toast.success('Transaction approved successfully');
      fetchTransaction();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve transaction');
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await transactionsAPI.reject(id, { reason });
      toast.success('Transaction rejected');
      fetchTransaction();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject transaction');
    }
  };

  const handleReturn = () => {
    setShowReturnConfirm(true);
  };

  const confirmReturn = async () => {
    const notes = prompt('Any notes about the return? (Optional)') ?? '';

    try {
      setSubmittingReturn(true);
      const response = await transactionsAPI.return(id, { returnCondition: 'good', returnNotes: notes });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to mark return');
      }

      toast.success(response.data.message || 'Return marked as complete!');
      setShowReturnConfirm(false);
      await fetchTransaction();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to mark return');
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading transaction..." />
      </div>
    );
  }

  if (!transaction) return null;

  // Generate WhatsApp message for pending transactions
  const generateWhatsAppMessage = () => {
    if (!transaction || transaction.status !== 'pending') return '';
    
    const itemName = transaction.item?.name || 'the item';
    const quantity = transaction.quantity;
    const purpose = transaction.purpose || 'my event';
    const userName = transaction.user?.name || user?.name || 'me';
    const team = transaction.user?.team || '';
    const eventDate = transaction.expectedReturnDate 
      ? format(new Date(transaction.expectedReturnDate), 'MMMM dd, yyyy')
      : 'the requested date';
    
    return `Hi Maimuna, my name is ${userName}${team ? ` from ${team}` : ''}, and I want to checkout ${quantity} ${itemName}${quantity > 1 ? 's' : ''} for ${purpose} on ${eventDate}. I want to check it out and go to storage. Please review the request and let me know.`;
  };

  const generateReturnWhatsAppMessage = () => {
    if (!transaction) return '';

    const itemName = transaction.item?.name || 'the item';
    const quantity = transaction.quantity;
    const userName = transaction.user?.name || user?.name || 'I';
    const transactionNumber = transaction.transactionNumber || id;

    return `Hi Maimuna, ${userName} here. I just returned ${quantity} ${itemName}${quantity > 1 ? 's' : ''} for transaction ${transactionNumber}. Photos are shared in the chat and the item is back in storage. Thank you!`;
  };

  const handleCopyToClipboard = async () => {
    const message = generateWhatsAppMessage();
    if (!message) return;
    
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success('WhatsApp message copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy. Please select and copy manually.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/transactions')} className="btn-secondary">
          <ArrowLeftIcon className="w-5 h-5 inline mr-2" />
          Back to Transactions
        </button>
        {hasPermission('canApprove') && transaction.status === 'pending' && (
          <div className="flex space-x-3">
            <button onClick={handleApprove} className="btn-success">Approve</button>
            <button onClick={handleReject} className="btn-danger">Reject</button>
          </div>
        )}
        {transaction.status === 'active' && (
          <button 
            onClick={handleReturn}
            className="btn-success"
            disabled={submittingReturn}
          >
            {submittingReturn ? 'Marking...' : 'Mark as Returned'}
          </button>
        )}
      </div>

      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction #{transaction.transactionNumber}</h1>
            <p className="text-gray-600 mt-1">Type: {transaction.type}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge ${
              transaction.status === 'active' ? 'badge-success' :
              transaction.status === 'overdue' ? 'badge-danger' :
              transaction.status === 'pending' ? 'badge-warning' :
              'badge-gray'
            } text-lg px-4 py-2`}>
              {transaction.status}
            </span>
            {transaction.status === 'pending' && (
              <button
                onClick={handleCopyToClipboard}
                className="btn-primary flex items-center gap-2"
                title="Copy WhatsApp message"
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="w-5 h-5" />
                    Copy WhatsApp Message
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Item Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Item:</span>
                <span className="font-semibold">{transaction.item?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-semibold">{transaction.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Condition:</span>
                <span className="font-semibold">{transaction.checkoutCondition}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">User Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold">{transaction.user?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold text-sm">{transaction.user?.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Dates</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Checkout:</span>
                <span className="font-semibold">{format(new Date(transaction.checkoutDate), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Return:</span>
                <span className="font-semibold">{format(new Date(transaction.expectedReturnDate), 'MMM dd, yyyy')}</span>
              </div>
              {transaction.actualReturnDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Actual Return:</span>
                  <span className="font-semibold">{format(new Date(transaction.actualReturnDate), 'MMM dd, yyyy')}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Purpose</h3>
            <p className="text-gray-700">{transaction.purpose}</p>
            {transaction.notes && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-600">Notes:</h4>
                <p className="text-gray-700 text-sm mt-1">{transaction.notes}</p>
              </div>
            )}
          </div>
        </div>

        {transaction.isOverdue && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-red-800 font-semibold">⚠️ This transaction is overdue!</p>
          </div>
        )}

        {/* WhatsApp Message for Pending Requests */}
        {transaction.status === 'pending' && (
          <div className="mt-6 p-5 bg-gradient-to-r from-green-50 via-blue-50 to-indigo-50 border-l-4 border-green-500 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <ClipboardDocumentIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  📱 Next Step: Send WhatsApp Message
                </h3>
                <p className="text-gray-700 mb-3">
                  After submitting your request on the website, you must notify Maimuna on the Storage WhatsApp Chat. Copy the message below and send it to her.
                </p>
                <div className="bg-white rounded-lg p-4 border-2 border-gray-200 mb-3">
                  <p className="text-gray-800 whitespace-pre-wrap font-mono text-sm">
                    {generateWhatsAppMessage()}
                  </p>
                </div>
                <button
                  onClick={handleCopyToClipboard}
                  className="btn-primary flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="w-5 h-5" />
                      Copy Message
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Return instructions */}
        {transaction.status === 'active' && (
          <div className="mt-6 p-5 bg-gradient-to-r from-yellow-50 via-orange-50 to-amber-50 border-l-4 border-yellow-500 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <ClipboardDocumentIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="text-lg font-bold text-gray-900">📣 Final Step: Send a Photo in WhatsApp</h3>
                <p className="text-gray-700">
                  Snap a quick photo of the item back in storage, paste the message below in the Storage WhatsApp chat, then click <span className="font-semibold">Mark as Returned</span>.
                </p>
                <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                  <p className="text-gray-800 whitespace-pre-wrap font-mono text-sm">
                    {generateReturnWhatsAppMessage()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(generateReturnWhatsAppMessage());
                        setCopiedReturn(true);
                        toast.success('Return message copied!');
                        setTimeout(() => setCopiedReturn(false), 2000);
                      } catch (error) {
                        toast.error('Failed to copy message. Please copy manually.');
                      }
                    }}
                    className="btn-primary flex items-center gap-2"
                  >
                    {copiedReturn ? (
                      <>
                        <CheckIcon className="w-5 h-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="w-5 h-5" />
                        Copy Return Message
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReturn}
                    className="btn-success flex items-center gap-2"
                    disabled={submittingReturn}
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    {submittingReturn ? 'Marking...' : 'Mark as Returned'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {transaction.status === 'returned' && (
          <div className="mt-6 p-5 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Return Completed!</h3>
                <p className="text-gray-700 mt-1">
                  Thanks for closing the loop and letting the Storage WhatsApp chat know. The item is marked as back in storage.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showReturnConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <h3 className="text-xl font-bold text-gray-900">Confirm WhatsApp Update</h3>
            <p className="text-gray-700">
              Please make sure you already sent a quick photo in the Storage WhatsApp chat showing the item back in storage. Once that&apos;s done, mark this return as complete.
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn-secondary w-full sm:w-auto"
                onClick={() => setShowReturnConfirm(false)}
                disabled={submittingReturn}
              >
                Not Yet
              </button>
              <button
                type="button"
                className="btn-success w-full sm:w-auto"
                onClick={confirmReturn}
                disabled={submittingReturn}
              >
                {submittingReturn ? 'Marking...' : 'Yes, Mark as Returned'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TransactionDetail;

