import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  Camera,
  FileText,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Trash2,
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
  { value: 'IMAGING', label: 'Imaging (X-Ray / CT / Ultrasound)' },
  { value: 'DISCHARGE_SUMMARY', label: 'Discharge Summary' },
  { value: 'REFERRAL', label: 'Referral Document' },
  { value: 'OTHER', label: 'Other / General Document' },
];

// Helper: compress large smartphone camera photos (> 3MB) to ~800KB web-friendly JPEG in memory
const compressImageIfNeeded = async (file) => {
  if (!file.type || !file.type.startsWith('image/')) return file;
  if (file.size <= 3 * 1024 * 1024) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const maxDim = 2048;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        'image/jpeg',
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
};

export default function DocumentUploadModal({
  isOpen,
  onClose,
  patientId,
  patientName = 'Patient',
  initialCamera = false,
  onUploaded,
}) {
  const [category, setCategory] = useState('PRESCRIPTION');
  const [title, setTitle] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');

  // File state
  const [rawFile, setRawFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [isImage, setIsImage] = useState(false);

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

  // Cleanup object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Initial camera trigger if launched via "Scan with Camera"
  useEffect(() => {
    if (isOpen && initialCamera && cameraInputRef.current) {
      const timer = setTimeout(() => {
        try {
          cameraInputRef.current?.click();
        } catch (err) {
          setCameraNotice('Camera access was not granted. You can attach a photo or PDF file below.');
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialCamera]);

  if (!isOpen) return null;

  const handleFileSelection = async (file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum allowed size is 10 MB.');
      return;
    }

    const type = file.type || '';
    const isImg = type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name);
    const isPdf = type === 'application/pdf' || /\.pdf$/i.test(file.name);

    if (!isImg && !isPdf) {
      setError('Unsupported file format. Please attach a PDF or image (JPEG, PNG, WebP).');
      return;
    }

    setError('');
    setLoading(true);

    try {
      let finalFile = file;
      if (isImg) {
        finalFile = await compressImageIfNeeded(file);
      }

      setRawFile(finalFile);
      setFileName(finalFile.name || (isImg ? 'camera_scan.jpg' : 'document.pdf'));
      setFileSize(finalFile.size);
      setIsImage(isImg);

      // Create preview
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      if (isImg) {
        const url = URL.createObjectURL(finalFile);
        setPreviewUrl(url);
      } else {
        setPreviewUrl('');
      }
    } catch (err) {
      console.error('File preparation error:', err);
      setError('Failed to process the chosen file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFile = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setRawFile(null);
    setPreviewUrl('');
    setFileName('');
    setFileSize(0);
    setIsImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleUploadSubmit = async () => {
    if (isOffline) {
      setError('Document upload requires an internet connection. Your other offline data can continue to be saved.');
      return;
    }

    // ONLY FILE IS REQUIRED
    if (!rawFile) {
      setError('Please select or capture a file before uploading.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Build FormData for multipart streaming
      const formData = new FormData();
      formData.append('file', rawFile);
      if (patientId) {
        formData.append('patientId', patientId);
      }
      if (title.trim()) {
        formData.append('title', title.trim());
      }
      if (category) {
        formData.append('documentType', category);
      }
      if (doctorNotes.trim()) {
        formData.append('notes', doctorNotes.trim());
      }

      const res = await documentAPI.uploadDocument(formData);
      if (res.data.success) {
        setSuccessMsg('Document uploaded successfully.');
        if (onUploaded) {
          onUploaded(res.data.data);
        }
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setError(res.data.message || 'Document upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Document upload error:', err);
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 413
          ? 'File is too large. Maximum allowed size is 10 MB.'
          : 'Document upload failed. Please try again.');
      setError(msg);
      // Keep file in state so doctor does not have to re-scan or re-select
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/70 via-white to-emerald-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Attach Medical Document</h3>
              <p className="text-xs text-slate-500">
                Patient: <strong className="text-slate-800">{patientName}</strong> • Private clinical record
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Warning Banner */}
        {isOffline && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-2 text-amber-800 text-xs font-medium">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Document upload requires an internet connection. Your other offline data can continue to be saved.</span>
          </div>
        )}

        {/* Camera Notice Banner */}
        {cameraNotice && (
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center justify-between text-blue-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{cameraNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setCameraNotice('')}
              className="text-blue-600 hover:text-blue-900 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-start gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Upload Notice</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2 border border-emerald-200">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {/* PRIMARY WORKFLOW: Attach Document / Scan */}
          {!rawFile ? (
            <div className="p-6 border-2 border-dashed border-teal-200 hover:border-teal-400 rounded-2xl bg-teal-50/30 transition-colors text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100/70 text-teal-700 flex items-center justify-center mx-auto shadow-2xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Attach Document to Patient Record
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supports prescriptions, lab reports, X-rays, scans, and PDFs (Max 10 MB)
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {/* Primary Camera Button */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan with Camera</span>
                </button>

                {/* Primary File Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-teal-800 bg-white hover:bg-teal-50 border border-teal-300 rounded-xl flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-teal-600" />
                  <span>Upload Image / PDF</span>
                </button>
              </div>
            </div>
          ) : (
            /* PREVIEW CARD: Selected / Captured File */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-teal-200 bg-teal-50/40 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {isImage && previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Captured Preview"
                        className="w-16 h-16 object-cover rounded-xl border border-slate-300 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-red-50 text-red-600 rounded-xl border border-red-200 flex flex-col items-center justify-center shrink-0">
                        <FileText className="w-6 h-6" />
                        <span className="text-[9px] font-bold uppercase mt-0.5">PDF</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {fileName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                          Ready
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Size: <strong className="text-slate-700">{formatSize(fileSize)}</strong> • {isImage ? 'Image' : 'PDF Document'}
                      </p>
                      <p className="text-[10px] text-teal-700 font-medium mt-0.5 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-teal-600" />
                        <span>Ready to attach to {patientName}'s record</span>
                      </p>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Retake / Change Actions */}
                <div className="pt-2 border-t border-teal-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Need to change or retake?</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-2.5 py-1 text-xs font-medium text-teal-700 hover:bg-teal-100/60 rounded-lg border border-teal-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 text-teal-600" />
                      <span>Retake</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Choose Another</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* OPTIONAL ORGANIZATION (Document Type, Title, Notes) */}
              <div className="space-y-3 pt-1">
                {/* Document Type Dropdown (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Document Type (Optional)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 bg-white text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Document Title (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Document Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={fileName ? fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') : 'e.g. Prescription — 16 Sep 2026 (Optional)'}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 bg-white text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    If left blank, the original filename will be used automatically.
                  </span>
                </div>

                {/* Notes / Remarks (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Notes / Remarks (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Add a note if needed (Optional)"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 bg-white text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hidden Input Elements */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelection(f);
              e.target.value = '';
            }}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,image/*,application/pdf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelection(f);
              e.target.value = '';
            }}
            className="hidden"
          />
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleUploadSubmit}
            disabled={loading || isOffline || !rawFile}
            className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading Document...</span>
              </>
            ) : isOffline ? (
              'Offline — Connect to Upload'
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload Document</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
