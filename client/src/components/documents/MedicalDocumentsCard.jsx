import React, { useState, useEffect } from 'react';
import { FileText, Camera, UploadCloud, Eye, Download, ShieldCheck, X, Calendar, Plus, RefreshCw } from 'lucide-react';
import { documentAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import DocumentUploadModal from './DocumentUploadModal';

export default function MedicalDocumentsCard({
  patientId,
  patientName = 'Patient',
  canUpload = true,
  className = '',
  onDocumentAdded,
}) {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadInitialMode, setUploadInitialMode] = useState('file'); // 'file' or 'camera'
  const [viewingDoc, setViewingDoc] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (patientId) {
      loadDocuments();
    }
  }, [patientId, refreshKey]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await documentAPI.getPatientDocuments(patientId);
      if (res.data.success) {
        setDocuments(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load patient documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpload = (mode = 'file') => {
    setUploadInitialMode(mode);
    setIsUploadOpen(true);
  };

  const handleView = async (docId) => {
    setViewLoading(true);
    try {
      const res = await documentAPI.viewDocument(docId);
      if (res.data.success) {
        setViewingDoc(res.data.data);
      }
    } catch (err) {
      alert('Failed to securely view document. Access denied or signed link expired.');
    } finally {
      setViewLoading(false);
    }
  };

  const formatDocDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getDocTargetUrl = (doc) => {
    if (!doc) return '';
    return doc.signedUrl || doc.fileData || '';
  };

  const getDocTypeDisplay = (type) => {
    const map = {
      PRESCRIPTION: 'Prescription',
      LAB_REPORT: 'Lab Report',
      BLOOD_TEST: 'Blood Report',
      IMAGING_REPORT: 'Imaging Report',
      CT_SCAN: 'CT Scan',
      X_RAY: 'X-Ray',
      ULTRASOUND: 'Ultrasound',
      DISCHARGE_SUMMARY: 'Discharge Summary',
      REFERRAL_SLIP: 'Referral Document',
      DIAGNOSTIC_SCAN: 'Diagnostic Scan',
      OTHER: 'Clinical Record',
    };
    return map[type] || 'Medical Document';
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-linear-to-r from-teal-50/40 via-white to-indigo-50/20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {t('medicalDocuments') || 'Medical Documents'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100/80 text-teal-800 border border-teal-200/60">
                {documents.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Patient: <strong className="text-slate-700">{patientName}</strong> • Private patient-isolated storage
            </p>
          </div>
        </div>

        {/* Action Buttons (Scan / Upload) */}
        {canUpload && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleOpenUpload('camera')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-300 bg-teal-50/80 hover:bg-teal-100 text-teal-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title="Use device camera to capture paper prescription or scan report"
            >
              <Camera className="w-3.5 h-3.5 text-teal-700" />
              <span>{t('scanDocument') || 'Scan Document'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenUpload('file')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title="Upload PDF report or image from device"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{t('uploadImagePdf') || 'Upload Image/PDF'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Body / Document List */}
      <div className="p-4 sm:p-5">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
            <span>Loading medical records...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 px-4 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No medical documents attached yet.</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {canUpload
                ? 'Scan with your device camera or attach PDF / JPG reports using the buttons above.'
                : 'Your doctor or healthcare provider has not attached any scans or reports to your chart yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-white">
            {documents.map((doc) => (
              <div
                key={doc._id || doc.id}
                className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {getDocTypeDisplay(doc.documentType)}
                      </span>
                      <span className="text-slate-400 text-xs">—</span>
                      <span className="text-xs text-slate-600 font-medium">
                        {formatDocDate(doc.createdAt)}
                      </span>
                      {doc.title && doc.title !== getDocTypeDisplay(doc.documentType) && (
                        <span className="text-[11px] text-slate-500 italic truncate">
                          ({doc.title})
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{doc.fileName}</span>
                      {doc.facilityName && <span>• {doc.facilityName}</span>}
                      {doc.storageProvider && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                          {doc.storageProvider}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Document View / Download Button */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleView(doc._id || doc.id)}
                    disabled={viewLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t('view') || 'View'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <DocumentUploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          patientId={patientId}
          patientName={patientName}
          initialCamera={uploadInitialMode === 'camera'}
          onUploaded={(newDoc) => {
            setDocuments((prev) => [newDoc, ...prev]);
            setRefreshKey((k) => k + 1);
            if (onDocumentAdded) onDocumentAdded(newDoc);
          }}
        />
      )}

      {/* Secure Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Viewer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  {viewingDoc.title || getDocTypeDisplay(viewingDoc.documentType)}
                </h4>
                <p className="text-xs text-slate-500">
                  {viewingDoc.fileName} • {formatDocDate(viewingDoc.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Viewer Body */}
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-100">
              {getDocTargetUrl(viewingDoc) ? (
                viewingDoc.mimeType?.startsWith('image') || getDocTargetUrl(viewingDoc).startsWith('data:image') ? (
                  <img
                    src={getDocTargetUrl(viewingDoc)}
                    alt={viewingDoc.title}
                    className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-sm"
                  />
                ) : (
                  <iframe
                    src={getDocTargetUrl(viewingDoc)}
                    title={viewingDoc.title}
                    className="w-full h-[65vh] border border-slate-200 rounded-lg bg-white"
                  />
                )
              ) : (
                <div className="text-sm text-slate-500 p-8 text-center">
                  Document content cannot be directly previewed in browser.
                </div>
              )}
            </div>

            {/* Viewer Footer */}
            <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {viewingDoc.signedUrl ? 'Protected Supabase Signed Access (5-min token)' : 'Encrypted Private Clinical Record'}
              </span>

              {getDocTargetUrl(viewingDoc) && (
                <a
                  href={getDocTargetUrl(viewingDoc)}
                  download={viewingDoc.fileName || 'document.pdf'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
