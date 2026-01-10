export const TOUR_VERSION = 'v1';

/**
 * Konfigurasi langkah tour.
 * Gunakan selector yang stabil (data-tour) agar tidak mudah rusak ketika layout berubah.
 */
export const getTourSteps = (tourId = 'getting-started') => {
  if (tourId !== 'getting-started') return [];

  return [
    {
      id: 'sidebar',
      title: 'Navigasi utama',
      text: 'Gunakan menu di kiri untuk berpindah antar modul seperti Dashboard, Projects, dan Settings.',
      attachTo: { element: '[data-tour="sidebar"]', on: 'right' },
    },
    {
      id: 'notifications',
      title: 'Pusat notifikasi',
      text: 'Lihat notifikasi terbaru, tandai sebagai telah dibaca, atau bersihkan semuanya dari sini.',
      attachTo: { element: '[data-tour="notifications"]', on: 'right' },
    },
    {
      id: 'user-menu',
      title: 'Profil & tema',
      text: 'Kelola profil, ubah tema light/dark, ganti bahasa, dan logout lewat menu ini.',
      attachTo: { element: '[data-tour="user-menu"]', on: 'right' },
    },
  ];
};
