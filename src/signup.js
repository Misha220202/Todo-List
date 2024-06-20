import './signup.css';

const usernameInput = document.querySelector('#username');
let usernameValid = false
function usernameInputHandler() {
    const pattern = /^[a-zA-Z0-9]{6,12}$/;
    const username = usernameInput.value;
    const hint = document.querySelector('.hint.username');
    function usernameInputHandlerExistence(username) {
        //check if username exists in the database;
        return false;
    }

    function setUsernameInvalid() {
        usernameValid = false;
        usernameInput.classList.add('invalid');
    }

    if (usernameInputHandlerExistence(username) == true) {
        setUsernameInvalid();
        hint.textContent = 'Username already exists!';
    } else if (!pattern.test(username)) {
        setUsernameInvalid();
        hint.textContent = 'Username must be 6-12 characters long and contain only letters and numbers.';
    } else {
        usernameValid = true;
        usernameInput.classList.remove('invalid');
        hint.textContent = '';
    }
}

let passwordValid = false;
const passwordInput = document.querySelector('#password');
const confirm_passwordInput = document.querySelector('#confirm_password');
function passwordInputHandler() {
    const pattern = /^[^\s]{6,20}$/;
    const password = passwordInput.value;
    const confirm_password = confirm_passwordInput.value;
    const hint = document.querySelector('.hint.password');

    function setPasswordInvalid() {
        passwordValid = false;
        passwordInput.classList.add('invalid');
        confirm_passwordInput.classList.add('invalid');
    }

    if (password !== confirm_password) {
        setPasswordInvalid();
        hint.textContent = 'Passwords do not match!';
    } else if (!pattern.test(password)) {
        setPasswordInvalid();
        hint.textContent = 'Password must be 6-20 characters long and exclude white space.';
    } else {
        passwordValid = true;
        passwordInput.classList.remove('invalid');
        confirm_passwordInput.classList.remove('invalid');
        hint.textContent = '';
    }
}

const signup = document.querySelector('button');

signup.addEventListener('click', (event) => {
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', () => input.classList.remove('invalid'));
    })
    usernameInputHandler();
    passwordInputHandler();
    const allValid = usernameValid && passwordValid;
    if (!allValid) {
        event.preventDefault();
    } else {
        //create username and password;
    }
})