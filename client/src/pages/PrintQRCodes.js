import React, { useState, useEffect } from 'react';
import { itemsAPI, qrAPI } from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const PrintQRCodes = () => {
  const [items, setItems] = useState([]);
  const [qrCodes, setQrCodes] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await itemsAPI.getAll({ limit: 1000 });
      if (response.data.success) {
        setItems(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const generateAllQRCodes = async () => {
    setGenerating(true);
    const codes = {};
    
    for (const item of items) {
      try {
        const response = await qrAPI.generate(item._id || item.id);
        if (response.data.success) {
          codes[item._id || item.id] = response.data.data.qrCode;
        }
      } catch (error) {
        console.error(`Failed to generate QR for ${item.name}`, error);
      }
    }
    
    setQrCodes(codes);
    setGenerating(false);
    toast.success(`Generated ${Object.keys(codes).length} QR codes!`);
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
      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Print QR Codes</h1>
          <p className="text-gray-600 mt-1">Generate and print QR codes for all items</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateAllQRCodes}
            disabled={generating}
            className="btn-primary disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate All QR Codes'}
          </button>
          {Object.keys(qrCodes).length > 0 && (
            <button
              onClick={() => window.print()}
              className="btn-success"
            >
              Print All
            </button>
          )}
        </div>
      </div>

      {Object.keys(qrCodes).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print-grid">
          {items.map((item) => {
            const qrCode = qrCodes[item._id || item.id];
            if (!qrCode) return null;

            return (
              <div
                key={item._id || item.id}
                className="card text-center break-inside-avoid"
              >
                <img
                  src={qrCode}
                  alt={`QR Code for ${item.name}`}
                  className="mx-auto"
                  style={{ maxWidth: '200px' }}
                />
                <div className="mt-3">
                  <p className="font-bold text-sm">{item.name}</p>
                  <p className="text-xs text-gray-600">SKU: {item.sku}</p>
                  <p className="text-xs text-gray-600">Box: {item.location?.box || 'N/A'}</p>
                  <p className="text-xs text-gray-500 mt-1">Scan to checkout</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {Object.keys(qrCodes).length === 0 && !generating && (
        <div className="card text-center py-12">
          <p className="text-gray-500">Click "Generate All QR Codes" to create printable QR codes for all items</p>
        </div>
      )}

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 1rem !important;
          }
          .card {
            page-break-inside: avoid;
            border: 1px solid #ddd;
            padding: 1rem;
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintQRCodes;

