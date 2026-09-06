import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { patientAPI, visitAPI, followupAPI } from '../services/api';

const OfflineContext = createContext();

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [pendingQueue, setPendingQueue] = useState(() => storage.getPendingQueue());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState(null);

  const effectiveOnline = isOnline && !simulatedOffline;

  // Refresh pending count
  const refreshQueue = () => {
    setPendingQueue(storage.getPendingQueue());
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // When coming back online, attempt sync if items in queue
  useEffect(() => {
    const queue = storage.getPendingQueue();
    if (effectiveOnline && queue.length > 0 && !isSyncing) {
      syncAllPending();
    }
  }, [effectiveOnline]);

  const saveOfflineAction = (action) => {
    const savedItem = storage.addToPendingQueue(action);
    refreshQueue();
    setSyncStatusMessage({
      type: 'warning',
      text: 'Saved locally — Pending Sync',
    });
    return savedItem;
  };

  const syncAllPending = async () => {
    if (!effectiveOnline) {
      setSyncStatusMessage({
        type: 'warning',
        text: 'Cannot sync while offline. Please reconnect first.',
      });
      return;
    }

    let currentQueue = storage.getPendingQueue();
    if (currentQueue.length === 0) return;

    setIsSyncing(true);
    let syncedCount = 0;
    const errors = [];

    for (let i = 0; i < currentQueue.length; i++) {
      const item = currentQueue[i];
      try {
        if (item.type === 'CREATE_PATIENT') {
          let realPatientId = null;
          try {
            const res = await patientAPI.createPatient(item.payload);
            if (res.data?.success && res.data?.data?._id) {
              realPatientId = res.data.data._id;
            }
          } catch (createErr) {
            // Handle duplicate conflict cleanly without stalling queue
            if (createErr.response?.status === 409) {
              if (createErr.response?.data?.existingPatient?._id) {
                realPatientId = createErr.response.data.existingPatient._id;
              } else {
                const res = await patientAPI.createPatient({ ...item.payload, allowDuplicate: true });
                if (res.data?.success && res.data?.data?._id) {
                  realPatientId = res.data.data._id;
                }
              }
            } else {
              throw createErr;
            }
          }

          // If this patient was created with a temporary offlineId, remap any queued visits for this patient
          if (item.offlineId && realPatientId) {
            currentQueue = currentQueue.map((qItem) => {
              if (qItem.type === 'CREATE_VISIT' && (qItem.patientId === item.offlineId || qItem.patientId === 'SS-PENDING-SYNC')) {
                return { ...qItem, patientId: realPatientId };
              }
              return qItem;
            });
            storage.setPendingQueue(currentQueue);

            // Also update any cached patient record
            try {
              const cached = storage.getCachedPatients() || [];
              const updatedCached = cached.map((cp) => (cp._id === item.offlineId ? { ...cp, _id: realPatientId } : cp));
              storage.setCachedPatients(updatedCached);
            } catch (ce) {
              console.error('Failed to update cached patients with real ID:', ce);
            }
          }

          storage.removeFromPendingQueue(item.id);
          currentQueue = storage.getPendingQueue();
          syncedCount++;
        } else if (item.type === 'CREATE_VISIT') {
          let patientIdToUse = item.patientId;
          // If patientId is still an unmapped offline ID, try matching with cached patients
          if (typeof patientIdToUse === 'string' && patientIdToUse.startsWith('offline_p_')) {
            const cached = storage.getCachedPatients() || [];
            const match = cached.find((cp) => cp._id !== item.patientId && !cp._id.startsWith('offline_p_'));
            if (match) {
              patientIdToUse = match._id;
            }
          }

          await visitAPI.createVisit(patientIdToUse, item.payload);
          storage.removeFromPendingQueue(item.id);
          currentQueue = storage.getPendingQueue();
          syncedCount++;
        } else if (item.type === 'UPDATE_FOLLOWUP') {
          await followupAPI.updateFollowup(item.followupId, item.payload);
          storage.removeFromPendingQueue(item.id);
          currentQueue = storage.getPendingQueue();
          syncedCount++;
        }
      } catch (err) {
        console.error('Failed to sync item:', item, err);
        errors.push(item);
      }
    }

    setIsSyncing(false);
    refreshQueue();

    if (syncedCount > 0) {
      setSyncStatusMessage({
        type: 'success',
        text: `Synced ${syncedCount} record(s) successfully with central database.`,
      });
      // Broadcast event so active views reload fresh data
      window.dispatchEvent(new CustomEvent('swasthyasetu:synced', { detail: { syncedCount } }));
      setTimeout(() => setSyncStatusMessage(null), 5000);
    } else if (errors.length > 0) {
      setSyncStatusMessage({
        type: 'error',
        text: 'Some records could not be synchronized automatically. Will retry.',
      });
    }
  };

  const toggleSimulateOffline = () => {
    setSimulatedOffline((prev) => !prev);
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline: effectiveOnline,
        realNetworkOnline: isOnline,
        simulatedOffline,
        toggleSimulateOffline,
        pendingQueue,
        pendingCount: pendingQueue.length,
        isSyncing,
        syncStatusMessage,
        setSyncStatusMessage,
        saveOfflineAction,
        syncAllPending,
        refreshQueue,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
