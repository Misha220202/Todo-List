import { format, addDays } from 'date-fns';
import { classFindParentContainer, idFindParentContainer } from './findParentContainer.js';

class Task {
    constructor(title, description, dueDate, checkStatus, importance) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.checkStatus = checkStatus;
        this.importance = importance;
        this.id = (title + description).replace(/\s/g, "");
    }
}

const tasksArrJson = localStorage.getItem('tasksArr');
const tasksArr = tasksArrJson ? JSON.parse(tasksArrJson).map(taskObj => new Task(taskObj.title, taskObj.description, taskObj.dueDate, taskObj.checkStatus, taskObj.importance)) : [];

export const initiateTaskArr = () => {
    if (!tasksArrJson) {
        const currentDateFormatted = format(new Date(), 'yyyy-MM-dd');
        const initialTask1 = new Task('Welcome to the "todo-List"', 'Organize your work and life, finally.', currentDateFormatted, 'notChecked', 'notImportant');
        const initialTask2 = new Task('Create your first task', 'Clicking "add task" to start.', currentDateFormatted, 'notChecked', 'important');
        const initialTask3 = new Task('Create your first project', 'Use "Quick Start Templates" to create your first project.', currentDateFormatted, 'notChecked', 'notImportant');
        tasksArr.push(initialTask1, initialTask2, initialTask3);
        localStorage.setItem('tasksArr', JSON.stringify(tasksArr));
    }
};
initiateTaskArr();

const contentContainer = document.querySelector('.contentContainer');

class TaskListNodeManager {
    constructor(element) {
        this.element = element;
        this.arr = tasksArr;
        this.controlPanelContainer = document.querySelector('.sidebar>.tasks');
        this.titles = ['Today', 'Tomorrow', 'Day-3', 'Day-4', 'Day-5', 'Day-6', 'Days-7', 'Future', 'Important', 'Overdue', 'Completed'];
        this.initDates();
    }

    filterTasksByDate(date) {
        return this.arr.filter(task => task.dueDate === date && task.checkStatus == 'notChecked');
    }

    initDates() {
        const today = new Date(new Date().setHours(0, 0, 0, 0));

        for (let i = 0; i < 7; i++) {
            const currentDay = addDays(today, i);
            this[`day${i + 1}`] = currentDay;
            this[`day${i + 1}Formatted`] = format(currentDay, 'yyyy-MM-dd');
        }
    }

    groups() {
        const groups = [];

        for (let i = 0; i < 7; i++) {
            const title = this.titles[i];
            const formattedDate = this[`day${i + 1}Formatted`];
            const tasks = this.filterTasksByDate(formattedDate);
            groups.push({ title, tasks, date: formattedDate });
        }

        const futureTasks = this.arr.filter(task => task.dueDate > this[`day7Formatted`] && task.checkStatus == 'notChecked');
        groups.push({ title: 'Future', tasks: futureTasks, date: `After ${this[`day${7}Formatted`]}` });

        const importantTasks = this.arr.filter(task => task.importance == 'important' && task.checkStatus == 'notChecked');
        groups.push({ title: 'Important', tasks: importantTasks, date: `` });

        const overdueTasks = this.arr.filter(task => task.dueDate < this[`day1Formatted`] && task.checkStatus == 'notChecked');
        groups.push({ title: 'OverDue', tasks: overdueTasks, date: `` });

        const completedTasks = this.arr.filter(task => task.checkStatus == 'checked');
        groups.push({ title: 'Completed', tasks: completedTasks, date: `` });

        return groups;
    }

    createNode(task) {
        const taskNode = document.createElement('div');
        taskNode.classList.add('task', `${task.checkStatus}`, `${task.importance}`);
        taskNode.setAttribute('id', `${task.id}`);
        const editUrl = require('./assets/images/edit.svg');
        const starUrl = require('./assets/images/star.svg');
        const checkUrl = require('./assets/images/check-square.svg');
        const deleteUrl = require('./assets/images/trash-2.svg');

        taskNode.innerHTML = `
            <div class="iconButtonContainer">
                <img class="editButton" src="${editUrl}" alt="edit">
                <img class="likeButton" src="${starUrl}" alt="star">
                <img class="checkButton" src="${checkUrl}" alt="check-square">
                <img class="deleteButton" src="${deleteUrl}" alt="trash-2">
            </div>
            <p class="title"><span class="tag">Title:</span><span class="content" contentEditable=false tabindex="-1">${task.title}</span>
            </p>
            <p class="description"><span class="tag">Description:</span><span class="content"
                    contentEditable=false>${task.description}</span></p>
            <p class="dueDate"><span class="tag">dueDate:</span><span class="content"
                    contentEditable=false>${task.dueDate}</span></p>
            <div class="buttonContainer hidden">
                <button class="submit">Submit</button>
                <button class="cancel">Cancel</button>
            </div>`;
        return taskNode;
    }

    activateTaskNodeButtonFunctions(taskNode) {
        const iconButtonContainer = taskNode.querySelector('.iconButtonContainer');
        iconButtonContainer.addEventListener('click', event => {
            const findIndexById = (arr, id) => {
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].id === id) {
                        return i;
                    }
                }
                return -1;
            }
            const id = taskNode.id;
            const index = findIndexById(this.arr, id);
            const target = event.target;

            if (target.classList.contains('editButton')) {
                this.edit(taskNode, index);
            } else if (target.classList.contains('likeButton')) {
                this.toggleImportance(index);
            } else if (target.classList.contains('checkButton')) {
                this.toggleCheckStatus(index);
            } else if (target.classList.contains('deleteButton')) {
                this.delete(index);
            }
        })
    }

    buildSkeleton() {
        const groups = this.groups();

        groups.forEach(group => {
            const groupNode = document.createElement('div');
            groupNode.classList.add(`${group.title}`, 'hidden');
            groupNode.innerHTML = `
                <div class="titleBar">
                    <h2>${group.title}</h2>
                    <p>${group.date}</p>
                </div>`;

            if (group.title == 'OverDue') {
                const button = document.createElement('button');
                button.textContent = 'Reschedule';
                button.classList.add('reschedule');
                groupNode.firstElementChild.appendChild(button);
                button.addEventListener('click', () => {
                    group.tasks.forEach(task => task.dueDate = this[`day1Formatted`]);
                    this.update();
                });
            }

            group.tasks.forEach(task => {
                const taskNode = this.createNode(task);
                this.activateTaskNodeButtonFunctions(taskNode);
                groupNode.appendChild(taskNode);
            });

            this.element.appendChild(groupNode);
        });
    }

    showDomNodes() {
        //contentContainer NodeList ['Today', 'Tomorrow', 'Day-3', 'Day-4', 'Day-5', 'Day-6', 'Days-7', 'Future', 'Important', 'Overdue', 'Completed'];
        //controlPanel NodeList ['addTask', 'today', 'nextSevenDays', 'allTasks', 'important', 'overdue', 'completed']
        const activePanel = Array.from(this.controlPanelContainer.children).find(panel => panel.classList.contains('chosen'));
        const id = activePanel.id;
        const children = this.element.children;
        if (id == 'today') {
            children[0].classList.remove('hidden');
        } else if (id == 'nextSevenDays') {
            for (let i = 0; i < 7; i++) {
                children[i].classList.remove('hidden');
            }
        } else if (id == 'allTasks') {
            for (let i = 0; i < 8; i++) {
                children[i].classList.remove('hidden');
            }
        } else if (id == 'important') {
            children[8].classList.remove('hidden');
        } else if (id == 'overdue') {
            children[9].classList.remove('hidden');
        } else if (id == 'completed') {
            children[10].classList.remove('hidden');
        }
    }

    update() {
        localStorage.setItem('tasksArr', JSON.stringify(this.arr));
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
        this.buildSkeleton();
        this.showDomNodes();
    }

    add(task) {
        this.arr.push(task);
        this.update();
    }

    edit(taskNode, index) {
        const iconButtonContainers = contentContainer.querySelectorAll('.iconButtonContainer');
        taskNode.classList.add('contentEditable');
        const buttonContainer = taskNode.querySelector('.buttonContainer');
        const submit = taskNode.querySelector('.submit');
        const cancel = taskNode.querySelector('.cancel');
        const contents = taskNode.querySelectorAll('p>.content');
        const dueDateNodeBeingEdited = contents[2];

        iconButtonContainers.forEach(iconButtonContainer => iconButtonContainer.classList.add('blank'));
        buttonContainer.classList.remove('hidden');

        contents.forEach(content => content.setAttribute('contentEditable', true));
        dueDateNodeBeingEdited.innerHTML = `<input type="date" value="${this.arr[index].dueDate}"></input>`;

        submit.addEventListener('click', () => {
            (iconButtonContainer => iconButtonContainer.classList.remove('blank'));
            buttonContainer.classList.add('hidden');
            contents.forEach(content => content.setAttribute('contentEditable', false));
            this.arr[index].title = contents[0].textContent;
            this.arr[index].description = contents[1].textContent;
            this.arr[index].dueDate = dueDateNodeBeingEdited.firstChild.value;
            this.update();
        })

        cancel.addEventListener('click', () => {
            this.update();
        })
    }

    delete(index) {
        this.arr.splice(index, 1);
        this.update();
    }

    toggleCheckStatus(index) {
        const toggledTask = this.arr[index];
        if (toggledTask.checkStatus == 'checked') {
            toggledTask.checkStatus = 'notChecked';
        } else {
            toggledTask.checkStatus = 'checked';
        }
        this.update();
    }

    toggleImportance(index) {
        const toggledTask = this.arr[index];
        if (toggledTask.importance == 'important') {
            toggledTask.importance = 'notImportant';
        } else {
            toggledTask.importance = 'important';
        }
        this.update();
    }
}

export const taskManager = new TaskListNodeManager(contentContainer);

export const tasksControl = () => {
    taskManager.buildSkeleton();
    taskManager.showDomNodes();
    const tasksPanel = document.querySelector('.sidebar>.tasks');
    tasksPanel.addEventListener('click', (event) => {
        const target = event.target;
        const addTaskDiv = document.querySelector('.addTask');
        const todayDiv = document.querySelector('#today');
        const nextSevenDaysDiv = document.querySelector('#nextSevenDays');
        const allTasksDiv = document.querySelector('#allTasks');
        const importantDiv = document.querySelector('#important');
        const overdueDiv = document.querySelector('#overdue');
        const completedDiv = document.querySelector('#completed');

        const addTask = () => {
            const dialog = document.createElement('dialog');
            dialog.classList.add('addTaskDialog');
            const cancelUrl = require('./assets/images/x-square.svg');
            dialog.innerHTML = `
            <form action="#" method="dialog">
                <fieldset>
                    <div>
                        <label for="Title">Title:</label>
                        <input type="text" id="Title" name="Title">
                    </div>
                    <div>
                        <label for="Description">Description:</label>
                        <input type="text" id="Description" name="Description">
                    </div>
                    <div>
                        <label for="DueDate">DueDate:</label>
                        <input type="date" id="DueDate" name="DueDate">
                    </div>
                    <p>
                        <label for="Importance">Is it important?</label>
                        <input type="checkbox" id="Importance" name="Importance">
                    </p>
                </fieldset>
                <div>
                    <button type="submit">Submit</button>
                </div>
                <div class="iconContainer">
                    <img class="iconButton cancel" src="${cancelUrl}" alt="cancel">
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

            const inputs = dialog.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    if (input.value) {
                        input.classList.remove('inValid');
                    }
                })
            })

            const submit = dialog.querySelector('button');
            submit.addEventListener('click', event => {
                let allValid = true;
                inputs.forEach(input => {
                    if (!input.value) {
                        event.preventDefault();
                        allValid = false;
                        input.classList.add('inValid');
                    }
                })
                if (allValid == true) {
                    const titleInput = dialog.querySelector('#Title').value;
                    const descriptionInput = dialog.querySelector('#Description').value;
                    const dueDateInput = dialog.querySelector('#DueDate').value;
                    const importanceCheckBox = dialog.querySelector('#Importance');
                    const importanceInput = importanceCheckBox.checked == true ? 'important' : 'notImportant';

                    const task = new Task(titleInput, descriptionInput, dueDateInput, 'notChecked', importanceInput);
                    taskManager.add(task);
                    dialog.close();
                    body.removeChild(dialog);
                }
            })
        }

        const removeChosenFromClasslist = () => {
            todayDiv.classList.remove('chosen');
            nextSevenDaysDiv.classList.remove('chosen');
            allTasksDiv.classList.remove('chosen');
            importantDiv.classList.remove('chosen');
            overdueDiv.classList.remove('chosen');
            completedDiv.classList.remove('chosen');
        }

        if (classFindParentContainer(target, 'addTask')) {
            addTask();
        } else if (idFindParentContainer(target, 'today')) {
            removeChosenFromClasslist();
            todayDiv.classList.add('chosen');
            taskManager.update();
        } else if (idFindParentContainer(target, 'nextSevenDays')) {
            removeChosenFromClasslist();
            nextSevenDaysDiv.classList.add('chosen');
            taskManager.update();
        } else if (idFindParentContainer(target, 'allTasks')) {
            removeChosenFromClasslist();
            allTasksDiv.classList.add('chosen');
            taskManager.update();
        } else if (idFindParentContainer(target, 'important')) {
            removeChosenFromClasslist();
            importantDiv.classList.add('chosen');
            taskManager.update();
        } else if (idFindParentContainer(target, 'overdue')) {
            removeChosenFromClasslist();
            overdueDiv.classList.add('chosen');
            taskManager.update();
        } else if (idFindParentContainer(target, 'completed')) {
            removeChosenFromClasslist();
            completedDiv.classList.add('chosen');
            taskManager.update();
        }
    })
}