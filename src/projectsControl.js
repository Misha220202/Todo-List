import { Task } from './tasksControl.js';

class Project {
    constructor(title, tasksArr = []) {
        this.title = title;
        this.tasksArr = tasksArr;
    }
}

const projectsArrJson = localStorage.getItem('projectsArr');
const projectsArr = projectsArrJson ? JSON.parse(projectsArrJson).map(projectObj => new Project(projectObj.title, projectObj.tasksArr)) : [];

export const initiateProjectsArr = () => {
    if (!tasksArrJson) {
        const home = new Project('Home');

        const currentDateFormatted = format(new Date(), 'yyyy-MM-dd');
        const initialTask1 = new Task('Welcome to the "todo-List"', 'Organize your work and life, finally.', currentDateFormatted, 'notChecked', 'notImportant');
        const initialTask2 = new Task('Create your first task', 'Clicking "add task" to start.', currentDateFormatted, 'notChecked', 'important');
        const initialTask3 = new Task('Create your first project', 'Use "Quick Start Templates" to create your first project.', currentDateFormatted, 'notChecked', 'notImportant');
        tasksArr.push(initialTask1, initialTask2, initialTask3);
        localStorage.setItem('tasksArr', JSON.stringify(tasksArr));
    }
};
initiateTaskArr();