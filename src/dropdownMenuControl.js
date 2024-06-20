import { format, addDays } from 'date-fns';
import { initiateTaskArr } from './tasksControl.js';

export const dropdownMenuControl = () => {
    const user = document.querySelector('.user');
    const dropdownMenu = document.querySelector('.dropdownMenu');

    user.addEventListener('click', () => dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block');

    document.addEventListener('click', event => {
        if (!user.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    const reset = dropdownMenu.querySelector('#reset');
    reset.addEventListener('click', () => {
        localStorage.clear();
        initiateTaskArr;
        location.reload();
    });
};