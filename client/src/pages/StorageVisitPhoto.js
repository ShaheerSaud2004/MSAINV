import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CameraIcon, PhotoIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const StorageVisitPhoto = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [visitType, setVisitType] = useState('pickup');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [captions, setCaptions] = useState([]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (photos.length + files.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }

    // Preview photos
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, {
          file,
          preview: reader.result,
          name: file.name
        }]);
        setCaptions(prev => [...prev, '']);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setCaptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleCaptionChange = (index, value) => {
    setCaptions(prev => {
      const newCaptions = [...prev];
      newCaptions[index] = value;
      return newCaptions;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (photos.length === 0) {
      toast.error('Please upload at least one photo');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      
      photos.forEach((photo) => {
        formData.append('photos', photo.file);
      });
      
      formData.append('visitType', visitType);
      formData.append('location', location);
      formData.append('notes', notes);
      
      captions.forEach(caption => {
        formData.append('caption', caption || 'Storage visit photo');
      });

      const token = localStorage.getItem('token');
      // Use relative URL in production, localhost in development
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const API_URL = isProduction
        ? '/api'
        : process.env.REACT_APP_API_URL || 'http://localhost:3022/api';

      await axios.post(
        `${API_URL}/storage-visits/${transactionId}/upload-photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success('Storage visit photos uploaded successfully!');
      navigate(`/transactions/${transactionId}`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload photos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card animate-fade-in">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Storage Visit Documentation</h1>
          <p className="text-gray-600">
            Upload photos of your storage visit for safety and tracking purposes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload Area */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Photos <span className="text-red-500">*</span>
              <span className="text-gray-500 font-normal ml-2">({photos.length}/5 photos)</span>
            </label>
            
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <CameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-1">Click to upload photos</p>
              <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB each (max 5 photos)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={photos.length >= 5}
              />
            </div>
          </div>

          {/* Photo Previews */}
          {photos.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Uploaded Photos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-white shadow-sm">
                    <img
                      src={photo.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                    <div className="p-3">
                      <input
                        type="text"
                        value={captions[index] || ''}
                        onChange={(e) => handleCaptionChange(index, e.target.value)}
                        placeholder="Add a caption (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visit Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Visit Type <span className="text-red-500">*</span>
            </label>
            <select
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
              className="input-field"
              required
            >
              <option value="pickup">Pickup (Getting Item)</option>
              <option value="return">Return (Returning Item)</option>
              <option value="inspection">Inspection</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {/* Storage Location */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Storage Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Building A, Room 101, Shelf 3"
              className="input-field"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information about this storage visit..."
              rows={4}
              className="input-field"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || photos.length === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Submit Photos
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <PhotoIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-blue-900 mb-2">Why do we need photos?</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Safety and security tracking</li>
              <li>Verify item condition at pickup/return</li>
              <li>Documentation for inventory management</li>
              <li>Accountability and transparency</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageVisitPhoto;

