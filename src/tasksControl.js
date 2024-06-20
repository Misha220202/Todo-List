import { format, addDays } from 'date-fns';
import { classFindParentContainer, idFindParentContainer } from './findParentContainer.js';

class Task {
    constructor(dueDate, title, description, checkStatus, importance) {
        this.dueDate = dueDate;
        this.title = title;
        this.description = description;
        this.checkStatus = checkStatus;
        this.importance = importance;
        this.id = (title + description).replace(/\s/g, "");
    }
}

const tasksArrJason = localStorage.getItem('tasksArr');
const tasksArr = tasksArrJason ? JSON.parse(tasksArrJason).map(taskObj => new Task(taskObj.dueDate, taskObj.title, taskObj.description, taskObj.checkStatus, taskObj.importance)) : [];

if (!tasksArrJason) {
    const currentDateFormatted = format(new Date(), 'yyyy-MM-dd');
    const initialTask1 = new Task(currentDateFormatted, 'Welcome to the "todo-List"', 'Organize your work and life, finally.', 'notChecked', 'notImportant');
    const initialTask2 = new Task(currentDateFormatted, 'Create your first task', 'Clicking "add task" to start.', 'notChecked', 'important');
    const initialTask3 = new Task(currentDateFormatted, ' Create your first project', 'Use "Quick Start Templates" to create your first project.', 'notChecked', 'notImportant');
    tasksArr.push(initialTask1, initialTask2, initialTask3);
    localStorage.setItem('tasksArr', JSON.stringify(tasksArr));
}

class TaskListNodeManager {
    constructor(element) {
        this.element = element;
        this.arr = tasksArr;
        this.initDates();
    }

    filterTasksByDate(date) {
        return this.arr.filter(task => task.dueDate === date);
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
        const titles = ['Today', 'Tomorrow', 'Day-3', 'Day-4', 'Day-5', 'Day-6', 'Days-7', 'Future'];

        for (let i = 0; i < 7; i++) {
            const title = titles[i];
            const formattedDate = this[`day${i + 1}Formatted`];
            const tasks = this.filterTasksByDate(formattedDate);
            groups.push({ title, tasks, date: formattedDate });
        }

        const futureTasks = this.arr.filter(task => task.dueDate > this[`day7Formatted`]);
        groups.push({ title: 'Future', tasks: futureTasks, date: `> ${this[`day${7}Formatted`]}` });

        const overdueTasks = this.arr.filter(task => task.dueDate < this[`day1Formatted`]);
        groups.push({ title: 'OverDue', tasks: overdueTasks, date: `` });

        return groups;
    }

    buildSkeleton() {
        const groups = this.groups();

        groups.forEach(group => {
            const groupNode = document.createElement('div');
            groupNode.classList.add(`${group.title}`);
            groupNode.innerHTML = `
                <div class="titleBar">
                    <h2>${group.title}</h2>
                    <p>${group.date}</p>
                </div>`;

            group.tasks.forEach(task => {
                const taskNode = this.createNode(task);
                this.activateTaskNodeButtonFunctions(taskNode);
                groupNode.appendChild(taskNode);
            });

            this.element.appendChild(groupNode);
        });
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
            <p class="title"><span class="tag">Title:</span><span class="content" contentEditable=false>${task.title}</span>
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
                this.edit(taskNode, index, iconButtonContainer);
            } else if (target.classList.contains('likeButton')) {
                this.toggleImportance(index);
            } else if (target.classList.contains('checkButton')) {
                this.toggleCheckStatus(index);
            } else if (target.classList.contains('deleteButton')) {
                this.delete(index);
            }
        })
    }

    update() {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
        this.buildSkeleton();
    }

    add(task) {
        this.arr.push(task);
        this.update();
    }

    edit(taskNode, index, iconButtonContainer) {
        taskNode.classList.add('contentEditable');
        const buttonContainer = taskNode.querySelector('.buttonContainer');
        const submit = taskNode.querySelector('.submit');
        const cancel = taskNode.querySelector('.cancel');
        const contents = taskNode.querySelectorAll('p>.content');
        iconButtonContainer.classList.add('blank');
        buttonContainer.classList.remove('hidden');
        contents.forEach(content => content.setAttribute('contentEditable', true));
        submit.addEventListener('click', () => {
            iconButtonContainer.classList.remove('blank');
            buttonContainer.classList.add('hidden');
            contents.forEach(content => content.setAttribute('contentEditable', false));
            this.arr[index].title = contents[0].textContent;
            this.arr[index].description = contents[1].textContent;
            this.arr[index].dueDate = contents[2].textContent;
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

const contentContainer = document.querySelector('.contentContainer');
const taskManager = new TaskListNodeManager(contentContainer);
taskManager.buildSkeleton();

export const tasksControl = () => {

    const tasksPanel = document.querySelector('.sidebar>.tasks');

    tasksPanel.addEventListener('click', (event) => {
        const target = event.target;
        const addTaskDiv = document.querySelector('.addTask');
        const todayDiv = document.querySelector('#today');
        const nextSevenDaysDiv = document.querySelector('#nextSevenDays');
        const allTasksDiv = document.querySelector('#allTasks');
        const importantDiv = document.querySelector('#important');
        const overdueDiv = document.querySelector('#overdue');

        const removeChosenFromClasslist = () => {
            todayDiv.classList.remove('chosen');
            nextSevenDaysDiv.classList.remove('chosen');
            allTasksDiv.classList.remove('chosen');
            importantDiv.classList.remove('chosen');
            overdueDiv.classList.remove('chosen');
        }

        if (classFindParentContainer(target, 'addTask')) {
            //addTask;
        } else if (idFindParentContainer(target, 'today')) {
            removeChosenFromClasslist();
            todayDiv.classList.add('chosen');
        } else if (idFindParentContainer(target, 'nextSevenDays')) {
            removeChosenFromClasslist();
            nextSevenDaysDiv.classList.add('chosen');
        } else if (idFindParentContainer(target, 'allTasks')) {
            removeChosenFromClasslist();
            allTasksDiv.classList.add('chosen');
        } else if (idFindParentContainer(target, 'important')) {
            removeChosenFromClasslist();
            importantDiv.classList.add('chosen');
        } else if (idFindParentContainer(target, 'overdue')) {
            removeChosenFromClasslist();
            overdueDiv.classList.add('chosen');
        }
    })

}