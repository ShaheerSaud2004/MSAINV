import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { itemsAPI, qrAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { PencilIcon, TrashIcon, QrCodeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [item, setItem] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

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

  const handleGenerateQR = async () => {
    try {
      const response = await qrAPI.generate(id);
      if (response.data.success) {
        setQrCode(response.data.data.qrCode);
        setShowQR(true);
        toast.success('QR code generated successfully');
      }
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await itemsAPI.delete(id);
      toast.success('Item deleted successfully');
      navigate('/items');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading item..." />
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/items')} className="btn-secondary">
          <ArrowLeftIcon className="w-5 h-5 inline mr-2" />
          Back to Items
        </button>
        {hasPermission('canManageItems') && (
          <div className="flex space-x-3">
            <Link to={`/items/edit/${id}`} className="btn-secondary">
              <PencilIcon className="w-5 h-5 inline mr-2" />
              Edit
            </Link>
            <button onClick={handleDelete} className="btn-danger">
              <TrashIcon className="w-5 h-5 inline mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="card">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
            <p className="text-gray-600 mt-2">{item.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="badge badge-info">{item.category}</span>
              <span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
                {item.status}
              </span>
              <span className={`badge ${item.isCheckoutable ? 'badge-success' : 'badge-danger'}`}>
                {item.isCheckoutable ? 'Checkoutable' : 'Not Checkoutable'}
              </span>
            </div>
          </div>
          <button onClick={handleGenerateQR} className="btn-secondary">
            <QrCodeIcon className="w-5 h-5 inline mr-2" />
            Generate QR
          </button>
        </div>

        {/* QR Code Display */}
        {showQR && qrCode && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center print-section">
            <h3 className="font-semibold mb-3">Item Checkout QR Code</h3>
            <img src={qrCode} alt="QR Code" className="mx-auto" style={{ maxWidth: '300px' }} />
            <div className="mt-3">
              <p className="font-bold text-lg">{item.name}</p>
              <p className="text-sm text-gray-600">SKU: {item.sku}</p>
              <p className="text-sm text-gray-600 mt-2">Scan to checkout this item</p>
              <p className="text-xs text-gray-500 mt-1">MSA Inventory Management</p>
            </div>
          </div>
        )}
        
        <style jsx>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-section, .print-section * {
              visibility: visible;
            }
            .print-section {
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
            }
          }
        `}</style>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Inventory</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Quantity:</span>
                <span className="font-semibold">{item.totalQuantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available:</span>
                <span className="font-semibold text-green-600">{item.availableQuantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Checked Out:</span>
                <span className="font-semibold text-blue-600">
                  {item.totalQuantity - item.availableQuantity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unit:</span>
                <span className="font-semibold">{item.unit}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">SKU:</span>
                <span className="font-mono text-sm">{item.sku || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Barcode:</span>
                <span className="font-mono text-sm">{item.barcode || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Condition:</span>
                <span className="font-semibold">{item.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Requires Approval:</span>
                <span className="font-semibold">{item.requiresApproval ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>

        {item.location && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Building</p>
                <p className="font-semibold">{item.location.building || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Room</p>
                <p className="font-semibold">{item.location.room || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Shelf</p>
                <p className="font-semibold">{item.location.shelf || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bin</p>
                <p className="font-semibold">{item.location.bin || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {hasPermission('canCheckout') && item.isCheckoutable && item.availableQuantity > 0 && (
        <div className="card bg-blue-50">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="flex gap-3">
            <Link 
              to={`/checkout/${id}`}
              className="btn-primary flex-1"
            >
              Checkout This Item
            </Link>
            {qrCode && (
              <button
                onClick={() => window.print()}
                className="btn-secondary"
              >
                Print QR Code
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;

