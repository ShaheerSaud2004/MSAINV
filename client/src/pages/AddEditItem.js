import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const AddEditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    category: '',
    subCategory: '',
    totalQuantity: 0,
    unit: 'piece',
    condition: 'good',
    status: 'active',
    isCheckoutable: true,
    requiresApproval: false,
    location: {
      building: '',
      room: '',
      shelf: '',
      bin: ''
    },
    cost: {
      purchasePrice: 0,
      currentValue: 0,
      currency: 'USD'
    },
    notes: ''
  });

  useEffect(() => {
    if (isEdit) {
      fetchItem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await itemsAPI.getById(id);
      if (response.data.success) {
        setFormData(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load item');
      navigate('/items');
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
          [child]: type === 'number' ? parseFloat(value) : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await itemsAPI.update(id, formData);
        toast.success('Item updated successfully');
      } else {
        await itemsAPI.create(formData);
        toast.success('Item created successfully');
      }
      navigate('/items');
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} item`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit Item' : 'Add New Item'}
        </h1>
        <button onClick={() => navigate('/items')} className="btn-secondary">
          <ArrowLeftIcon className="w-5 h-5 inline mr-2" />
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                required
                className="input-field"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                rows="3"
                className="input-field"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                name="sku"
                className="input-field"
                value={formData.sku}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
              <input
                type="text"
                name="barcode"
                className="input-field"
                value={formData.barcode}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <input
                type="text"
                name="category"
                required
                className="input-field"
                value={formData.category}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
              <input
                type="text"
                name="subCategory"
                className="input-field"
                value={formData.subCategory}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Inventory</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity *</label>
              <input
                type="number"
                name="totalQuantity"
                required
                min="0"
                className="input-field"
                value={formData.totalQuantity}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input
                type="text"
                name="unit"
                className="input-field"
                value={formData.unit}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select name="condition" className="input-field" value={formData.condition} onChange={handleChange}>
                <option value="new">New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" className="input-field" value={formData.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            <div className="flex items-center space-x-6 pt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isCheckoutable"
                  className="mr-2"
                  checked={formData.isCheckoutable}
                  onChange={handleChange}
                />
                <span className="text-sm font-medium">Checkoutable</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="requiresApproval"
                  className="mr-2"
                  checked={formData.requiresApproval}
                  onChange={handleChange}
                />
                <span className="text-sm font-medium">Requires Approval</span>
              </label>
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
              <input
                type="text"
                name="location.building"
                className="input-field"
                value={formData.location.building}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <input
                type="text"
                name="location.room"
                className="input-field"
                value={formData.location.room}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shelf</label>
              <input
                type="text"
                name="location.shelf"
                className="input-field"
                value={formData.location.shelf}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bin</label>
              <input
                type="text"
                name="location.bin"
                className="input-field"
                value={formData.location.bin}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            rows="3"
            className="input-field"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/items')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Item' : 'Create Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditItem;

