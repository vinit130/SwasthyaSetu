/**
 * SwasthyaSetu Rule-Based Clinical Decision-Support Risk Engine
 *
 * NOTE: This is NOT an AI diagnosis system. It performs deterministic, transparent
 * physiological and symptom rule evaluation to triage patients for qualified doctor review.
 * All clinical responsibility remains with qualified healthcare professionals.
 */

function assessRisk({ symptoms = [], vitals = {} }) {
  const redReasons = [];
  const yellowReasons = [];

  const temp = Number(vitals.temperature);
  const sys = Number(vitals.bloodPressure?.systolic);
  const dia = Number(vitals.bloodPressure?.diastolic);
  const hr = Number(vitals.heartRate);
  const spo2 = Number(vitals.spO2);
  const rr = Number(vitals.respiratoryRate);

  // 1. SpO2 Assessment
  if (!isNaN(spo2) && spo2 > 0) {
    if (spo2 < 90) {
      redReasons.push(`Critically low oxygen saturation (SpO2: ${spo2}%)`);
    } else if (spo2 >= 90 && spo2 <= 94) {
      yellowReasons.push(`Low oxygen saturation (SpO2: ${spo2}%) - requires clinical monitoring`);
    }
  }

  // 2. Blood Pressure Assessment
  if (!isNaN(sys) && sys > 0) {
    if (sys >= 160 || (dia && dia >= 100)) {
      redReasons.push(`Critically elevated blood pressure (${sys}/${dia || '-'} mmHg)`);
    } else if (sys <= 90 || (dia && dia <= 55)) {
      redReasons.push(`Dangerously low blood pressure (${sys}/${dia || '-'} mmHg)`);
    } else if ((sys >= 135 && sys < 160) || (dia && dia >= 88 && dia < 100)) {
      yellowReasons.push(`Elevated blood pressure (${sys}/${dia || '-'} mmHg)`);
    }
  }

  // 3. Heart Rate Assessment
  if (!isNaN(hr) && hr > 0) {
    if (hr > 120) {
      redReasons.push(`Severe tachycardia (Heart rate: ${hr} bpm)`);
    } else if (hr < 50) {
      redReasons.push(`Severe bradycardia (Heart rate: ${hr} bpm)`);
    } else if ((hr > 100 && hr <= 120) || (hr >= 50 && hr < 58)) {
      yellowReasons.push(`Abnormal pulse rate (Heart rate: ${hr} bpm)`);
    }
  }

  // 4. Temperature Assessment (Celsius)
  if (!isNaN(temp) && temp > 0) {
    if (temp >= 39.5) {
      redReasons.push(`High hyperpyrexia fever (${temp.toFixed(1)}°C)`);
    } else if (temp >= 38.0) {
      yellowReasons.push(`Elevated body temperature (${temp.toFixed(1)}°C)`);
    } else if (temp < 35.0) {
      redReasons.push(`Hypothermia danger (${temp.toFixed(1)}°C)`);
    }
  }

  // 5. Respiratory Rate Assessment
  if (!isNaN(rr) && rr > 0) {
    if (rr > 28 || rr < 10) {
      redReasons.push(`Critical respiratory rate (${rr} breaths/min)`);
    } else if (rr > 22 && rr <= 28) {
      yellowReasons.push(`Tachypnea / Rapid breathing (${rr} breaths/min)`);
    }
  }

  // 6. Symptoms Evaluation
  if (Array.isArray(symptoms)) {
    symptoms.forEach((s) => {
      const sName = (s.name || '').toLowerCase();
      const sSev = (s.severity || '').toLowerCase();

      if (
        sName.includes('breathing') ||
        sName.includes('chest') ||
        sName.includes('unconscious') ||
        sSev === 'severe'
      ) {
        if (sName.includes('breathing') || sName.includes('chest')) {
          redReasons.push(`High risk red-flag symptom reported: ${s.name} (${s.severity || 'Reported'})`);
        } else if (sSev === 'severe') {
          redReasons.push(`Severe symptom intensity reported: ${s.name}`);
        }
      } else if (
        sName.includes('fever') ||
        sName.includes('cough') ||
        sName.includes('vomiting') ||
        sName.includes('diarrhea') ||
        sName.includes('body pain') ||
        sSev === 'moderate'
      ) {
        yellowReasons.push(`Clinical review recommended for symptom: ${s.name} (${s.severity || 'Moderate'})`);
      }
    });
  }

  // Determine final triage level
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

module.exports = { assessRisk };
