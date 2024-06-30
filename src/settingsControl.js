import { User } from './basicClass.js';

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
  const userProfileNode = userNode.querySelector(
    'div.userProfileContainer>img'
  );
  usernameNode.textContent = user.username;
  userProfileNode.src = user.profileUrl;
  localStorage.setItem('user', JSON.stringify(user));
};

const handleFileRead = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const settingsControl = () => {
  setUser();
  const settings = document.querySelector('.settings');

  userNode.addEventListener(
    'click',
    () =>
      (settings.style.display =
        settings.style.display == 'block' ? 'none' : 'block')
  );

  userNode.parentNode.addEventListener('mouseleave', (event) => {
    settings.style.display = 'none';
  });

  settings.addEventListener('click', async (event) => {
    const target = event.target;
    const id = target.id;
    if (id == 'darkMode') {
      document.body.classList.toggle('darkMode');
    } else if (id == 'setProfile') {
      const dialog = document.createElement('dialog');
      dialog.classList.add('setProfileDialog');
      const cancelUrl = require('./assets/images/x-square.svg');
      dialog.innerHTML = `
            <div class="cancelButtonContainer">
                <img class="cancel" src="${cancelUrl}" alt="cancel">
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
      submit.addEventListener('click', async (event) => {
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
            console.error('Error reading file:', error);
          }
        }
        setUser();
        dialog.close();
        body.removeChild(dialog);
      });
    } else if (id == 'logOut') {
      // 处理登出功能
    } else if (id == 'reset') {
      localStorage.removeItem('tasksArr');
      localStorage.removeItem('projectsArr');
      location.reload();
    }
  });
};
