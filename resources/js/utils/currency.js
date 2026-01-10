// Utilitas utama untuk format uang
export const money = (amount, currency = 'IDR', options = {}) => {
  if (typeof amount !== 'number' || isNaN(amount)) return amount;

  const localeMap = {
    IDR: 'id-ID',
    USD: 'en-US',
    EUR: 'de-DE',
    JPY: 'ja-JP',
  };

  const locale = localeMap[currency] || 'en-US';
  const {
    minimumFractionDigits = currency === 'IDR' ? 0 : 2,
    maximumFractionDigits = currency === 'IDR' ? 0 : 2,
    round = false,
    compact = false, // tambahan opsional untuk style compact
  } = options;

  let value = round ? Math.round(amount) : amount;

  // Mode compact menggunakan notasi singkat (K, M, B)
  if (compact) {
    const abs = Math.abs(value);
    if (abs >= 1e9) return `Rp${(value / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `Rp${(value / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `Rp${(value / 1e3).toFixed(1)}K`;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
};

// Format cepat untuk tampilan ringkas di chart atau tooltip
export const formatCompact = (value, currency = 'IDR') => {
  if (typeof value !== 'number' || isNaN(value)) return value;

  const abs = Math.abs(value);
  if (abs >= 1e9) return `Rp${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `Rp${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `Rp${(value / 1e3).toFixed(1)}K`;

  return money(value, currency);
};

// Alias untuk konsistensi dengan EvmChart
export const formatCurrency = money;
