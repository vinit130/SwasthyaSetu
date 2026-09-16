import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Plus, Calendar, ShieldCheck, X, ExternalLink, Image, Activity } from 'lucide-react';
import { documentAPI } from '../../services/api';
import DocumentUploadModal from './DocumentUploadModal';

export default function DocumentList({ patientId, patientName, canUpload = false, className = '', onDocumentAdded }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    if (patientId) {
      loadDocuments();
    }
  }, [patientId]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await documentAPI.getPatientDocuments(patientId);
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load patient documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (docId) => {
    setViewLoading(true);
    try {
      const res = await documentAPI.viewDocument(docId);
      if (res.data.success) {
        setViewingDoc(res.data.data);
      }
    } catch (err) {
      alert('Failed to securely view document. Access denied or link expired.');
    } finally {
      setViewLoading(false);
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'PRESCRIPTION':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">Prescription</span>;
      case 'LAB_REPORT':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-100 text-teal-800 border border-teal-200">Lab Report</span>;
      case 'BLOOD_TEST':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200">Blood Test</span>;
      case 'IMAGING_REPORT':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">Imaging Report</span>;
      case 'CT_SCAN':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">CT Scan</span>;
      case 'X_RAY':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">X-Ray</span>;
      case 'ULTRASOUND':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Ultrasound</span>;
      case 'DISCHARGE_SUMMARY':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200">Discharge Summary</span>;
      case 'REFERRAL_SLIP':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 text-orange-800 border border-orange-200">Referral Slip</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">Clinical Record</span>;
    }
  };

  const getDocTargetUrl = (doc) => {
    if (!doc) return '';
    return doc.signedUrl || doc.fileData || '';
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Secure Medical Records & Reports</span>
            <span className="text-xs font-normal text-slate-500">({documents.length})</span>
          </h4>
          <p className="text-xs text-slate-500">
            Encrypted prescriptions, diagnostic investigations, and discharge slips with role-based access control.
          </p>
        </div>

        {canUpload && (
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-all self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">Loading patient medical records...</div>
      ) : documents.length === 0 ? (
        <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-600">No medical documents attached to this chart yet.</p>
          <p className="text-[11px] text-slate-400 mt-1">Prescriptions, lab findings, and imaging can be securely uploaded above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {documents.map((doc) => (
            <div
              key={doc._id || doc.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-teal-400 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h5 className="font-bold text-xs text-slate-900 line-clamp-1">{doc.title}</h5>
                  {getTypeBadge(doc.documentType)}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {doc.facilityName && <span>• {doc.facilityName}</span>}
                  {doc.storageProvider && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {doc.storageProvider}
                    </span>
                  )}
                </div>

                {doc.doctorNotes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2 italic">
                    "{doc.doctorNotes}"
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 truncate">
                  By {doc.uploadedBy?.name || 'Physician / Staff'}
                </span>
                <button
                  type="button"
                  onClick={() => handleView(doc._id || doc.id)}
                  disabled={viewLoading}
                  className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  <span>View Document</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <DocumentUploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          patientId={patientId}
          patientName={patientName}
          onUploaded={(newDoc) => {
            setDocuments((prev) => [newDoc, ...prev]);
            if (onDocumentAdded) onDocumentAdded(newDoc);
          }}
        />
      )}

      {/* Safe Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="font-bold text-sm text-slate-900">{viewingDoc.title}</h4>
                <p className="text-xs text-slate-500">
                  {viewingDoc.fileName} • {getTypeBadge(viewingDoc.documentType)}
                </p>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-100">
              {getDocTargetUrl(viewingDoc) ? (
                viewingDoc.mimeType?.startsWith('image') || getDocTargetUrl(viewingDoc).startsWith('data:image') ? (
                  <img
                    src={getDocTargetUrl(viewingDoc)}
                    alt={viewingDoc.title}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm"
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

            <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {viewingDoc.signedUrl ? 'Protected Supabase Signed Access' : 'Encrypted Local Access'}
              </span>

              {getDocTargetUrl(viewingDoc) && (
                <a
                  href={getDocTargetUrl(viewingDoc)}
                  download={viewingDoc.fileName || 'document.pdf'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
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
