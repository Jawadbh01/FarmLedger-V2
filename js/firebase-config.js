// FarmLedger V2 - Firebase Configuration
// This file is imported by all pages

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDpTPibk-7_kqyJdfN94KrLlcKkoNnqIYE",
  authDomain: "farmledger-e85e3.firebaseapp.com",
  projectId: "farmledger-e85e3",
  storageBucket: "farmledger-e85e3.firebasestorage.app",
  messagingSenderId: "922324809308",
  appId: "1:922324809308:web:05c015ce12e55034e99899"
};

export const ROLE_ROUTES = {
  admin:    'pages/admin.html',
  landlord: 'pages/landlord.html',
  manager:  'pages/manager.html'
};

export const ACTIVITY_TYPES = [
  { value: 'diesel',     label: 'Diesel',      urdu: 'ڈیزل',      icon: '⛽' },
  { value: 'fertilizer', label: 'Fertilizer',  urdu: 'کھاد',       icon: '🧪' },
  { value: 'seeds',      label: 'Seeds',        urdu: 'بیج',        icon: '🌱' },
  { value: 'labor',      label: 'Labor',        urdu: 'مزدوری',     icon: '👷' },
  { value: 'pesticide',  label: 'Pesticide',    urdu: 'کیڑے مار',   icon: '💊' },
  { value: 'equipment',  label: 'Equipment',    urdu: 'آلات',       icon: '🔧' },
  { value: 'water',      label: 'Water/Tube',   urdu: 'پانی',       icon: '💧' },
  { value: 'other',      label: 'Other',        urdu: 'دیگر',       icon: '📦' }
];

export const CROP_TYPES = ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Corn', 'Mustard', 'Sunflower', 'Vegetables', 'Other'];
export const HARVEST_UNITS = ['Maund', 'KG', 'Ton', 'Bags', 'Quintal'];
