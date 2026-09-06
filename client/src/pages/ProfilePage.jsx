import React, { useState } from 'react';
import { User, Shield, Phone, Mail, Globe, Lock, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../services/api';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { language, setLanguage, languages, t } = useLanguage();

  const [phone, setPhone] = useState(user?.phone || '');
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMsg, setProfileMsg] = useState(null);
  const [pwdMsg, setPwdMsg] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPwd, setLoadingPwd] = useState(false);

  const currentLangLabel = languages.find((l) => l.code === language)?.label || 'English';

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      setLoadingProfile(true);
      const res = await authAPI.updateProfile({ name, phone, language });
      if (res.data.success) {
        updateUser(res.data.user);
        setProfileMsg({ type: 'success', text: 'Profile information updated successfully.' });
      }
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    try {
      setLoadingPwd(true);
      const res = await authAPI.changePassword({ currentPassword, newPassword });
      if (res.data.success) {
        setPwdMsg({ type: 'success', text: 'Password changed successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPwdMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update password.',
      });
    } finally {
      setLoadingPwd(false);
    }
  };

  const getRoleBadge = () => {
    if (user?.role === 'ASHA') return t('ashaRole');
    if (user?.role === 'DOCTOR') return t('doctorRole');
    return t('patientRole');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{t('profile')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account credentials, regional language and contact details.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* User Card Summary */}
        <Card className="md:col-span-1 h-fit text-center p-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-2xl mx-auto mb-3 shadow-md shadow-teal-700/20">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <h2 className="font-bold text-slate-900 dark:text-white text-base">{user?.name}</h2>
          <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold">
            {getRoleBadge()}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">{user?.email}</p>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-left space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Role: <strong>{user?.role}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Language: <strong>{currentLangLabel}</strong></span>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{user?.phone}</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-200 dark:hover:border-red-800"
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              <span>{t('logout')}</span>
            </Button>
          </div>
        </Card>

        {/* Edit Details & Security */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Personal Details & Regional Language</span>
            </h3>

            {profileMsg && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  profileMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}
              >
                {profileMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label={t('fullName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label={t('phone')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('phonePlaceholder')}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Interface Language</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {languages.map((lang) => {
                    const isActive = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setLanguage(lang.code)}
                        className={`p-3 rounded-xl border text-center transition-all text-xs font-semibold ${
                          isActive
                            ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 shadow-xs ring-2 ring-teal-200 dark:ring-teal-800'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <span className="block font-bold text-sm mb-0.5">{lang.shortLabel}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{lang.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button type="submit" loading={loadingProfile} size="sm">
                <span>{t('save')}</span>
              </Button>
            </form>
          </Card>

          {/* Change Password */}
          <Card>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Change Security Password</span>
            </h3>

            {pwdMsg && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  pwdMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}
              >
                {pwdMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{pwdMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                />
              </div>

              <Button type="submit" loading={loadingPwd} size="sm" variant="secondary">
                <span>Update Password</span>
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
