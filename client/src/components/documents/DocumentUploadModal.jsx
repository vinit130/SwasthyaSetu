import React, { useState } from 'react';
import { X, UploadCloud, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { documentAPI } from '../../services/api';

export default function DocumentUploadModal({ isOpen, onClose, patientId, patientName, onUploaded }) {
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('PRESCRIPTION');
  const [fileData, setFileData] = useState('');
  const [fileName, setFileName] = useState('');
  const [mimeType, setMimeType] = useState('application/pdf');
  const [fileSize, setFileSize] = useState(0);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setFileName(file.name);
    setMimeType(file.type || 'application/pdf');
    setFileSize(file.size);
    setError('');

    const reader = new FileReader();
    reader.onload = () => {
      setFileData(reader.result);
    };
    reader.onerror = () => {
      setError('Failed to read file from disk.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a document title.');
      return;
    }
    if (!fileData) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await documentAPI.uploadDocument({
        patientId,
        title: title.trim(),
        documentType,
        fileName,
        fileData,
        mimeType,
        fileSize,
        doctorNotes: doctorNotes.trim(),
      });

      if (res.data.success) {
        if (onUploaded) onUploaded(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Upload Medical Record</h3>
            <p className="text-xs text-slate-500">For Patient: <strong className="text-slate-800">{patientName}</strong></p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Chest X-Ray Report, Discharge Slip, Prescription"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document Category *
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="PRESCRIPTION">Prescription Slip</option>
                <option value="LAB_REPORT">Diagnostic / Lab Report</option>
                <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                <option value="REFERRAL_SLIP">Referral Slip</option>
                <option value="SCAN_XRAY">Scan / X-Ray</option>
                <option value="OTHER">Other Clinical Record</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                File Attachment *
              </label>
              <label className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs border border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-lg cursor-pointer transition-colors text-slate-600">
                <UploadCloud className="w-4 h-4 text-emerald-600" />
                <span className="truncate">{fileName || 'Choose PDF / Image'}</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Notes / Findings
            </label>
            <textarea
              rows={3}
              placeholder="Doctor clinical comments or diagnostic findings..."
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              {loading ? 'Uploading...' : 'Save Document Securely'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
