export const money = (amount, currency = 'IDR') => {
  if (typeof amount !== 'number') return amount;

  const locale = currency === 'IDR' ? 'id-ID' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
};
