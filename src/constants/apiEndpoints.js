import Constants from 'expo-constants';

// Automatically resolve the backend IP from Expo's dev server host.
// When running via `expo start`, hostUri looks like "192.168.x.x:8081"
// so we strip the port and attach our backend port instead.
const getBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (__DEV__ && hostUri) {
    const ip = hostUri.split(':')[0]; // grab just the IP part
    return `http://${ip}:4000/api/v1`;
  }
  // Fallback for production builds — replace with your actual production URL
  return 'https://your-production-api.com/api/v1';
};

export const API_BASE_URL = getBaseUrl();

export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    LOGOUT_ALL: '/auth/logout-all',
  },
  USERS: {
    ME: '/users/me',
    AVATAR: '/users/avatar',
    SEARCH: '/users/search',
    ID: (id) => `/users/${id}`,
  },
  ACCOUNTS: {
    BASE: '/accounts',
    TOTAL: '/accounts/balance/total',
    ID: (id) => `/accounts/${id}`,
    BALANCE: (id) => `/accounts/${id}/balance`,
  },
  CATEGORIES: {
    BASE: '/categories',
    ID: (id) => `/categories/${id}`,
  },
  FRIENDS: {
    BASE: '/friends',
    REQUEST: '/friends/request',
    REQUESTS: '/friends/requests',
    BALANCES: '/friends/balances',
    PENDING: '/friends/pending',
    SENT: '/friends/sent',
    ACCEPT: (id) => `/friends/requests/${id}/accept`,
    REJECT: (id) => `/friends/requests/${id}/reject`,
    DETAILS: (id) => `/friends/${id}`,
    BLOCK: (id) => `/friends/${id}/block`,
  },
  CONTACTS: {
    BASE: '/contacts',
    SEARCH: '/contacts/search',
    ID: (id) => `/contacts/${id}`,
    LINK: (id) => `/contacts/${id}/link`,
  },
  EXPENSES: {
    BASE: '/expenses',
    SUMMARY: '/expenses/summary',
    ID: (id) => `/expenses/${id}`,
    RECEIPT: (id) => `/expenses/${id}/receipt`,
    IMAGE: (id) => `/expenses/${id}/image`,
    COMMENTS: (id) => `/expenses/${id}/comments`,
  },
  SPLITS: {
    BALANCES: '/splits/balances',
    SIMPLIFIED: '/splits/balances/simplified',
    GROUP: (id) => `/splits/group/${id}`,
    EXPENSE: (id) => `/splits/expense/${id}`,
  },
  SETTLEMENTS: {
    BASE: '/settlements',
    ID: (id) => `/settlements/${id}`,
    CONFIRM: (id) => `/settlements/${id}/confirm`,
    REMIND: (id) => `/settlements/${id}/remind`,
  },
  GROUPS: {
    BASE: '/groups',
    ID: (id) => `/groups/${id}`,
    MEMBERS: (id) => `/groups/${id}/members`,
    MEMBER_ADMIN: (id, memberId) => `/groups/${id}/members/${memberId}/admin`,
    EXPENSES: (id) => `/groups/${id}/expenses`,
    BALANCES: (id) => `/groups/${id}/balances`,
    SETTLE: (id) => `/groups/${id}/settle`,
    IMAGE: (id) => `/groups/${id}/image`,
  },
  TRANSACTIONS: {
    BASE: '/transactions',
    INCOME: '/transactions/income',
    EXPENSE: '/transactions/expense',
    TRANSFER: '/transactions/transfer',
    ID: (id) => `/transactions/${id}`,
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD: '/notifications/unread-count',
    MARK_READ: '/notifications/mark-read',
    ID_READ: (id) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all',
    ID: (id) => `/notifications/${id}`,
    SETTINGS: '/notifications/settings',
  },
  INVITES: {
    BASE: '/invites',
    PENDING: '/invites/pending',
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    CATEGORY: '/analytics/spending-by-category',
    TRENDS: '/analytics/monthly-trends',
    INCOME_VS_EXPENSE: '/analytics/income-vs-expense',
    FRIEND_BALANCES: '/analytics/friend-balances',
  },
  DASHBOARD: {
    BASE: '/dashboard',
    STATS: '/dashboard/stats',
    TRENDS: '/dashboard/trends',
    FRIEND_BALANCES: '/dashboard/friend-balances',
  },
};
