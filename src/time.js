import { format } from 'date-fns';

function showCurrentTime() {
    const now = new Date();
    const formattedTime = format(now, 'yyyy-MM-dd HH:mm:ss EEEE');
    const clock = document.querySelector('nav>.clock');
    clock.textContent = formattedTime;
}
export const startClock = () => setInterval(showCurrentTime, 1000);

export const currentDate = new Date(new Date().setHours(0, 0, 0, 0));
export const currentDateFormatted = format(currentDate, 'yyyy-MM-dd');