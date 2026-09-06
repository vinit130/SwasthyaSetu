/**
 * Client-Side Risk Assessment Rules
 * Provides instantaneous feedback to frontline ASHA workers before server sync.
 * (Transparent clinical decision support - Not an AI diagnosis)
 */
export function calculateClientRisk({ symptoms = [], vitals = {} }) {
  const redReasons = [];
  const yellowReasons = [];

  const temp = parseFloat(vitals.temperature);
  const sys = parseFloat(vitals.bloodPressure?.systolic);
  const dia = parseFloat(vitals.bloodPressure?.diastolic);
  const hr = parseFloat(vitals.heartRate);
  const spo2 = parseFloat(vitals.spO2);
  const rr = parseFloat(vitals.respiratoryRate);

  // SpO2
  if (!isNaN(spo2) && spo2 > 0) {
    if (spo2 < 90) {
      redReasons.push(`Critically low oxygen saturation (SpO2: ${spo2}%)`);
    } else if (spo2 >= 90 && spo2 <= 94) {
      yellowReasons.push(`Low oxygen saturation (SpO2: ${spo2}%) - Doctor monitoring needed`);
    }
  }

  // Blood Pressure
  if (!isNaN(sys) && sys > 0) {
    if (sys >= 160 || (dia && dia >= 100)) {
      redReasons.push(`Critically elevated blood pressure (${sys}/${dia || '-'} mmHg)`);
    } else if (sys <= 90 || (dia && dia <= 55)) {
      redReasons.push(`Dangerously low blood pressure (${sys}/${dia || '-'} mmHg)`);
    } else if ((sys >= 135 && sys < 160) || (dia && dia >= 88 && dia < 100)) {
      yellowReasons.push(`Elevated blood pressure (${sys}/${dia || '-'} mmHg)`);
    }
  }

  // Heart Rate
  if (!isNaN(hr) && hr > 0) {
    if (hr > 120) {
      redReasons.push(`Severe tachycardia (Pulse: ${hr} bpm)`);
    } else if (hr < 50) {
      redReasons.push(`Severe bradycardia (Pulse: ${hr} bpm)`);
    } else if ((hr > 100 && hr <= 120) || (hr >= 50 && hr < 58)) {
      yellowReasons.push(`Abnormal pulse rate (Pulse: ${hr} bpm)`);
    }
  }

  // Temperature
  if (!isNaN(temp) && temp > 0) {
    if (temp >= 39.5) {
      redReasons.push(`High hyperpyrexia fever (${temp.toFixed(1)}°C)`);
    } else if (temp >= 38.0) {
      yellowReasons.push(`Elevated body temperature (${temp.toFixed(1)}°C)`);
    } else if (temp < 35.0) {
      redReasons.push(`Hypothermia danger (${temp.toFixed(1)}°C)`);
    }
  }

  // Respiratory Rate
  if (!isNaN(rr) && rr > 0) {
    if (rr > 28 || rr < 10) {
      redReasons.push(`Critical respiratory rate (${rr} breaths/min)`);
    } else if (rr > 22 && rr <= 28) {
      yellowReasons.push(`Rapid breathing / Tachypnea (${rr} breaths/min)`);
    }
  }

  // Symptoms
  if (Array.isArray(symptoms)) {
    symptoms.forEach((s) => {
      const name = (s.name || '').toLowerCase();
      const sev = (s.severity || '').toLowerCase();

      if (
        name.includes('breathing') ||
        name.includes('chest') ||
        name.includes('unconscious') ||
        sev === 'severe'
      ) {
        if (name.includes('breathing') || name.includes('chest')) {
          redReasons.push(`High risk red-flag symptom: ${s.name}`);
        } else if (sev === 'severe') {
          redReasons.push(`Severe intensity symptom: ${s.name}`);
        }
      } else if (
        name.includes('fever') ||
        name.includes('cough') ||
        name.includes('vomiting') ||
        name.includes('diarrhea') ||
        name.includes('body pain') ||
        sev === 'moderate'
      ) {
        yellowReasons.push(`Review recommended for: ${s.name} (${s.severity || 'Moderate'})`);
      }
    });
  }

  if (redReasons.length > 0) {
    return {
      level: 'RED',
      label: 'Urgent Clinical Assessment',
      disclaimer: 'Urgent clinical assessment recommended. Immediate doctor evaluation needed.',
      reasons: redReasons.concat(yellowReasons),
    };
  }

  if (yellowReasons.length > 0) {
    return {
      level: 'YELLOW',
      label: 'Doctor Review',
      disclaimer: 'Doctor review recommended for symptoms and vital signs.',
      reasons: yellowReasons,
    };
  }

  return {
    level: 'GREEN',
    label: 'Routine',
    disclaimer: 'Vitals and reported signs are within routine monitoring thresholds.',
    reasons: ['Normal physiological vitals recorded', 'No high-risk emergency symptoms detected'],
  };
}
