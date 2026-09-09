import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('swasthyasetu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth expiration handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token only if not already on login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        localStorage.removeItem('swasthyasetu_token');
        localStorage.removeItem('swasthyasetu_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const patientAPI = {
  getPatients: (params) => api.get('/patients', { params }),
  getPatientById: (id) => api.get(`/patients/${id}`),
  createPatient: (data) => api.post('/patients', data),
  checkDuplicate: (data) => api.post('/patients/check-duplicate', data),
  updatePatient: (id, data) => api.put(`/patients/${id}`, data),
  assessDoctorRisk: (id, data) => api.post(`/patients/${id}/risk-assessment`, data),
  getPatientJourney: () => api.get('/patients/me/journey'),
};

export const visitAPI = {
  getVisits: (patientId) => api.get(`/patients/${patientId}/visits`),
  createVisit: (patientId, data) => api.post(`/patients/${patientId}/visits`, data),
};

export const riskAPI = {
  assessRisk: (data) => api.post('/risk/assess', data),
};

export const consultationAPI = {
  getConsultations: (patientId) => api.get(`/patients/${patientId}/consultations`),
  createConsultation: (patientId, data) => api.post(`/patients/${patientId}/consultations`, data),
};

export const referralAPI = {
  getReferrals: (params) => api.get('/referrals', { params }),
  getReferralById: (id) => api.get(`/referrals/${id}`),
  getReferralByToken: (token) => api.get(`/referrals/token/${token}`),
  createReferral: (data) => api.post('/referrals', data),
  updateStatus: (id, statusData) => api.put(`/referrals/${id}/status`, statusData),
};

export const followupAPI = {
  getFollowups: (params) => api.get('/followups', { params }),
  createFollowup: (data) => api.post('/followups', data),
  updateFollowup: (id, data) => api.put(`/followups/${id}`, data),
};

export const dashboardAPI = {
  getAshaDashboard: () => api.get('/dashboard/asha'),
  getDoctorDashboard: () => api.get('/dashboard/doctor'),
};

export const healthAdminAPI = {
  getOverview: () => api.get('/admin/overview'),
  getFacilities: (params) => api.get('/admin/facilities', { params }),
  getSurveillance: () => api.get('/admin/surveillance'),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};

export const hospitalAPI = {
  getReferrals: (params) => api.get('/hospital/referrals', { params }),
  getReferralByToken: (token) => api.get(`/hospital/referral-token/${token}`),
  emergencyLookup: (data) => api.post('/hospital/emergency-lookup', data),
  getEncounters: (params) => api.get('/hospital/encounters', { params }),
  createEncounter: (data) => api.post('/hospital/encounters', data),
  getBeds: (params) => api.get('/hospital/beds', { params }),
  updateBed: (id, data) => api.put(`/hospital/beds/${id}`, data),
};

export const inventoryAPI = {
  getInventory: (params) => api.get('/inventory', { params }),
  createMovement: (data) => api.post('/inventory/movements', data),
};

export const documentAPI = {
  getPatientDocuments: (patientId) => api.get(`/documents/patient/${patientId}`),
  uploadDocument: (data) => api.post('/documents', data),
  viewDocument: (id) => api.get(`/documents/${id}/view`),
};

export const facilityAPI = {
  getAllFacilities: (params) => api.get('/facilities', { params }),
  getNearbyFacilities: (params) => api.get('/facilities/nearby', { params }),
};

export default api;
