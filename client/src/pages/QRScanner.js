import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { qrAPI } from '../services/api';
import { toast } from 'react-toastify';
import { QrCodeIcon, CameraIcon } from '@heroicons/react/24/outline';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [item, setItem] = useState(null);
  const [action, setAction] = useState('view');
  const [checkoutForm, setCheckoutForm] = useState({
    quantity: 1,
    purpose: '',
    expectedReturnDate: '',
    destination: {
      building: '',
      room: '',
      location: ''
    },
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [manualQRCode, setManualQRCode] = useState('');
  const [scanMode, setScanMode] = useState('both'); // 'qr', 'barcode', 'both'
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const html5QrCode = new Html5Qrcode('reader');
      html5QrCodeRef.current = html5QrCode;

      // Configure what formats to scan
      const formatsToSupport = scanMode === 'qr' 
        ? [Html5QrcodeSupportedFormats.QR_CODE]
        : scanMode === 'barcode'
        ? [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E
          ]
        : [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E
          ];

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          formatsToSupport: formatsToSupport
        },
        (decodedText, decodedResult) => {
          // Successfully scanned
          handleScanSuccess(decodedText, decodedResult);
        },
        (errorMessage) => {
          // Scan error - ignore
        }
      );
      setScanning(true);
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Unable to access camera. Please check permissions or enter code manually.');
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
      html5QrCodeRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const handleScanSuccess = async (decodedText, decodedResult) => {
    await stopCamera();
    setLoading(true);
    
    try {
      // Determine if it's a QR code or barcode
      const isQRCode = decodedResult.result.format?.formatName === 'QR_CODE';
      
      if (isQRCode) {
        // Try to process as QR code
        await processQRCode(decodedText);
      } else {
        // Process as barcode
        await processBarcode(decodedText);
      }
    } catch (error) {
      console.error('Scan processing error:', error);
      toast.error('Error processing scanned code');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualQRCode.trim()) {
      toast.error('Please enter a QR code');
      return;
    }
    await processQRCode(manualQRCode);
  };

  const processQRCode = async (qrCode) => {
    try {
      // Parse QR code data
      let qrData;
      try {
        qrData = JSON.parse(qrCode);
      } catch {
        // If not JSON, treat as direct QR code string
        qrData = { qrCode: qrCode, type: 'item' };
      }

      // Fetch item details
      const response = await qrAPI.getItemByQRCode(qrData.qrCode || qrCode);
      if (response.data.success) {
        const foundItem = response.data.data;
        setItem(foundItem);
        setScannedData(qrData);
        
        // Check if item is available for checkout
        if (foundItem.isCheckoutable && foundItem.availableQuantity > 0) {
          toast.success('Item found! Redirecting to checkout form...');
          // Redirect to checkout form after 1 second
          setTimeout(() => {
            navigate(`/checkout/${foundItem._id || foundItem.id}`);
          }, 1000);
        } else {
          toast.info('Item found but not available for checkout');
        }
      }
    } catch (error) {
      console.error('QR scan error:', error);
      toast.error(error.response?.data?.message || 'Item not found');
    }
  };

  const processBarcode = async (barcode) => {
    try {
      // Fetch item by barcode
      const response = await qrAPI.getItemByBarcode(barcode);
      if (response.data.success) {
        const foundItem = response.data.data;
        setItem(foundItem);
        setScannedData({ barcode: barcode, type: 'item' });
        toast.success('Barcode scanned! Item found.');
        
        // Check if item is available for checkout
        if (foundItem.isCheckoutable && foundItem.availableQuantity > 0) {
          setTimeout(() => {
            navigate(`/checkout/${foundItem._id || foundItem.id}`);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Barcode scan error:', error);
      toast.error(error.response?.data?.message || 'Item not found with this barcode');
    }
  };

  const handleAction = async () => {
    if (!scannedData || !item) {
      toast.error('No item scanned');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        qrData: scannedData,
        action: action
      };

      if (action === 'checkout' || action === 'reserve') {
        if (!checkoutForm.purpose || !checkoutForm.expectedReturnDate) {
          toast.error('Please fill in purpose and expected return date');
          setLoading(false);
          return;
        }
        requestData.quantity = checkoutForm.quantity;
        requestData.purpose = checkoutForm.purpose;
        requestData.expectedReturnDate = checkoutForm.expectedReturnDate;
        requestData.destination = checkoutForm.destination;
        requestData.notes = checkoutForm.notes;
      }

      const response = await qrAPI.scan(requestData);

      if (response.data.success) {
        toast.success(response.data.message);
        
        // Reset form
        setScannedData(null);
        setItem(null);
        setAction('view');
        setCheckoutForm({
          quantity: 1,
          purpose: '',
          expectedReturnDate: '',
          destination: { building: '', room: '', location: '' },
          notes: ''
        });
        setManualQRCode('');

        // Navigate based on action
        if (action === 'checkout' || action === 'return' || action === 'reserve') {
          setTimeout(() => {
            navigate('/transactions');
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Action error:', error);
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">QR Code Scanner</h1>
        <p className="text-gray-600 mt-1">
          Scan item QR codes to checkout, return, or view details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Camera Scanner</h2>
          
          {!scanning && !item && (
            <div className="text-center">
              <button
                onClick={startCamera}
                className="btn-primary inline-flex items-center"
              >
                <CameraIcon className="w-5 h-5 mr-2" />
                Start Camera
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Or enter QR code manually below
              </p>
            </div>
          )}

          {scanning && (
            <div>
              <div id="reader" className="w-full rounded-lg bg-black min-h-[300px]"></div>
              <button
                onClick={stopCamera}
                className="btn-secondary w-full mt-4"
              >
                Stop Camera
              </button>
              <p className="text-sm text-gray-600 text-center mt-2">
                Position {scanMode === 'qr' ? 'QR code' : scanMode === 'barcode' ? 'barcode' : 'QR code or barcode'} in front of camera
              </p>
            </div>
          )}

          {/* Scan Mode Selection */}
          {!scanning && (
            <div className="mt-4 pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scan Mode
              </label>
              <select
                className="input-field"
                value={scanMode}
                onChange={(e) => setScanMode(e.target.value)}
              >
                <option value="both">QR Codes & Barcodes</option>
                <option value="qr">QR Codes Only</option>
                <option value="barcode">Barcodes Only</option>
              </select>
            </div>
          )}

          {/* Manual QR Code / Barcode Entry */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-3">Enter Code Manually</h3>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Enter QR code or barcode"
                className="input-field"
                value={manualQRCode}
                onChange={(e) => setManualQRCode(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => processBarcode(manualQRCode)}
                  disabled={loading || !manualQRCode.trim()}
                  className="btn-secondary flex-1 disabled:opacity-50"
                >
                  Lookup Barcode
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Lookup QR Code'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Item Details & Actions */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Item Information</h2>
          
          {!item && !loading && (
            <div className="text-center py-12 text-gray-500">
              <QrCodeIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p>Scan or enter a QR code to view item details</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
              <p className="text-gray-600 mt-3">Processing...</p>
            </div>
          )}

          {item && (
            <div className="space-y-4">
              {/* Item Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="badge badge-info">{item.category}</span>
                  <span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
                    {item.status}
                  </span>
                  <span className="badge badge-gray">
                    {item.availableQuantity}/{item.totalQuantity} available
                  </span>
                </div>
              </div>

              {/* Action Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Action
                </label>
                <select
                  className="input-field"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                >
                  <option value="view">View Details</option>
                  <option value="checkout">Checkout Item</option>
                  <option value="return">Return Item</option>
                  <option value="reserve">Reserve Item</option>
                </select>
              </div>

              {/* Checkout/Reserve Form */}
              {(action === 'checkout' || action === 'reserve') && (
                <div className="space-y-3 pt-3 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={item.availableQuantity}
                      className="input-field"
                      value={checkoutForm.quantity}
                      onChange={(e) =>
                        setCheckoutForm({ ...checkoutForm, quantity: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purpose *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g., Lab work, Event setup"
                      value={checkoutForm.purpose}
                      onChange={(e) =>
                        setCheckoutForm({ ...checkoutForm, purpose: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Return Date *
                    </label>
                    <input
                      type="date"
                      className="input-field"
                      value={checkoutForm.expectedReturnDate}
                      onChange={(e) =>
                        setCheckoutForm({ ...checkoutForm, expectedReturnDate: e.target.value })
                      }
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      className="input-field"
                      rows="2"
                      placeholder="Additional notes..."
                      value={checkoutForm.notes}
                      onChange={(e) =>
                        setCheckoutForm({ ...checkoutForm, notes: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleAction}
                disabled={loading}
                className={`w-full ${
                  action === 'return'
                    ? 'btn-success'
                    : action === 'view'
                    ? 'btn-secondary'
                    : 'btn-primary'
                } disabled:opacity-50`}
              >
                {loading
                  ? 'Processing...'
                  : action === 'checkout'
                  ? 'Checkout Item'
                  : action === 'return'
                  ? 'Return Item'
                  : action === 'reserve'
                  ? 'Reserve Item'
                  : 'View Full Details'}
              </button>

              {action === 'view' && (
                <button
                  onClick={() => navigate(`/items/${item._id || item.id}`)}
                  className="w-full btn-secondary"
                >
                  Go to Item Page
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;

