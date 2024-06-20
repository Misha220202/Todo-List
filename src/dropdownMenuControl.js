import { format, addDays } from 'date-fns';
import { initiateTaskArr } from './tasksControl.js';

class User {
    constructor(username, profileUrl) {
        this.username = username;
        this.profileUrl = profileUrl;
    }
}

const userJson = localStorage.getItem('user');
const user = userJson ? new User(...Object.values(JSON.parse(userJson))) : null;
const userNode = document.querySelector('.user');

const initiateUser = (()=>{
    const defaultUserProfileUrl = require('./assets/images/user.svg');
    const defaultUser = new User('Username',defaultUserProfileUrl);
    console.log(defaultUserProfileUrl);
    const usernameNode = userNode.querySelector('p.username');
    const userProfileNode = userNode.querySelector('div.userProfileContainer>img');

    usernameNode.textContent = defaultUser.username;
    userProfileNode.src = defaultUser.profileUrl;
})();


export const dropdownMenuControl = () => {
    const dropdownMenu = document.querySelector('.dropdownMenu');

    userNode.addEventListener('click', () => dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block');

    document.addEventListener('click', event => {
        if (!userNode.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    // const setProfile = dropdownMenu.querySelector('#setProfile');
    // const logOut = dropdownMenu.querySelector('#logOut');
    // const reset = dropdownMenu.querySelector('#reset');

    dropdownMenu.addEventListener('click', event => {
        const target = event.target;
        const id = target.id;
        if (id == 'setProfile') {
            const dialog = document.createElement('dialog');
            dialog.classList.add('setProfileDialog');
            const cancelUrl = require('./assets/images/x-square.svg');
            dialog.innerHTML = `
            <div class="iconContainer">
                <img class="iconButton cancel" src="${cancelUrl}" alt="cancel">
             </div>
            <form action="#" method="dialog">
                <fieldset>
                    <div>
                        <label for="Name">Name</label>
                        <input type="text" id="Name" name="Name" value="Username">
                    </div>
                    <div>
                        <label for="Profile">Profile</label>
                        <input type="file" id="Profile" name="Profile" accept="image/*">
                    </div>
                </fieldset>
                <div>
                    <button type="submit">Submit</button>
                </div>
            </form>`;
            const body = document.body;
            body.appendChild(dialog);
            dialog.showModal();

            const cancel = dialog.querySelector('.cancel');
            cancel.addEventListener('click', () => {
                dialog.close();
                body.removeChild(dialog);
            });

            const submit = dialog.querySelector('button');
            submit.addEventListener('click', event => {

            })

        } else if (id == 'logOut') {
            ;
        } else if (id == 'reset') {
            localStorage.clear();
            initiateTaskArr;
            location.reload();
        }
    })
};