export const dropdownMenuControl = () => {

    const user = document.querySelector('.user');
    const dropdownMenu = document.querySelector('.dropdownMenu');

    user.addEventListener('click', () => dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block');

    document.addEventListener('click', (event) => {
        if (!user.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

};