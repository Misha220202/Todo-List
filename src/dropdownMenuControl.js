class User {
    constructor(username, profileUrl) {
        this.username = username;
        this.profileUrl = profileUrl;
    }
}

const userJson = localStorage.getItem('user');
const userObj = JSON.parse(userJson);
let user = userObj ? new User(userObj.username, userObj.profileUrl) : null;
const userNode = document.querySelector('.user');

const setUser = () => {
    if (!userJson) {
        const profileUrl = require('./assets/images/user.svg');
        user = new User('Username', profileUrl);
    }
    const usernameNode = userNode.querySelector('p.username');
    const userProfileNode = userNode.querySelector('div.userProfileContainer>img');
    usernameNode.textContent = user.username;
    userProfileNode.src = user.profileUrl;
    localStorage.setItem('user', JSON.stringify(user));
};

const handleFileRead = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

export const dropdownMenuControl = () => {
    setUser();
    const dropdownMenu = document.querySelector('.dropdownMenu');

    userNode.addEventListener('click', () => dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block');

    document.addEventListener('click', event => {
        if (!userNode.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    dropdownMenu.addEventListener('click', async event => {
        const target = event.target;
        const id = target.id;
        if (id == 'darkmode') {
            document.body.classList.toggle('dark-mode');
        } else if (id === 'setProfile') {
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
                        <label for="Username">Username</label>
                        <input type="text" id="Username" name="Username">
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

            const submit = dialog.querySelector('button[type="submit"]');
            submit.addEventListener('click', async event => {
                event.preventDefault();
                const usernameInput = dialog.querySelector('#Username');
                const profileInput = dialog.querySelector('#Profile');
                if (usernameInput.value) {
                    user.username = usernameInput.value;
                }
                if (profileInput.files[0]) {
                    try {
                        user.profileUrl = await handleFileRead(profileInput.files[0]);
                    } catch (error) {
                        console.error("读取文件时出错：", error);
                    }
                }
                setUser();
                dialog.close();
                body.removeChild(dialog);
            });

        } else if (id === 'logOut') {
            // 处理登出功能
        } else if (id === 'reset') {
            localStorage.removeItem('tasksArr');
            location.reload();
        }
    });
};