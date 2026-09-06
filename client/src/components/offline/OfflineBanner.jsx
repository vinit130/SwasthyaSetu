import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useOffline } from '../../context/OfflineContext';
import { useLanguage } from '../../context/LanguageContext';

export default function OfflineBanner() {
  const {
    isOnline,
    pendingCount,
    isSyncing,
    syncAllPending,
    syncStatusMessage,
    simulatedOffline,
    toggleSimulateOffline,
  } = useOffline();
  const { t } = useLanguage();

  if (isOnline && pendingCount === 0 && !syncStatusMessage) {
    return null;
  }

  return (
    <aside aria-label="Network status and synchronization" className="w-full transition-all">
      {!isOnline && (
        <div className="bg-amber-500 text-white px-4 py-2.5 text-xs md:text-sm font-medium flex items-center justify-between flex-wrap gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
            <span>
              <strong>{t('offlineMode')}:</strong> {t('offlineNotice')}
              {pendingCount > 0 && ` (${pendingCount} queued)`}
              {simulatedOffline && ' [Test Mode Active]'}
            </span>
          </div>
          <button
            onClick={toggleSimulateOffline}
            className="text-xs bg-amber-600 hover:bg-amber-700 px-2.5 py-1 rounded text-white underline"
          >
            {simulatedOffline ? 'Resume Online' : 'Simulate Offline'}
          </button>
        </div>
      )}

      {isOnline && pendingCount > 0 && (
        <div className="bg-teal-700 text-white px-4 py-2 text-xs md:text-sm flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>
              {pendingCount} record(s) saved locally awaiting sync to hospital server.
            </span>
          </div>
          <button
            onClick={syncAllPending}
            disabled={isSyncing}
            className="bg-white text-teal-800 hover:bg-teal-50 px-3 py-1 rounded-md text-xs font-semibold shadow-xs disabled:opacity-75"
          >
            {isSyncing ? 'Syncing...' : t('syncNow')}
          </button>
        </div>
      )}

      {syncStatusMessage && (
        <div
          className={`px-4 py-2 text-xs md:text-sm flex items-center gap-2 ${
            syncStatusMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{syncStatusMessage.text}</span>
        </div>
      )}
    </aside>
  );
}
