import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  Camera,
  FileText,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Image,
  FileCheck,
  WifiOff,
} from 'lucide-react';
import { documentAPI } from '../../services/api';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
];

export const DOCUMENT_CATEGORIES = [
  { value: 'PRESCRIPTION', label: 'Prescription' },
  { value: 'LAB_REPORT', label: 'Lab Report' },
  { value: 'BLOOD_TEST', label: 'Blood Test' },
  { value: 'IMAGING_REPORT', label: 'Imaging Report' },
  { value: 'CT_SCAN', label: 'CT Scan' },
  { value: 'X_RAY', label: 'X-Ray' },
  { value: 'ULTRASOUND', label: 'Ultrasound' },
  { value: 'DISCHARGE_SUMMARY', label: 'Discharge Summary' },
  { value: 'REFERRAL_SLIP', label: 'Referral Document' },
  { value: 'OTHER', label: 'Other' },
];

export default function DocumentUploadModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  initialCamera = false,
  onUploaded,
}) {
  const getAutoTitle = (catVal) => {
    const cat = DOCUMENT_CATEGORIES.find((c) => c.value === catVal);
    const label = cat ? cat.label : 'Prescription';
    const date = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return `${label} — ${date}`;
  };

  // We maintain a list of documents to upload in a queue
  const [documentsQueue, setDocumentsQueue] = useState([
    {
      id: Date.now(),
      title: getAutoTitle('PRESCRIPTION'),
      documentType: 'PRESCRIPTION',
      fileData: '',
      fileName: '',
      mimeType: 'application/pdf',
      fileSize: 0,
      previewUrl: '',
      doctorNotes: '',
    }
  ]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cameraNotice, setCameraNotice] = useState('');
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOpen && initialCamera && cameraInputRef.current) {
      setTimeout(() => {
        try {
          cameraInputRef.current?.click();
        } catch {
          setCameraNotice('Camera access was not allowed. You can upload a photo or PDF instead.');
        }
      }, 150);
    }
  }, [isOpen, initialCamera]);

  if (!isOpen) return null;

  const currentDoc = documentsQueue[activeIndex] || documentsQueue[0];

  const updateCurrentDoc = (field, value) => {
    setDocumentsQueue(prev => prev.map((doc, idx) => idx === activeIndex ? { ...doc, [field]: value } : doc));
  };

  const handleCategorySelect = (catVal) => {
    const autoTitle = getAutoTitle(catVal);
    setDocumentsQueue(prev => prev.map((doc, idx) => {
      if (idx === activeIndex) {
        const shouldUpdate = !doc.title || DOCUMENT_CATEGORIES.some(c => doc.title.startsWith(c.label));
        return {
          ...doc,
          documentType: catVal,
          title: shouldUpdate ? autoTitle : doc.title,
        };
      }
      return doc;
    }));
  };

  const processFile = (file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit. Please choose a smaller file.');
      return;
    }

    const type = file.type || 'application/pdf';
    if (!ALLOWED_MIME_TYPES.includes(type) && !file.name.match(/\.(pdf|jpe?g|png|webp)$/i)) {
      setError('Unsupported file type. Only PDF, JPEG, PNG, and WebP documents are accepted.');
      return;
    }

    setError('');

    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result;
      setDocumentsQueue(prev => prev.map((doc, idx) => {
        if (idx === activeIndex) {
          return {
            ...doc,
            fileData: dataUri,
            fileName: file.name,
            mimeType: type,
            fileSize: file.size,
            previewUrl: type.startsWith('image') ? dataUri : '',
            title: doc.title || file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
          };
        }
        return doc;
      }));
    };
    reader.onerror = () => {
      setError('Failed to read file from disk.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
      e.target.value = '';
    }
  };

  const handleAddAnother = () => {
    const newDoc = {
      id: Date.now() + Math.random(),
      title: '',
      documentType: 'LAB_REPORT',
      fileData: '',
      fileName: '',
      mimeType: 'application/pdf',
      fileSize: 0,
      previewUrl: '',
      doctorNotes: '',
    };
    setDocumentsQueue(prev => [...prev, newDoc]);
    setActiveIndex(documentsQueue.length);
  };

  const handleRemoveDoc = (indexToRemove) => {
    if (documentsQueue.length === 1) {
      // Reset the single item
      setDocumentsQueue([{
        id: Date.now(),
        title: '',
        documentType: 'PRESCRIPTION',
        fileData: '',
        fileName: '',
        mimeType: 'application/pdf',
        fileSize: 0,
        previewUrl: '',
        doctorNotes: '',
      }]);
      return;
    }

    setDocumentsQueue(prev => prev.filter((_, idx) => idx !== indexToRemove));
    if (activeIndex >= indexToRemove && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleSubmitAll = async (e) => {
    e.preventDefault();

    if (isOffline) {
      setError('Document upload requires an internet connection. Your other offline data can continue to be saved.');
      return;
    }

    // Validate that all documents have title and fileData
    for (let i = 0; i < documentsQueue.length; i++) {
      const doc = documentsQueue[i];
      if (!doc.title.trim()) {
        setActiveIndex(i);
        setError(`Please provide a title for Document #${i + 1}`);
        return;
      }
      if (!doc.fileData) {
        setActiveIndex(i);
        setError(`Please attach or scan a file for Document #${i + 1} ("${doc.title}")`);
        return;
      }
    }

    setLoading(true);
    setError('');
    const uploadedDocs = [];

    try {
      for (const doc of documentsQueue) {
        const res = await documentAPI.uploadDocument({
          patientId,
          title: doc.title.trim(),
          documentType: doc.documentType,
          fileName: doc.fileName,
          fileData: doc.fileData,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
          doctorNotes: doc.doctorNotes.trim(),
        });
        if (res.data.success) {
          uploadedDocs.push(res.data.data);
        }
      }

      setSuccessMsg('Document uploaded successfully.');
      if (onUploaded) {
        uploadedDocs.forEach(d => onUploaded(d));
      }
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete document upload. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/60 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload Medical Records</h3>
              <p className="text-xs text-slate-500">
                Patient: <strong className="text-slate-800">{patientName}</strong> ({documentsQueue.length} {documentsQueue.length === 1 ? 'file' : 'files'} in queue)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Warning Banner */}
        {isOffline && (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2 text-amber-800 text-xs font-medium">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Document upload requires an internet connection. Your other offline data can continue to be saved.</span>
          </div>
        )}

        {/* Camera Notice Banner */}
        {cameraNotice && (
          <div className="bg-blue-50 border-b border-blue-200 px-5 py-2.5 flex items-center justify-between text-blue-800 text-xs font-medium">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{cameraNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setCameraNotice('')}
              className="text-blue-600 hover:text-blue-900 ml-2 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Multi-Document Queue Tabs */}
        <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          {documentsQueue.map((doc, idx) => (
            <div
              key={doc.id}
              onClick={() => { setActiveIndex(idx); setError(''); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border shrink-0 ${
                activeIndex === idx
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
              }`}
            >
              <span>#{idx + 1} {doc.title ? (doc.title.length > 16 ? doc.title.slice(0, 16) + '...' : doc.title) : 'New Document'}</span>
              {doc.fileData && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
              {documentsQueue.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRemoveDoc(idx); }}
                  className="ml-1 hover:text-red-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddAnother}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Another</span>
          </button>
        </div>

        {/* Active Document Form Body */}
        <form onSubmit={handleSubmitAll} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2 border border-emerald-200">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Category Chips Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Document Category (Click to choose & auto-fill title)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DOCUMENT_CATEGORIES.map((cat) => {
                const isSelected = currentDoc.documentType === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleCategorySelect(cat.value)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all border ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs font-semibold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50 hover:border-teal-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document Title *
              </label>
              <input
                type="text"
                placeholder={currentDoc.documentType === 'OTHER' ? 'Enter document title...' : 'e.g. Blood Test — 16 Sep 2026'}
                value={currentDoc.title}
                onChange={(e) => updateCurrentDoc('title', e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* Document Category Dropdown (secondary selector) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Category Dropdown
              </label>
              <select
                value={currentDoc.documentType}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {DOCUMENT_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload / Camera Action Box */}
          <div className="p-4 border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-xl bg-slate-50/60 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {currentDoc.fileName ? `Selected: ${currentDoc.fileName}` : 'Attach Document or Scan'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Accepts PDF, JPEG, PNG, WebP (Max 10MB per file)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 text-xs font-semibold text-teal-700 bg-white hover:bg-teal-50 border border-teal-300 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <UploadCloud className="w-4 h-4 text-teal-600" />
                  <span>Upload Image / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      if (!cameraInputRef.current) {
                        setCameraNotice('Camera access was not allowed. You can upload a photo or PDF instead.');
                        return;
                      }
                      cameraInputRef.current.click();
                    } catch {
                      setCameraNotice('Camera access was not allowed. You can upload a photo or PDF instead.');
                    }
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-teal-700 bg-white hover:bg-teal-50 border border-teal-300 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Camera className="w-4 h-4 text-teal-600" />
                  <span>Scan with Camera</span>
                </button>
              </div>
            </div>

            {/* Hidden File and Camera Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Live Preview Container */}
            {currentDoc.fileData && (
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-3">
                {currentDoc.previewUrl ? (
                  <img
                    src={currentDoc.previewUrl}
                    alt="Document Preview"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-300 shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 bg-red-50 text-red-600 rounded-lg border border-red-200 flex flex-col items-center justify-center">
                    <FileText className="w-6 h-6" />
                    <span className="text-[9px] font-bold mt-0.5 uppercase">PDF</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{currentDoc.fileName}</p>
                  <p className="text-[10px] text-slate-500">
                    {(currentDoc.fileSize / 1024).toFixed(1)} KB • Ready for encrypted upload
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateCurrentDoc('fileData', '')}
                  className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Doctor Clinical Notes / Findings */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Findings / Doctor Remarks (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Findings show patchy infiltrates in right lung; review after 5 days of oral antibiotics..."
              value={currentDoc.doctorNotes}
              onChange={(e) => updateCurrentDoc('doctorNotes', e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleAddAnother}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Attach Another Document</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || isOffline}
                className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
              >
                {loading ? 'Uploading Securely...' : isOffline ? 'Offline — Connect to Upload' : `Upload ${documentsQueue.length} ${documentsQueue.length === 1 ? 'Record' : 'Records'}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
