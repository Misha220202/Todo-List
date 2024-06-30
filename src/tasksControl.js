import { format, addDays } from 'date-fns';
import { currentDate, currentDateFormatted } from './time.js';
import { Task } from './basicClass.js';
import { tasksControlPanel, removeChosenFromClasslist } from './removeChosenFromClasslist.js';
import { classFindParentContainer, idFindParentContainer } from './findParentContainer.js';

const tasksArrJson = localStorage.getItem('tasksArr');
const tasksArr = tasksArrJson ? JSON.parse(tasksArrJson).map(taskObj => new Task(taskObj.title, taskObj.description, taskObj.dueDateFormatted, taskObj.checkStatus, Number(taskObj.recurringCycle), taskObj.importance)) : [];

export const initiateTaskArr = () => {
    if (!tasksArrJson) {
        const initialTask1 = new Task('Welcome to the "ToDo-List"', 'Organize your work and life, finally.', currentDateFormatted(), 'notChecked');
        const initialTask2 = new Task('Create your first task', 'Clicking "add task" to start.', currentDateFormatted(), 'notChecked', 0, 'important');
        tasksArr.push(initialTask1, initialTask2);
        localStorage.setItem('tasksArr', JSON.stringify(tasksArr));
    }
};
initiateTaskArr();

class TaskListNodeManager {
    constructor(element) {
        this.element = element;
        this.groupNames = ['Today', 'Tomorrow', 'Day-3', 'Day-4', 'Day-5', 'Day-6', 'Days-7', 'Future', 'Important', 'Overdue', 'Completed'];
        this.initDates();
    }

    initDates() {
        for (let i = 0; i < 7; i++) {
            const currentDay = addDays(currentDate(), i);
            this[`day${i + 1}`] = currentDay;
            this[`day${i + 1}Formatted`] = format(currentDay, 'yyyy-MM-dd');
        }
    }

    groups() {
        const groups = [];
        for (let i = 0; i < 7; i++) {
            const groupName = this.groupNames[i];
            const formattedDate = this[`day${i + 1}Formatted`];
            const tasks = tasksArr.filter(task => task.dueDateFormatted == formattedDate && task.checkStatus == 'notChecked');
            groups.push({ groupName, tasks, date: formattedDate });
        }

        const futureTasks = tasksArr.filter(task => task.dueDate > this[`day7`] && task.checkStatus == 'notChecked');
        groups.push({ groupName: 'Future', tasks: futureTasks, date: `After ${this[`day${7}Formatted`]}` });

        const importantTasks = tasksArr.filter(task => task.importance == 'important' && task.dueDate >= this[`day1`] && task.checkStatus == 'notChecked');
        groups.push({ groupName: 'Important', tasks: importantTasks, date: `` });

        const overdueTasks = tasksArr.filter(task => task.dueDate < this[`day1`] && task.checkStatus == 'notChecked' && task.recurringCycle == 0);
        groups.push({ groupName: 'OverDue', tasks: overdueTasks, date: `` });

        const completedTasks = tasksArr.filter(task => task.checkStatus == 'checked');
        groups.push({ groupName: 'Completed', tasks: completedTasks, date: `` });

        return groups;
    }

    createTaskNode(task) {
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
            <p class="title">
                <span class="tag">Title:</span>
                <span class="content" contentEditable=false tabindex="-1">${task.title}</span>
            </p>
            <p class="description">
                <span class="tag">Description:</span>
                <span class="content" contentEditable=false>${task.description}</span>
            </p>
            <p class="dueDate">
                <span class="tag">DueDate:</span>
                <span class="content">${task.dueDateFormattedEEEE}</span>
            </p>
            <p class="recurringCycle">
                <span class="tag">RecurringCycle: </span>
                <span class="content">Every ${task.recurringCycle} day(s)</span>
            </p>
            <div class="buttonContainer hidden">
                <button class="submit">Submit</button>
                <button class="cancel">Cancel</button>
            </div>`;

        const dueDateNode = taskNode.querySelector('.dueDate');
        if (currentDate() > task.dueDate) {
            dueDateNode.style.background = 'red';
        } else {
            dueDateNode.style.background = 'lightBlue';
        }

        const recurringCycleNode = taskNode.querySelector('.recurringCycle');
        if (task.recurringCycle == 0) {
            recurringCycleNode.classList.add('hidden');
        }

        if (task.checkStatus == 'checked') {
            dueDateNode.style.background = '';
            taskNode.style.background = 'linear-gradient(to top, var(--color-liner-background) 3px, lightGreen 3px)';
        }

        return taskNode;
    }

    activateTaskNodeButtonFunctions(taskNode) {
        const iconButtonContainer = taskNode.querySelector('.iconButtonContainer');
        iconButtonContainer.addEventListener('click', event => {
            const findIndexById = (arr, id) => {
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].id == id) {
                        return i;
                    }
                }
                return -1;
            }
            const id = taskNode.id;
            const index = findIndexById(tasksArr, id);
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
            groupNode.classList.add(`${group.groupName}`, 'hidden');
            groupNode.innerHTML = `
                <div class="titleBar">
                    <h2>${group.groupName}</h2>
                    <p>${group.date}</p>
                </div>`;

            if (group.groupName == 'OverDue') {
                const button = document.createElement('button');
                button.textContent = 'Reschedule';
                button.classList.add('reschedule');
                groupNode.firstElementChild.appendChild(button);
                button.addEventListener('click', () => {
                    group.tasks.forEach(task => task.dueDateFormatted = this[`day1Formatted`]);
                    this.update();
                });
            }

            group.tasks.forEach(task => {
                const taskNode = this.createTaskNode(task);
                this.activateTaskNodeButtonFunctions(taskNode);
                groupNode.appendChild(taskNode);
            });
            this.element.appendChild(groupNode);
        });
    }

    showDomNodes() {
        //contentContainer NodeList ['Today', 'Tomorrow', 'Day-3', 'Day-4', 'Day-5', 'Day-6', 'Days-7', 'Future', 'Important', 'Overdue', 'Completed'];
        //controlPanel NodeList ['addTask', 'today', 'nextSevenDays', 'allTasks', 'important', 'overdue', 'completed']
        const activePanel = Array.from(tasksControlPanel.children).find(panel => panel.classList.contains('chosen'));
        const id = activePanel.id;
        const children = this.element.children;
        if (id == 'today' && children[0].children[1]) {
            //groupNode has other children other than titleBar
            children[0].classList.remove('hidden');
        } else if (id == 'nextSevenDays') {
            for (let i = 0; i < 7; i++) {
                if (children[i].children[1]) {
                    children[i].classList.remove('hidden');
                }
            }
        } else if (id == 'allTasks') {
            for (let i = 0; i < 8; i++) {
                if (children[i].children[1]) {
                    children[i].classList.remove('hidden');
                }
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
        tasksArr.forEach(task => task.checkAndUpdate());
        localStorage.setItem('tasksArr', JSON.stringify(tasksArr));
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
        this.buildSkeleton();
        this.showDomNodes();
    }

    add(task) {
        tasksArr.push(task);
        this.update();
    }

    edit(taskNode, index) {
        const iconButtonContainers = this.element.querySelectorAll('.iconButtonContainer');
        taskNode.classList.add('contentEditable');
        const buttonContainer = taskNode.querySelector('.buttonContainer');
        const submit = taskNode.querySelector('.submit');
        const cancel = taskNode.querySelector('.cancel');
        const contents = taskNode.querySelectorAll('p>.content');

        const titleBeingEdited = contents[0];
        titleBeingEdited.setAttribute('contentEditable', true);
        setTimeout(() => titleBeingEdited.focus(), 0);

        const descriptionBeingEdited = contents[1];
        descriptionBeingEdited.setAttribute('contentEditable', true);

        const dueDateNodeBeingEdited = contents[2];
        dueDateNodeBeingEdited.innerHTML = `<input type="date" value="${tasksArr[index].dueDateFormatted}"></input>`;

        const recurringCycleBeingEdited = contents[3];
        recurringCycleBeingEdited.parentNode.classList.remove('hidden');
        recurringCycleBeingEdited.innerHTML = `<span>Every </span><input type="number" min=0 max=999 value="${tasksArr[index].recurringCycle}"></input><span> day(s)</span>`;

        iconButtonContainers.forEach(iconButtonContainer => iconButtonContainer.classList.add('blank'));
        buttonContainer.classList.remove('hidden');

        submit.addEventListener('click', () => {
            contents.forEach(content => content.setAttribute('contentEditable', false));

            tasksArr[index].title = titleBeingEdited.textContent;
            titleBeingEdited.setAttribute('contentEditable', false);

            tasksArr[index].description = descriptionBeingEdited.textContent;
            descriptionBeingEdited.setAttribute('contentEditable', false);

            tasksArr[index].dueDateFormatted = dueDateNodeBeingEdited.firstChild.value;

            tasksArr[index].recurringCycle = parseInt(recurringCycleBeingEdited.children[1].value);

            iconButtonContainers.forEach(iconButtonContainer => iconButtonContainer.classList.remove('blank'));
            buttonContainer.classList.add('hidden');

            this.update();
        })

        cancel.addEventListener('click', () => {
            this.update();
        })
    }

    delete(index) {
        tasksArr.splice(index, 1);
        this.update();
    }

    toggleCheckStatus(index) {
        const toggledTask = tasksArr[index];
        toggledTask.checkStatus = toggledTask.checkStatus === 'checked' ? 'notChecked' : 'checked';
        this.update();
    }

    toggleImportance(index) {
        const toggledTask = tasksArr[index];
        toggledTask.importance = toggledTask.importance === 'important' ? 'notImportant' : 'important';
        this.update();
    }
}

const contentContainer = document.querySelector('.contentContainer');
export const taskManager = new TaskListNodeManager(contentContainer);

export const tasksControl = () => {
    taskManager.update();
    tasksControlPanel.addEventListener('click', event => {
        const target = event.target;
        const allTasksDiv = document.querySelector('#allTasks');

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
                        <label for="RecurringCheckBox">Is it a recurring task?</label>
                        <input type="checkbox" id="RecurringCheckBox" name="RecurringCheckBox">
                    </p>
                    <p>
                        <label for="Importance">Is it important?</label>
                        <input type="checkbox" id="Importance" name="Importance">
                    </p>
                </fieldset>
                <div>
                    <button type="submit">Submit</button>
                </div>
                <div class="cancelButtonContainer">
                    <img class="cancel" src="${cancelUrl}" alt="cancel">
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

            const recurringCheckBox = inputs[3];
            recurringCheckBox.addEventListener('change', () => {
                const parentNode = recurringCheckBox.parentNode;
                parentNode.innerHTML = `
                <label for="RecurringCycle">Recurring Cycle:</label>
                <select id="RecurringCycle">
                    <option value="1">Daily</option>
                    <option value="7" selected>Weekly</option>
                    <option value="14">Bi-Weekly</option>
                    <option value="30">Monthly</option>
                </select>`;
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
                    const dueDateFormattedInput = dialog.querySelector('#DueDate').value;
                    const recurringInputNode = dialog.querySelector('#RecurringCycle');
                    const recurringInput = recurringInputNode ? recurringInputNode.value : 0;
                    const importanceCheckBox = dialog.querySelector('#Importance');
                    const importanceInput = importanceCheckBox.checked == true ? 'important' : 'notImportant';

                    const task = new Task(titleInput, descriptionInput, dueDateFormattedInput, 'notChecked', Number(recurringInput), importanceInput);
                    taskManager.add(task);
                    dialog.close();
                    body.removeChild(dialog);
                }
            })
        }

        const tasksControlPanelIdList = ['today', 'nextSevenDays', 'allTasks', 'important', 'overdue', 'completed'];
        if (classFindParentContainer(target, 'addTask')) {
            removeChosenFromClasslist();
            allTasksDiv.classList.add('chosen');
            addTask();
            taskManager.update();
        } else {
            tasksControlPanelIdList.forEach(id => {
                const taskDiv = idFindParentContainer(target, id);
                if (taskDiv) {
                    removeChosenFromClasslist();
                    taskDiv.classList.add('chosen');
                    taskManager.update();
                }
            })
        }
    })
}