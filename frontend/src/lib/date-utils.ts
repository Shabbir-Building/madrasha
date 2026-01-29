import dayjs from 'dayjs';

export const getCurrentYear = () => {
  return dayjs().year();
};

export const getTodayDate = () => {
  return dayjs().format('YYYY-MM-DD');
};

export const formatDate = (date: string | Date) => {
  if (typeof window === 'undefined') return '';
  return dayjs(date).format('MM/DD/YYYY');
};
