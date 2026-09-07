import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Plus, Calendar, ShieldCheck, X } from 'lucide-react';
import { documentAPI } from '../../services/api';
import DocumentUploadModal from './DocumentUploadModal';

export default function DocumentList({ patientId, patientName, canUpload = false, className = '' }) {
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
      alert('Failed to securely view document. Access denied or expired.');
    } finally {
      setViewLoading(false);
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'PRESCRIPTION':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700">Prescription</span>;
      case 'LAB_REPORT':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-100 text-teal-700">Lab Report</span>;
      case 'DISCHARGE_SUMMARY':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-700">Discharge Summary</span>;
      case 'SCAN_XRAY':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700">Scan / X-Ray</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700">Document</span>;
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Secure Medical Records & Reports
          </h4>
          <p className="text-xs text-slate-500">
            Encrypted prescriptions, diagnostic investigations, and discharge slips
          </p>
        </div>

        {canUpload && (
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Attach Document
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-slate-400">Loading medical records...</div>
      ) : documents.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          No medical documents attached yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {documents.map((doc) => (
            <div
              key={doc._id || doc.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h5 className="font-semibold text-xs text-slate-900 line-clamp-1">{doc.title}</h5>
                  {getTypeBadge(doc.documentType)}
                </div>

                <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-2">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {doc.facilityName && <span>• {doc.facilityName}</span>}
                </p>

                {doc.doctorNotes && (
                  <p className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-100 mb-2 italic">
                    "{doc.doctorNotes}"
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 truncate">
                  By {doc.uploadedBy?.name || 'Medical Staff'}
                </span>
                <button
                  type="button"
                  onClick={() => handleView(doc._id || doc.id)}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  View File
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
          onUploaded={(newDoc) => setDocuments((prev) => [newDoc, ...prev])}
        />
      )}

      {/* Safe Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="font-bold text-sm text-slate-900">{viewingDoc.title}</h4>
                <p className="text-xs text-slate-500">{viewingDoc.fileName} • {getTypeBadge(viewingDoc.documentType)}</p>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-100">
              {viewingDoc.fileData ? (
                viewingDoc.mimeType?.startsWith('image') || viewingDoc.fileData.startsWith('data:image') ? (
                  <img src={viewingDoc.fileData} alt={viewingDoc.title} className="max-w-full max-h-[70vh] object-contain rounded-lg shadow" />
                ) : (
                  <iframe
                    src={viewingDoc.fileData}
                    title={viewingDoc.title}
                    className="w-full h-[65vh] border-0 rounded-lg bg-white"
                  />
                )
              ) : (
                <div className="text-sm text-slate-500">Document data cannot be previewed directly.</div>
              )}
            </div>

            <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-end">
              <a
                href={viewingDoc.fileData}
                download={viewingDoc.fileName || 'document.pdf'}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Document
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
