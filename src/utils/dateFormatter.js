import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatDate = (date, format = 'MMM DD, YYYY') => {
  return dayjs(date).format(format);
};

export const formatRelativeTime = (date) => {
  return dayjs(date).fromNow();
};

export const formatDateTime = (date) => {
  return dayjs(date).format('MMM DD, YYYY hh:mm A');
};
