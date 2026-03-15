export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  SETTINGS: 'settings',
  THEME: 'theme',
};

export const SPLIT_TYPES = {
  EQUAL: 'equal',
  PERCENTAGE: 'percentage',
  EXACT: 'exact',
  SHARES: 'shares',
};

export const EXPENSE_TYPES = {
  EXPENSE: 'expense',
  INCOME: 'income',
};

export const NOTIFICATION_TYPES = {
  FRIEND_REQUEST: 'friend_request',
  FRIEND_ACCEPTED: 'friend_accepted',
  EXPENSE_CREATED: 'expense_created',
  EXPENSE_UPDATED: 'expense_updated',
  SETTLEMENT_REQUEST: 'settlement_request',
  SETTLEMENT_COMPLETED: 'settlement_completed',
  GROUP_INVITE: 'group_invite',
  GROUP_JOINED: 'group_joined',
};

export const CURRENCIES = [
  {code: 'USD', symbol: '$', name: 'US Dollar'},
  {code: 'EUR', symbol: '€', name: 'Euro'},
  {code: 'JPY', symbol: '¥', name: 'Japanese Yen'},
  {code: 'INR', symbol: '₹', name: 'Indian Rupee'},
];

export const EXPENSE_CATEGORIES = [
  {id: 'food', name: 'Food & Dining', icon: 'food', color: '#FF5722'},
  {id: 'transport', name: 'Transportation', icon: 'car', color: '#2196F3'},
  {id: 'shopping', name: 'Shopping', icon: 'shopping', color: '#9C27B0'},
  {id: 'entertainment', name: 'Entertainment', icon: 'movie', color: '#E91E63'},
  {id: 'utilities', name: 'Utilities', icon: 'flash', color: '#FF9800'},
  {id: 'health', name: 'Health & Fitness', icon: 'heart-pulse', color: '#F44336'},
  {id: 'travel', name: 'Travel', icon: 'airplane', color: '#00BCD4'},
  {id: 'education', name: 'Education', icon: 'school', color: '#4CAF50'},
  {id: 'home', name: 'Home', icon: 'home', color: '#795548'},
  {id: 'other', name: 'Other', icon: 'dots-horizontal', color: '#607D8B'},
];

export const INCOME_CATEGORIES = [
  {id: 'salary', name: 'Salary', icon: 'cash', color: '#4CAF50'},
  {id: 'freelance', name: 'Freelance', icon: 'laptop', color: '#2196F3'},
  {id: 'investment', name: 'Investment', icon: 'trending-up', color: '#9C27B0'},
  {id: 'gift', name: 'Gift', icon: 'gift', color: '#E91E63'},
  {id: 'other', name: 'Other', icon: 'dots-horizontal', color: '#607D8B'},
];

export const FRIEND_REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

export const SETTLEMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};