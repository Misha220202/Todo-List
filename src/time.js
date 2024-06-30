import { format, nextSunday, isSunday } from 'date-fns';

const showCurrentTimeFormatted = () => {
  const now = new Date();
  const formattedTime = format(now, 'yyyy-MM-dd HH:mm:ss EEEE');
  const clock = document.querySelector('nav>.clock');
  clock.textContent = formattedTime;
};
export const startClock = () => setInterval(showCurrentTimeFormatted, 1000);

export const currentTimeFormatted = () =>
  format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS');
export const currentDate = () => new Date(new Date().setHours(0, 0, 0, 0));
export const currentDateFormatted = () => format(currentDate(), 'yyyy-MM-dd');
export const nextSundayFormatted = () =>
  isSunday(currentDate())
    ? currentDateFormatted()
    : format(nextSunday(currentDate()), 'yyyy-MM-dd');
