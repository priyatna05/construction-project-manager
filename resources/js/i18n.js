// resources/js/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Sementara hardcode dulu, nanti bisa kamu pindah ke file JSON
const resources = {
  en: {
    translation: {
      'dashboard.title': 'Dashboard',
      'dashboard.subtitle': 'Overview of your construction projects and performance.',
      'notes.workspaceTitle': 'Workspace Notes',
      'notes.helpText': 'Write anything important related to your projects here.',
    },
  },
  id: {
    translation: {
      'dashboard.title': 'Dasbor',
      'dashboard.subtitle': 'Ringkasan proyek konstruksi dan kinerjanya.',
      'notes.workspaceTitle': 'Catatan Workspace',
      'notes.helpText': 'Tuliskan hal-hal penting terkait proyek Anda di sini.',
    },
  },
};

// Baca bahasa tersimpan di localStorage, default 'en'
const savedLang =
  typeof window !== 'undefined'
    ? window.localStorage.getItem('app_lang') || 'en'
    : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
