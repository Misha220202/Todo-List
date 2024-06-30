export const tasksControlPanel = document.querySelector('.sidebar>.tasks');
export const projectsControlPanel = document.querySelector('.sidebar>.projects');

export const removeChosenFromClasslist = () => {
    Array.from(tasksControlPanel.children).forEach(child => child.classList.remove('chosen'));
    Array.from(projectsControlPanel.children).forEach(child => child.classList.remove('chosen'));
}