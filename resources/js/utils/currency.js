export const money = (amount, currency = 'IDR', minimumFractionDigits = 2) => {
  const formatter = new Intl.NumberFormat('en-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits,
  });

  return formatter.format(amount / 100);
};
