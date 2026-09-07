/**
 * Maharashtra Public Healthcare Facility Directory & Nearby Provider Abstraction
 * Curated datasets for District Hospitals, Sub-District Hospitals, Rural Hospitals, and PHCs
 */

const MAHARASHTRA_FACILITIES = [
  {
    _id: 'fac_pune_dh',
    id: 'fac_pune_dh',
    name: 'District Hospital, Aundh, Pune',
    type: 'DISTRICT_HOSPITAL',
    state: 'Maharashtra',
    district: 'Pune',
    block: 'Haveli',
    address: 'Aundh Camp, Pune, Maharashtra 411027',
    phone: '02027280388',
    emergencyContact: '02027280389',
    totalBeds: 350,
    availableBeds: 42,
    icuBeds: 28,
    availableIcuBeds: 4,
    servicesOffered: ['Emergency', 'ICU', 'General Medicine', 'Surgery', 'Maternity', 'Pathology', 'Dialysis', 'Blood Bank'],
    coordinates: { lat: 18.5626, lng: 73.8087 },
  },
  {
    _id: 'fac_satara_dh',
    id: 'fac_satara_dh',
    name: 'Kranti Sinh Nana Patil District Hospital, Satara',
    type: 'DISTRICT_HOSPITAL',
    state: 'Maharashtra',
    district: 'Satara',
    block: 'Satara',
    address: 'Sadar Bazar, Satara, Maharashtra 415001',
    phone: '02162234055',
    emergencyContact: '02162234056',
    totalBeds: 280,
    availableBeds: 36,
    icuBeds: 20,
    availableIcuBeds: 3,
    servicesOffered: ['Emergency', 'ICU', 'Obstetrics & Gynaecology', 'Pediatrics', 'Orthopedics', 'Blood Bank'],
    coordinates: { lat: 17.6805, lng: 74.0183 },
  },
  {
    _id: 'fac_baramati_sdh',
    id: 'fac_baramati_sdh',
    name: 'Sub-District Hospital, Baramati',
    type: 'SUB_DISTRICT_HOSPITAL',
    state: 'Maharashtra',
    district: 'Pune',
    block: 'Baramati',
    address: 'Near Municipal Council, Baramati, Pune 413102',
    phone: '02112222345',
    emergencyContact: '02112222346',
    totalBeds: 120,
    availableBeds: 18,
    icuBeds: 8,
    availableIcuBeds: 2,
    servicesOffered: ['24x7 Emergency', 'Maternity', 'General Surgery', 'Sonography', 'Laboratory'],
    coordinates: { lat: 18.1517, lng: 74.5771 },
  },
  {
    _id: 'fac_saswad_rh',
    id: 'fac_saswad_rh',
    name: 'Rural Hospital, Saswad',
    type: 'RURAL_HOSPITAL',
    state: 'Maharashtra',
    district: 'Pune',
    block: 'Purandar',
    address: 'Saswad, Purandar Taluka, Pune 412301',
    phone: '02115222120',
    emergencyContact: '02115222121',
    totalBeds: 50,
    availableBeds: 12,
    icuBeds: 0,
    availableIcuBeds: 0,
    servicesOffered: ['Emergency Stabilization', 'Inpatient Care', 'Maternity & Child Health', 'Minor OT'],
    coordinates: { lat: 18.3444, lng: 74.0303 },
  },
  {
    _id: 'fac_shirur_phc',
    id: 'fac_shirur_phc',
    name: 'Primary Health Centre (PHC), Shirur Rural',
    type: 'PHC',
    state: 'Maharashtra',
    district: 'Pune',
    block: 'Shirur',
    address: 'Village Nighoj Phata, Shirur, Pune 412210',
    phone: '02138222450',
    emergencyContact: '02138222450',
    totalBeds: 12,
    availableBeds: 5,
    icuBeds: 0,
    availableIcuBeds: 0,
    servicesOffered: ['Outpatient Care', 'Routine Immunization', 'Antenatal Care', 'Basic Lab Tests', 'ASHA Base'],
    coordinates: { lat: 18.8256, lng: 74.3789 },
  },
  {
    _id: 'fac_koregaon_phc',
    id: 'fac_koregaon_phc',
    name: 'Primary Health Centre (PHC), Koregaon',
    type: 'PHC',
    state: 'Maharashtra',
    district: 'Satara',
    block: 'Koregaon',
    address: 'Main Road, Koregaon, Satara 415501',
    phone: '02163220110',
    emergencyContact: '02163220110',
    totalBeds: 10,
    availableBeds: 4,
    icuBeds: 0,
    availableIcuBeds: 0,
    servicesOffered: ['Primary Care', 'Normal Delivery', 'Fever Clinic', 'TB & NCD Screening', 'Frontline Triage'],
    coordinates: { lat: 17.6988, lng: 74.1758 },
  },
];

/**
 * Approximate distance calculation between two lat/lng points using Haversine formula
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Fetches nearby facilities based on district or coordinates
 */
async function getNearbyFacilities({ district = 'Pune', lat, lng, type } = {}) {
  // If external provider is configured via environment variables
  if (process.env.FACILITY_MAP_PROVIDER === 'google' && process.env.GOOGLE_MAPS_API_KEY) {
    // External provider hook (safe integration point)
  }

  let list = [...MAHARASHTRA_FACILITIES];

  if (district) {
    const dLower = district.trim().toLowerCase();
    // Prioritize matching district, but include surrounding facilities
    list.sort((a, b) => {
      const aMatch = a.district.toLowerCase().includes(dLower) ? 0 : 1;
      const bMatch = b.district.toLowerCase().includes(dLower) ? 0 : 1;
      return aMatch - bMatch;
    });
  }

  if (type) {
    list = list.filter((f) => f.type === type.toUpperCase());
  }

  return list.map((f) => {
    let distanceKm = null;
    if (lat && lng && f.coordinates) {
      distanceKm = calculateDistanceKm(lat, lng, f.coordinates.lat, f.coordinates.lng);
    } else {
      // Sensible realistic rural distance estimates
      distanceKm = f.type === 'PHC' ? 3.5 : f.type === 'RURAL_HOSPITAL' ? 12.0 : 28.5;
    }
    return {
      ...f,
      distanceKm,
      isDemoPilotData: true,
    };
  });
}

module.exports = {
  MAHARASHTRA_FACILITIES,
  getNearbyFacilities,
};
