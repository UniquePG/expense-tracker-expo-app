import {CURRENCIES} from '../constants/constants';

export const formatCurrency = (amount, currencyCode = 'USD', options = {}) => {
  const {
    showSymbol = true,
    showDecimals = true,
    compact = false,
  } = options;

  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  
  let formattedAmount;
  
  if (compact && Math.abs(amount) >= 1000) {
    formattedAmount = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  } else {
    formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(Math.abs(amount));
  }

  if (showSymbol) {
    return `${currency.symbol}${formattedAmount}`;
  }

  return formattedAmount;
};

export const formatCurrencyWithCode = (amount, currencyCode = 'USD') => {
  const formatted = formatCurrency(amount, currencyCode);
  return `${formatted} ${currencyCode}`;
};

export const formatSignedCurrency = (amount, currencyCode = 'USD') => {
  const formatted = formatCurrency(amount, currencyCode);
  if (amount > 0) {
    return `+${formatted}`;
  } else if (amount < 0) {
    return `-${formatted}`;
  }
  return formatted;
};

export const parseCurrencyInput = (value) => {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};