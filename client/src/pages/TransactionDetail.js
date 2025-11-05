import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transactionsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeftIcon, CameraIcon, PhotoIcon, CheckCircleIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission, user } = useAuth();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

  const handleReturn = async () => {
    const notes = prompt('Any notes about the return?');
    try {
      await transactionsAPI.return(id, { returnCondition: 'good', returnNotes: notes || '' });
      toast.success('Item returned successfully');
      fetchTransaction();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to return item');
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
            onClick={() => {
              if (!transaction.storagePhotoUploaded) {
                toast.error('You must upload storage visit photos before closing this transaction!', {
                  autoClose: 5000
                });
                return;
              }
              handleReturn();
            }} 
            className="btn-success"
            disabled={!transaction.storagePhotoUploaded}
          >
            {transaction.storagePhotoUploaded ? 'Mark as Returned' : 'Upload Photos First'}
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

        {/* REQUIRED PHOTO ALERT - Show after approval */}
        {(transaction.status === 'active' || transaction.status === 'approved') && 
         !transaction.storagePhotoUploaded && (
          <div className="mt-6 p-6 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-l-4 border-orange-500 rounded-lg shadow-lg animate-pulse">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CameraIcon className="w-10 h-10 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-orange-900 mb-2">
                  ⚠️ REQUIRED: Upload Storage Visit Photos
                </h3>
                <p className="text-orange-800 font-semibold mb-3">
                  You MUST upload photos of your storage visit before closing out this transaction.
                </p>
                <p className="text-sm text-orange-700 mb-4">
                  This is required for safety, accountability, and proper documentation. The transaction cannot be completed until photos are uploaded.
                </p>
                <Link
                  to={`/storage-visit/${id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-600 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <CameraIcon className="w-6 h-6" />
                  Upload Photos Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Storage Visit Photos Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Storage Visit Documentation</h2>
            <p className="text-gray-600 mt-1">
              {(transaction.status === 'active' || transaction.status === 'approved') && !transaction.storagePhotoUploaded
                ? '⚠️ REQUIRED: Upload photos before closing this transaction'
                : 'Photos taken during storage visits for safety tracking'}
            </p>
          </div>
          {(transaction.status === 'active' || transaction.status === 'approved' || transaction.status === 'pending') && (
            <Link
              to={`/storage-visit/${id}`}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all ${
                !transaction.storagePhotoUploaded && (transaction.status === 'active' || transaction.status === 'approved')
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 animate-pulse'
                  : 'btn-primary'
              }`}
            >
              <CameraIcon className="w-5 h-5" />
              {!transaction.storagePhotoUploaded && (transaction.status === 'active' || transaction.status === 'approved')
                ? '⚠️ Upload Required Photos'
                : 'Upload Photos'}
            </Link>
          )}
        </div>

        {transaction.storagePhotoUploaded && transaction.storageVisits && transaction.storageVisits.length > 0 ? (
          <div className="space-y-6">
            {transaction.storageVisits.map((visit, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`badge ${
                        visit.visitType === 'pickup' ? 'badge-success' :
                        visit.visitType === 'return' ? 'badge-info' :
                        visit.visitType === 'inspection' ? 'badge-warning' :
                        'badge-gray'
                      }`}>
                        {visit.visitType}
                      </span>
                      <span className="text-sm text-gray-600">
                        {format(new Date(visit.visitDate), 'MMM dd, yyyy • h:mm a')}
                      </span>
                      {visit.verifiedBy && (
                        <span className="flex items-center gap-1 text-sm text-green-600">
                          <CheckCircleIcon className="w-4 h-4" />
                          Verified
                        </span>
                      )}
                    </div>
                    {visit.location && (
                      <p className="text-sm text-gray-600">📍 {visit.location}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>By: {visit.userId?.name || 'Unknown'}</p>
                  </div>
                </div>

                {/* Photos Grid */}
                {visit.photos && visit.photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    {visit.photos.map((photo, photoIndex) => (
                      <div key={photoIndex} className="relative group">
                        <img
                          src={`${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3022'}${photo.url}`}
                          alt={photo.caption || `Visit photo ${photoIndex + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-500 transition-all cursor-pointer"
                          onClick={() => window.open(`${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3022'}${photo.url}`, '_blank')}
                        />
                        {photo.caption && (
                          <p className="text-xs text-gray-600 mt-1 truncate">{photo.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {visit.notes && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Notes:</p>
                    <p className="text-sm text-gray-600 mt-1">{visit.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">No storage visit photos yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Upload photos when visiting storage for safety and tracking purposes
            </p>
            {(transaction.status === 'active' || transaction.status === 'approved' || transaction.status === 'pending') && (
              <Link
                to={`/storage-visit/${id}`}
                className="btn-primary inline-flex items-center gap-2"
              >
                <CameraIcon className="w-5 h-5" />
                Upload Photos Now
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionDetail;

