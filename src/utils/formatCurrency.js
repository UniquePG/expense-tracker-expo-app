export const formatCurrency = (amount, currency = 'INR', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatAmount = (amount) => {
  return parseFloat(amount).toFixed(2);
};
