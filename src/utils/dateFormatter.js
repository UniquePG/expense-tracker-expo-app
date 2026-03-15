import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(relativeTime);
dayjs.extend(calendar);
dayjs.extend(localizedFormat);

export const formatDate = (date, format = 'MMM D, YYYY') => {
  if (!date) return '';
  return dayjs(date).format(format);
};

export const formatDateTime = (date, format = 'MMM D, YYYY h:mm A') => {
  if (!date) return '';
  return dayjs(date).format(format);
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  return dayjs(date).fromNow();
};

export const formatCalendarDate = (date) => {
  if (!date) return '';
  return dayjs(date).calendar(null, {
    sameDay: '[Today at] h:mm A',
    nextDay: '[Tomorrow at] h:mm A',
    nextWeek: 'dddd [at] h:mm A',
    lastDay: '[Yesterday at] h:mm A',
    lastWeek: '[Last] dddd [at] h:mm A',
    sameElse: 'MMM D, YYYY',
  });
};

export const formatShortDate = (date) => {
  if (!date) return '';
  const d = dayjs(date);
  const now = dayjs();
  
  if (d.isSame(now, 'day')) {
    return 'Today';
  } else if (d.isSame(now.subtract(1, 'day'), 'day')) {
    return 'Yesterday';
  } else if (d.isSame(now, 'year')) {
    return d.format('MMM D');
  } else {
    return d.format('MMM D, YYYY');
  }
};

export const getStartOfMonth = (date = new Date()) => {
  return dayjs(date).startOf('month').toISOString();
};

export const getEndOfMonth = (date = new Date()) => {
  return dayjs(date).endOf('month').toISOString();
};

export const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isYesterday = (date) => {
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day');
};

export const addDays = (date, days) => {
  return dayjs(date).add(days, 'day').toISOString();
};

export const subtractDays = (date, days) => {
  return dayjs(date).subtract(days, 'day').toISOString();
};

export default dayjs;