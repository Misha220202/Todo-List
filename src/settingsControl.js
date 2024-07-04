import { User } from './basicClass.js';

const userNode = document.querySelector('.user');

export const setUser = () => {
  const signedInUserName = sessionStorage.getItem('signedInUserName');
  const usernameNode = userNode.querySelector('p.username');
  const userProfileNode = userNode.querySelector(
    'div.userProfileContainer>img'
  );
  console.log(`signedInUserName: ${signedInUserName}`);
  const profileUrl = require('./assets/images/user.svg');
  const user = new User(signedInUserName, profileUrl);
  usernameNode.textContent = user.username;
  userProfileNode.src = user.profileUrl;
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
      target.textContent =
        target.textContent == 'Dark Mode' ? 'Light Mode' : 'Dark Mode';
    } else if (id == 'setProfile') { 

    } else if (id == 'logOut') {
      // 处理登出功能
    } else if (id == 'reset') {
      localStorage.removeItem('tasksArr');
      localStorage.removeItem('projectsArr');
      location.reload();
    }
  });
};
