/**
 * LocalStorage Offline Sync Queue Manager
 * Stores offline transactions and cached patient records
 */

const PENDING_QUEUE_KEY = 'swasthyasetu_pending_sync';
const CACHED_PATIENTS_KEY = 'swasthyasetu_cached_patients';

export const storage = {
  // Sync Queue Operations
  getPendingQueue() {
    try {
      const data = localStorage.getItem(PENDING_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading pending queue:', e);
      return [];
    }
  },

  addToPendingQueue(action) {
    try {
      const queue = this.getPendingQueue();
      const item = {
        id: 'sync_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        timestamp: new Date().toISOString(),
        ...action,
      };
      queue.push(item);
      localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
      return item;
    } catch (e) {
      console.error('Error saving to pending queue:', e);
      return null;
    }
  },

  removeFromPendingQueue(id) {
    try {
      const queue = this.getPendingQueue().filter((item) => item.id !== id);
      localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
      return queue;
    } catch (e) {
      console.error('Error removing from pending queue:', e);
      return [];
    }
  },

  setPendingQueue(queue) {
    try {
      localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('Error setting pending queue:', e);
    }
  },

  updatePendingQueueItem(id, updates) {
    try {
      const queue = this.getPendingQueue().map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
      return queue;
    } catch (e) {
      console.error('Error updating pending queue item:', e);
      return [];
    }
  },

  clearPendingQueue() {
    localStorage.removeItem(PENDING_QUEUE_KEY);
  },

  // Cache Operations
  setCachedPatients(patients) {
    try {
      localStorage.setItem(CACHED_PATIENTS_KEY, JSON.stringify(patients));
    } catch (e) {
      console.error('Error caching patients:', e);
    }
  },

  getCachedPatients() {
    try {
      const data = localStorage.getItem(CACHED_PATIENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
};
