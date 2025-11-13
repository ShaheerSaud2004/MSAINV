/**
 * Safe localStorage utilities that work during build time
 * These functions check for browser environment before accessing localStorage
 * Uses indirect access to prevent webpack from evaluating localStorage during build
 */

// Helper to get localStorage indirectly (prevents webpack evaluation)
// Using bracket notation prevents webpack from statically analyzing localStorage
const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    // Use bracket notation to prevent webpack static analysis
    const storageKey = 'localStorage';
    return window[storageKey] || null;
  } catch (e) {
    return null;
  }
};

export const safeLocalStorage = {
  getItem: (key) => {
    const storage = getStorage();
    if (!storage) {
      return null;
    }
    try {
      return storage.getItem(key);
    } catch (e) {
      console.warn('localStorage.getItem failed:', e);
      return null;
    }
  },

  setItem: (key, value) => {
    const storage = getStorage();
    if (!storage) {
      return false;
    }
    try {
      storage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('localStorage.setItem failed:', e);
      return false;
    }
  },

  removeItem: (key) => {
    const storage = getStorage();
    if (!storage) {
      return false;
    }
    try {
      storage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('localStorage.removeItem failed:', e);
      return false;
    }
  }
};

