/**
 * Helper formatters and input validators for SwasthyaSetu
 */

export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

export function validateVitals(vitals) {
  const errors = {};

  if (vitals.temperature !== '' && vitals.temperature !== undefined) {
    const temp = Number(vitals.temperature);
    if (isNaN(temp) || temp < 32 || temp > 43) {
      errors.temperature = 'Temperature must be between 32°C and 43°C';
    }
  }

  if (vitals.bloodPressure?.systolic !== '' && vitals.bloodPressure?.systolic !== undefined) {
    const sys = Number(vitals.bloodPressure.systolic);
    if (isNaN(sys) || sys < 50 || sys > 260) {
      errors.systolic = 'Systolic BP must be between 50 and 260 mmHg';
    }
  }

  if (vitals.bloodPressure?.diastolic !== '' && vitals.bloodPressure?.diastolic !== undefined) {
    const dia = Number(vitals.bloodPressure.diastolic);
    if (isNaN(dia) || dia < 30 || dia > 180) {
      errors.diastolic = 'Diastolic BP must be between 30 and 180 mmHg';
    }
  }

  if (vitals.heartRate !== '' && vitals.heartRate !== undefined) {
    const hr = Number(vitals.heartRate);
    if (isNaN(hr) || hr < 30 || hr > 220) {
      errors.heartRate = 'Heart rate must be between 30 and 220 bpm';
    }
  }

  if (vitals.spO2 !== '' && vitals.spO2 !== undefined) {
    const spo2 = Number(vitals.spO2);
    if (isNaN(spo2) || spo2 < 50 || spo2 > 100) {
      errors.spO2 = 'SpO2 must be between 50% and 100%';
    }
  }

  if (vitals.respiratoryRate !== '' && vitals.respiratoryRate !== undefined) {
    const rr = Number(vitals.respiratoryRate);
    if (isNaN(rr) || rr < 6 || rr > 60) {
      errors.respiratoryRate = 'Respiratory rate must be between 6 and 60 breaths/min';
    }
  }

  return errors;
}

export function validatePhone(phone) {
  if (!phone) return 'Phone number is required';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length < 10) {
    return 'Phone number must be at least 10 digits';
  }
  return null;
}
