import React, { useState } from 'react';
import { guestRequestsAPI } from '../services/api';

const TEAMS = [
  { key: 'IAW', value: 'IAW' },
  { key: 'Hope', value: 'Hope' },
  { key: 'Submissions', value: 'Submissions' },
  { key: 'EPT', value: 'EPT' },
  { key: 'Ladders', value: 'Ladders' },
  { key: 'R2R', value: 'R2R' },
  { key: 'Brothers Social', value: 'Brothers Social' },
  { key: 'Sisters Social', value: 'Sisters Social' },
];

const GuestRequest = () => {
  const [form, setForm] = useState({
    team: '',
    itemName: '',
    name: '',
    email: '',
    purpose: '',
    notes: '',
    itemPhoto: '',
    departurePhoto: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

  const onFileChange = async (e) => {
    const { name, files } = e.target;
    if (!files || !files[0]) return;
    const base64 = await toBase64(files[0]);
    setForm({ ...form, [name]: base64 });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await guestRequestsAPI.submit({
        team: form.team,
        itemName: form.itemName,
        name: form.name,
        email: form.email,
        purpose: form.purpose,
        notes: form.notes,
        itemPhoto: form.itemPhoto,
        departurePhoto: form.departurePhoto
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Request submitted</h1>
          <p className="text-gray-600">Your team will review your request soon. Watch your email for updates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Guest Item Request</h1>
        <p className="text-sm text-gray-600 mb-6">
          Your request will not be approved until you attach two photos: a clear photo of the item you are taking and a photo when you depart with it.
        </p>
        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
            <select
              name="team"
              value={form.team}
              onChange={onChange}
              required
              className="input-field"
            >
              <option value="" disabled>Select team</option>
              {TEAMS.map(t => (
                <option key={t.value} value={t.value}>{t.key}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item needed</label>
            <input
              name="itemName"
              value={form.itemName}
              onChange={onChange}
              placeholder="e.g., 10x extension cords"
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
            <input name="name" value={form.name} onChange={onChange} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={onChange} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <textarea name="purpose" value={form.purpose} onChange={onChange} required className="input-field" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo of the item (required)</label>
            <input name="itemPhoto" type="file" accept="image/*" onChange={onFileChange} required className="input-field" />
            {form.itemPhoto && (
              <img src={form.itemPhoto} alt="Item preview" className="mt-2 h-24 w-auto rounded border" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departure photo (required)</label>
            <input name="departurePhoto" type="file" accept="image/*" onChange={onFileChange} required className="input-field" />
            {form.departurePhoto && (
              <img src={form.departurePhoto} alt="Departure preview" className="mt-2 h-24 w-auto rounded border" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea name="notes" value={form.notes} onChange={onChange} className="input-field" rows={2} />
          </div>
          <button type="submit" disabled={submitting} className="w-full btn-primary disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit request'}
          </button>
          <p className="text-xs text-gray-500 text-center">No login needed. Include both required photos so your team can approve the request.</p>
        </form>
      </div>
    </div>
  );
};

export default GuestRequest;


