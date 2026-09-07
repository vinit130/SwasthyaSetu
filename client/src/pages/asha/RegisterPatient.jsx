import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Activity,
  User,
  Phone,
  MapPin,
  HeartHandshake,
  Copy,
  Check,
} from 'lucide-react';
import { patientAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useOffline } from '../../context/OfflineContext';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { validatePhone } from '../../utils/formatters';
import { validateIndianPhone } from '../../utils/validators';
import VoiceInputButton from '../../components/common/VoiceInputButton';
import { storage } from '../../utils/storage';

export default function RegisterPatient() {
  const { t } = useLanguage();
  const { isOnline, saveOfflineAction } = useOffline();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    dateOfBirth: '',
    gender: 'Male',
    phone: '',
    address: '',
    village: 'Shirur',
    district: 'Pune',
    state: 'Maharashtra',
    emergencyContact: '',
    bloodGroup: 'Unknown',
    allergies: '',
    existingConditions: '',
  });

  const [errors, setErrors] = useState({});
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdPatient, setCreatedPatient] = useState(null);
  const [userCredentials, setUserCredentials] = useState(null);
  const [copied, setCopied] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Check duplicate when name and phone are filled
  const handleCheckDuplicate = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) return;
    try {
      const res = await patientAPI.checkDuplicate({
        name: formData.name,
        phone: formData.phone,
        age: formData.age,
      });
      if (res.data.isDuplicate) {
        setDuplicateWarning({
          message: res.data.message,
          existingPatient: res.data.existingPatient,
        });
      } else {
        setDuplicateWarning(null);
      }
    } catch (e) {
      // Ignore network errors in duplicate check
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Patient full name is required';
    if (!formData.age || Number(formData.age) < 0 || Number(formData.age) > 130) {
      errs.age = 'Please enter a valid age (0-130)';
    }
    if (!formData.phone || !validateIndianPhone(formData.phone)) {
      errs.phone = 'Valid 10-digit Indian mobile number required (starting with 6, 7, 8, or 9)';
    }
    if (!formData.village.trim()) errs.village = 'Village name is required';
    if (!formData.district.trim()) errs.district = 'District is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleForceCreateNew = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        age: Number(formData.age),
        allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
        existingConditions: formData.existingConditions
          ? formData.existingConditions.split(',').map((s) => s.trim())
          : [],
        allowDuplicate: true,
      };
      const res = await patientAPI.createPatient(payload);
      if (res.data.success) {
        setCreatedPatient(res.data.data);
        if (res.data.userCredentials) {
          setUserCredentials(res.data.userCredentials);
        }
        setDuplicateWarning(null);
      }
    } catch (err) {
      setErrors({
        form: err.response?.data?.message || 'Failed to register patient. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setDuplicateWarning(null);

    const payload = {
      ...formData,
      age: Number(formData.age),
      allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
      existingConditions: formData.existingConditions
        ? formData.existingConditions.split(',').map((s) => s.trim())
        : [],
    };

    if (!isOnline) {
      // Handle offline registration
      const offlineId = 'offline_p_' + Date.now();
      const mockPatient = {
        _id: offlineId,
        patientId: 'SS-PENDING-SYNC',
        ...payload,
        createdAt: new Date().toISOString(),
      };
      saveOfflineAction({
        type: 'CREATE_PATIENT',
        offlineId,
        payload,
      });

      // Update cached patients so newly registered patient appears instantly offline
      try {
        const cached = storage.getCachedPatients() || [];
        storage.setCachedPatients([mockPatient, ...cached.filter((p) => p._id !== offlineId)]);
      } catch (e) {
        console.error('Failed to update cached patients:', e);
      }

      setCreatedPatient(mockPatient);
      setOfflineNotice(true);
      setSubmitting(false);
      return;
    }

    try {
      const res = await patientAPI.createPatient(payload);
      if (res.data.success) {
        setCreatedPatient(res.data.data);
        if (res.data.userCredentials) {
          setUserCredentials(res.data.userCredentials);
        }
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setDuplicateWarning({
          message: err.response.data.message,
          existingPatient: err.response.data.existingPatient,
        });
      } else {
        setErrors({
          form: err.response?.data?.message || 'Failed to register patient. Please try again.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Success view
  if (createdPatient) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <Card className="p-6 sm:p-8 text-center bg-white border-slate-200 shadow-sm">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">{t('accountCreatedTitle')}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('accountCreatedSubtitle')}
          </p>

          <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs sm:text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">{t('fullName')}:</span>
              <span className="font-semibold text-slate-800">{createdPatient.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('patientIdLabel')}:</span>
              <span className="font-mono font-bold text-teal-700">{createdPatient.patientId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('village')}:</span>
              <span className="text-slate-700">{createdPatient.village}, {createdPatient.district}</span>
            </div>
            {offlineNotice && (
              <div className="mt-2 pt-2 border-t border-slate-200 text-amber-700 font-medium text-xs">
                {t('pendingSync')} — Record saved locally. Will sync automatically once connected.
              </div>
            )}
          </div>

          {/* Patient Credentials Card for ASHA Handover */}
          {userCredentials && (
            <div className="my-4 p-4.5 bg-gradient-to-br from-teal-50/90 to-emerald-50/70 border border-teal-200 rounded-2xl text-left shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-700" />
                  <span>{t('patientRole')}</span>
                </span>
                <span className="text-[10px] bg-teal-200/90 text-teal-950 px-2.5 py-0.5 rounded-full font-bold">
                  Handover
                </span>
              </div>
              <p className="text-xs text-teal-800 mb-3">
                {t('accountCreatedSubtitle')}
              </p>
              <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-teal-100 text-xs shadow-2xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('usernameLabel')}</span>
                  <span className="font-mono font-bold text-slate-900 text-sm select-all">{userCredentials.username}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('tempPasswordLabel')}</span>
                  <span className="font-mono font-bold text-teal-700 text-sm select-all">{userCredentials.temporaryPassword}</span>
                </div>
              </div>
              <div className="mt-2.5 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `SwasthyaSetu Patient Login\n${t('usernameLabel')}: ${userCredentials.username}\n${t('tempPasswordLabel')}: ${userCredentials.temporaryPassword}`
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 3000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-900 bg-white border border-teal-200 hover:bg-teal-50 transition-colors shadow-2xs cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">{t('copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-teal-700" />
                      <span>{t('copyAll')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-2">
            <Link to={`/asha/patients/${createdPatient._id}/symptoms`} className="w-full sm:w-auto">
              <Button size="md" className="w-full">
                <Activity className="w-4 h-4 mr-1.5" />
                <span>{t('addSymptomsVitals')}</span>
              </Button>
            </Link>

            <Link to={`/asha/patients/${createdPatient._id}`} className="w-full sm:w-auto">
              <Button variant="secondary" size="md" className="w-full">
                <span>{t('viewProfile')}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t('registerNewPatient')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t('registrationSubtitle')}
        </p>
      </div>

      {duplicateWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <strong className="font-semibold block mb-0.5">{t('duplicateWarningTitle')}</strong>
              <p>{duplicateWarning.message || t('duplicateWarningMessage')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end pt-2 border-t border-amber-200">
            {duplicateWarning.existingPatient && (
              <Link to={`/asha/patients/${duplicateWarning.existingPatient._id}`}>
                <Button size="sm" variant="secondary" type="button">
                  {t('viewExistingPatient')}
                </Button>
              </Link>
            )}
            <Button
              size="sm"
              variant="primary"
              type="button"
              onClick={handleForceCreateNew}
              loading={submitting}
            >
              {t('createNewPatient')}
            </Button>
          </div>
        </div>
      )}

      {errors.form && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Details */}
        <Card className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-teal-600" />
            <span>{t('sectionPersonalInfo')}</span>
          </h2>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">{t('fullName')} *</label>
              <VoiceInputButton onTranscript={(txt) => setFormData((prev) => ({ ...prev, name: prev.name ? `${prev.name} ${txt}` : txt }))} />
            </div>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleCheckDuplicate}
              placeholder={t('fullNamePlaceholder')}
              error={errors.name}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('age')}
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              onBlur={handleCheckDuplicate}
              placeholder="e.g. 35"
              error={errors.age}
              required
            />

            <Select
              label={t('gender')}
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={[
                { value: 'Male', label: t('male') },
                { value: 'Female', label: t('female') },
                { value: 'Other', label: t('other') },
              ]}
              required
            />
          </div>

          <Input
            label={t('phone')}
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleCheckDuplicate}
            placeholder="10-digit mobile number"
            error={errors.phone}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('village')}
              name="village"
              value={formData.village}
              onChange={handleChange}
              placeholder="e.g. Shirur"
              error={errors.village}
              required
            />

            <Input
              label={t('district')}
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="e.g. Pune"
              error={errors.district}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">{t('address')}</label>
              <VoiceInputButton onTranscript={(txt) => setFormData((prev) => ({ ...prev, address: prev.address ? `${prev.address} ${txt}` : txt }))} />
            </div>
            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="House / Street / Landmark"
            />
          </div>
        </Card>

        {/* Section 2: Clinical & Emergency History (Optional) */}
        <Card className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <HeartHandshake className="w-4 h-4 text-teal-600" />
            <span>{t('sectionMedicalInfo')}</span>
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('bloodGroup')}
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              options={['Unknown', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
            />

            <Input
              label={t('emergencyContact')}
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              placeholder="Relative phone number"
            />
          </div>

          <Input
            label={t('knownAllergies')}
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            placeholder="e.g. Penicillin, Sulfa drugs (comma separated)"
            helperText="Separate multiple allergies with commas"
          />

          <Input
            label={t('existingConditions')}
            name="existingConditions"
            value={formData.existingConditions}
            onChange={handleChange}
            placeholder="e.g. Hypertension, Diabetes, Asthma"
            helperText="Pre-existing diagnosed conditions"
          />
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={() => navigate('/asha/patients')}
            disabled={submitting}
          >
            {t('cancel')}
          </Button>

          <Button type="submit" loading={submitting} size="lg">
            <UserPlus className="w-4 h-4 mr-2" />
            <span>{t('createPatientBtn')}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
