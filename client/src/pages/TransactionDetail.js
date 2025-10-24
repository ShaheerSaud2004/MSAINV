import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transactionsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

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
          <button onClick={handleReturn} className="btn-success">Mark as Returned</button>
        )}
      </div>

      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction #{transaction.transactionNumber}</h1>
            <p className="text-gray-600 mt-1">Type: {transaction.type}</p>
          </div>
          <span className={`badge ${
            transaction.status === 'active' ? 'badge-success' :
            transaction.status === 'overdue' ? 'badge-danger' :
            transaction.status === 'pending' ? 'badge-warning' :
            'badge-gray'
          } text-lg px-4 py-2`}>
            {transaction.status}
          </span>
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
      </div>
    </div>
  );
};

export default TransactionDetail;

