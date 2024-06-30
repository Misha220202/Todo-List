import './index.css';

const local = document.querySelector('#local');
const cloud = document.querySelector('#cloud');

if (local) {
    local.addEventListener('click', () => window.location.href = './app.html')
}

if (cloud) {
    cloud.addEventListener('click', () => window.location.href = './login.html')
}