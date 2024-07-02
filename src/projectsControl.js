import {
  currentTimeFormatted,
  currentDate,
  currentDateFormatted,
  nextSundayFormatted,
} from './time.js';
import { ProjectTask, Project } from './basicClass.js';
import { GroceryListTemplate } from './GroceryListTemplate.js';
import { ReadingListTemplate } from './ReadingListTemplate.js';
import { WeeklyReviewTemplate } from './WeeklyReviewTemplate.js';
import {
  projectsControlPanel,
  removeChosenFromClasslist,
} from './removeChosenFromClasslist.js';
import { idFindParentContainer } from './findParentContainer.js';

const templatesArr = [
  WeeklyReviewTemplate,
  GroceryListTemplate,
  ReadingListTemplate,
];
const templateIdList = [];
templatesArr.forEach((template) =>
  templateIdList.push(template.title.replace(/\s/g, ''))
);

const projectsArrJson = localStorage.getItem('projectsArr');
const projectsArr = projectsArrJson
  ? JSON.parse(projectsArrJson).map(
      (projectObj) =>
        new Project(
          projectObj.title,
          projectObj.defaultGroupNames,
          projectObj.projectTasksArr.map(
            (projectTaskObj) =>
              new ProjectTask(
                projectTaskObj.title,
                projectTaskObj.description,
                projectTaskObj.dueDateFormatted,
                projectTaskObj.checkStatus,
                projectTaskObj.recurringCycle,
                projectTaskObj.importance,
                projectTaskObj.groupName
              )
          ),
          projectObj.timeCreated
        )
    )
  : [];

export const initiateProjectsArr = () => {
  if (!projectsArrJson) {
    const initialProjectTask1 = new ProjectTask(
      'Weekly Review',
      'Do a weekly review of my tasks and goals on Sunday.',
      nextSundayFormatted(),
      'notChecked',
      7,
      'important',
      'Routines'
    );
    const initialProjectTask2 = new ProjectTask(
      'Add more personal routines',
      'e.g.: pay taxes yearly, empty the bins weekly, meditate for 10 mins ev weekday at 9am.',
      currentDateFormatted(),
      'notChecked',
      7,
      'notImportant',
      'Routines'
    );
    const initialProjectTask3 = new ProjectTask(
      'Create your first project',
      'Use "Quick Start Templates" to create your first project.',
      currentDateFormatted(),
      'notChecked',
      0,
      'notImportant',
      'Inspiration'
    );
    const home = new Project('Home', '', [
      initialProjectTask1,
      initialProjectTask2,
      initialProjectTask3,
    ]);
    projectsArr.push(home);
    localStorage.setItem('projectsArr', JSON.stringify(projectsArr));
  }
};
initiateProjectsArr();

class ProjectsNodeManager {
  constructor(element) {
    this.element = element;
  }

  get project() {
    const activePanel = Array.from(projectsControlPanel.children).find(
      (panel) => panel.classList.contains('chosen')
    );
    if (activePanel) {
      const id = activePanel.id;
      return projectsArr.find((project) => project.id == id);
    } else {
      return projectsArr[projectsArr.length - 1];
    }
  }

  createProjectTaskNode(projectTask) {
    const projectTaskNode = document.createElement('div');
    projectTaskNode.classList.add(
      'task',
      `${projectTask.checkStatus}`,
      `${projectTask.importance}`
    );
    projectTaskNode.setAttribute('id', `${projectTask.id}`);
    const rescheduleUrl = require('./assets/images/refresh-cw.svg');
    const editUrl = require('./assets/images/edit.svg');
    const starUrl = require('./assets/images/star.svg');
    const checkUrl = require('./assets/images/check-square.svg');
    const deleteUrl = require('./assets/images/trash-2.svg');

    projectTaskNode.innerHTML = `
            <div class="iconButtonContainer">
                <img class="rescheduleButton" style="display:none" src="${rescheduleUrl}" alt="edit">
                <img class="editButton" src="${editUrl}" alt="edit">
                <img class="likeButton" src="${starUrl}" alt="star">
                <img class="checkButton" src="${checkUrl}" alt="check-square">
                <img class="deleteButton" src="${deleteUrl}" alt="trash-2">
            </div>
            <p class="title">
                <span class="tag">Title:</span>
                <span class="content" contentEditable=false tabindex="-1">${projectTask.title}</span>
            </p>
            <p class="description">
                <span class="tag">Description:</span>
                <span class="content" contentEditable=false>${projectTask.description}</span>
            </p>
            <p class="dueDate">
                <span class="tag">DueDate:</span>
                <span class="content">${projectTask.dueDateFormattedEEEE}</span>
            </p>
            <p class="recurringCycle">
                <span class="tag">RecurringCycle: </span>
                <span class="content">Every ${projectTask.recurringCycle} day(s)</span>
            </p>
            <div class="buttonContainer hidden">
                <button class="submit">Submit</button>
                <button class="cancel">Cancel</button>
            </div>`;

    const rescheduleButton = projectTaskNode.querySelector('.rescheduleButton');
    rescheduleButton.style.display =
      projectTask.recurringCycle == 0 ? 'block' : 'none';

    const descriptionNode = projectTaskNode.querySelector('.description');
    descriptionNode.style.display =
      projectTask.description == '' ? 'none' : 'block';

    const dueDateNode = projectTaskNode.querySelector('.dueDate');
    if (currentDate() > projectTask.dueDate) {
      dueDateNode.style.background = 'red';
    } else {
      dueDateNode.style.background = 'lightBlue';
    }

    const recurringCycleNode = projectTaskNode.querySelector('.recurringCycle');
    if (projectTask.recurringCycle == 0) {
      recurringCycleNode.classList.add('hidden');
    }

    if (projectTask.checkStatus == 'checked') {
      dueDateNode.style.background = '';
      projectTaskNode.style.background =
        'linear-gradient(to top, var(--color-liner-background) 3px, yellowgreen 3px)';
    }

    return projectTaskNode;
  }

  activateProjectTaskNodeButtonFunctions(projectTaskNode) {
    const iconButtonContainer = projectTaskNode.querySelector(
      '.iconButtonContainer'
    );
    iconButtonContainer.addEventListener('click', (event) => {
      const findIndexById = (arr, id) => {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].id == id) {
            return i;
          }
        }
        return -1;
      };
      const id = projectTaskNode.id;
      const index = findIndexById(this.project.projectTasksArr, id);
      const target = event.target;
      if (target.classList.contains('rescheduleButton')) {
        this.reschedule(index);
      } else if (target.classList.contains('editButton')) {
        this.edit(projectTaskNode, index);
      } else if (target.classList.contains('likeButton')) {
        this.toggleImportance(index);
      } else if (target.classList.contains('checkButton')) {
        this.toggleCheckStatus(index);
      } else if (target.classList.contains('deleteButton')) {
        this.delete(index);
      }
    });
  }

  buildSkeleton() {
    const project = this.project;
    const addUrl = require('./assets/images/add.svg');
    this.element.innerHTML = `
            <div>
                <div class="titleBar">
                    <h1>${project.title}</h1>
                    <p>${project.finishedProjectTasksCount}</p>
                </div>
                <div class="addTask">
                    <div class="imageContainer">
                        <img src="${addUrl}" alt="addTask">
                    </div>
                    <p>Add task to your project</p>
                </div>
            </div>`;

    const groups = project.groups;
    groups.forEach((group) => {
      const groupNode = document.createElement('div');
      // groupNode.classList.add(`${group.groupName}`);
      groupNode.innerHTML = `
                <div class="titleBar">
                    <h2>${group.groupName}</h2>
                    <p>${group.groupTasksCount}</p>
                </div>`;
      group.projectTasks.forEach((projectTasks) => {
        const projectTasksNode = this.createProjectTaskNode(projectTasks);
        this.activateProjectTaskNodeButtonFunctions(projectTasksNode);
        groupNode.appendChild(projectTasksNode);
      });
      this.element.appendChild(groupNode);
    });
  }

  activateAddTaskButtonFunction() {
    const addTask = this.element.querySelector('.addTask');
    addTask.addEventListener('click', () => {
      const dialog = document.createElement('dialog');
      dialog.classList.add('addProjectTaskDialog');
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
                    <div class="group">
                        <div>
                            <label for="Group">Group:</label>
                            <select id="Group">
                                <option value="" disabled selected>Select a group</option>
                            </select>
                        </div>
                        <div class="customOption" style="display:none">
                            <label for="CustomGroup">New group:</label>
                            <input type="text" id="CustomGroup" name="CustomGroup">
                        </div>
                    </div>
                </fieldset>
                <div>
                    <button type="submit">Submit</button>
                </div>
                <div class="cancelButtonContainer">
                    <img class="cancel" src="${cancelUrl}" alt="cancel">
                </div>
            </form>`;

      const groupNode = dialog.querySelector('.group');
      const selectNode = groupNode.querySelector('select');
      const customOptionContainer = groupNode.querySelector('.customOption');
      const optionsArr = [];
      this.project.groupNames.forEach((groupName) =>
        optionsArr.push(groupName)
      );
      optionsArr.forEach((optionText) => {
        const optionNode = document.createElement('option');
        optionNode.value = optionText;
        optionNode.textContent = optionText;
        selectNode.appendChild(optionNode);
      });
      const newGroup = document.createElement('option');
      newGroup.value = 'New Group';
      newGroup.textContent = 'New Group';
      selectNode.appendChild(newGroup);
      selectNode.addEventListener('change', (event) => {
        if (event.target.value === 'New Group') {
          customOptionContainer.style.display = 'flex';
        } else {
          customOptionContainer.style.display = 'none';
        }
      });

      const body = document.body;
      body.appendChild(dialog);
      dialog.showModal();

      const cancel = dialog.querySelector('.cancel');
      cancel.addEventListener('click', () => {
        dialog.close();
        body.removeChild(dialog);
      });

      const inputs = dialog.querySelectorAll('input');
      inputs.forEach((input) => {
        input.addEventListener('input', () => {
          if (input.value) {
            input.classList.remove('inValid');
          }
        });
      });

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
      });

      const submit = dialog.querySelector('button');
      submit.addEventListener('click', (event) => {
        let allValid = true;
        inputs.forEach((input) => {
          if (
            !input.value &&
            (input.id !== 'CustomGroup' ||
              (input.id == 'CustomGroup' &&
                input.parentNode.style.display == 'flex'))
          ) {
            event.preventDefault();
            allValid = false;
            input.classList.add('inValid');
          }
        });
        if (selectNode.value == '') {
          event.preventDefault();
          selectNode.classList.add('inValid');
          allValid = false;
        }
        if (allValid == true) {
          const titleInput = dialog.querySelector('#Title').value;
          const descriptionInput = dialog.querySelector('#Description').value;
          const dueDateFormattedInput = dialog.querySelector('#DueDate').value;
          const recurringInputNode = dialog.querySelector('#RecurringCycle');
          const recurringInput = recurringInputNode
            ? recurringInputNode.value
            : 0;
          const importanceCheckBox = dialog.querySelector('#Importance');
          const importanceInput =
            importanceCheckBox.checked == true ? 'important' : 'notImportant';
          const customOptionInputNode = groupNode.querySelector('#CustomGroup');
          const groupNameInput =
            selectNode.value == 'New Group'
              ? customOptionInputNode.value
              : selectNode.value;

          const projectTask = new ProjectTask(
            titleInput,
            descriptionInput,
            dueDateFormattedInput,
            'notChecked',
            Number(recurringInput),
            importanceInput,
            groupNameInput
          );
          projectManger.add(projectTask);
          dialog.close();
          body.removeChild(dialog);
        }
      });
    });
  }

  update() {
    this.project.projectTasksArr.forEach((projectTask) =>
      projectTask.checkAndUpdate()
    );
    localStorage.setItem('projectsArr', JSON.stringify(projectsArr));
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
    this.buildSkeleton();
    this.activateAddTaskButtonFunction();
  }

  add(projectTask) {
    this.project.projectTasksArr.push(projectTask);
    this.update();
  }

  reschedule(index) {
    const projectTasksArr = this.project.projectTasksArr;
    if (projectTasksArr[index].dueDate < currentDate()) {
      projectTasksArr[index].checkStatus = 'notChecked';
      projectTasksArr[index].dueDateFormatted = currentDateFormatted();
    }
    this.update();
  }

  edit(projectTaskNode, index) {
    const iconButtonContainers = this.element.querySelectorAll(
      '.iconButtonContainer'
    );
    projectTaskNode.classList.add('contentEditable');
    const buttonContainer = projectTaskNode.querySelector('.buttonContainer');
    const submit = projectTaskNode.querySelector('.submit');
    const cancel = projectTaskNode.querySelector('.cancel');
    const contents = projectTaskNode.querySelectorAll('p>.content');

    const titleBeingEdited = contents[0];
    titleBeingEdited.setAttribute('contentEditable', true);

    const descriptionBeingEdited = contents[1];
    descriptionBeingEdited.setAttribute('contentEditable', true);

    const projectTasksArr = this.project.projectTasksArr;
    const dueDateNodeBeingEdited = contents[2];
    dueDateNodeBeingEdited.innerHTML = `<input type="date" value="${projectTasksArr[index].dueDateFormatted}"></input>`;

    const recurringCycleBeingEdited = contents[3];
    recurringCycleBeingEdited.parentNode.classList.remove('hidden');
    recurringCycleBeingEdited.innerHTML = `<span>Every </span><input type="number" min=0 max=999 value="${projectTasksArr[index].recurringCycle}"></input><span> day(s)</span>`;

    iconButtonContainers.forEach((iconButtonContainer) =>
      iconButtonContainer.classList.add('blank')
    );
    buttonContainer.classList.remove('hidden');

    submit.addEventListener('click', () => {
      contents.forEach((content) =>
        content.setAttribute('contentEditable', false)
      );

      projectTasksArr[index].title = titleBeingEdited.textContent;
      titleBeingEdited.setAttribute('contentEditable', false);

      projectTasksArr[index].description = descriptionBeingEdited.textContent;
      descriptionBeingEdited.setAttribute('contentEditable', false);

      projectTasksArr[index].dueDateFormatted =
        dueDateNodeBeingEdited.firstChild.value;

      projectTasksArr[index].recurringCycle = parseInt(
        recurringCycleBeingEdited.children[1].value
      );

      iconButtonContainers.forEach((iconButtonContainer) =>
        iconButtonContainer.classList.remove('blank')
      );
      buttonContainer.classList.add('hidden');

      this.update();
    });

    cancel.addEventListener('click', () => {
      this.update();
    });
  }

  delete(index) {
    this.project.projectTasksArr.splice(index, 1);
    this.update();
  }

  toggleCheckStatus(index) {
    const toggledProjectTask = this.project.projectTasksArr[index];
    toggledProjectTask.checkStatus =
      toggledProjectTask.checkStatus == 'checked' ? 'notChecked' : 'checked';
    this.update();
  }

  toggleImportance(index) {
    const toggledProjectTask = this.project.projectTasksArr[index];
    toggledProjectTask.importance =
      toggledProjectTask.importance == 'important'
        ? 'notImportant'
        : 'important';
    this.update();
  }
}

const contentContainer = document.querySelector('.contentContainer');
export const projectManger = new ProjectsNodeManager(contentContainer);

export const projectsControl = () => {
  const createProjectDivNode = (project) => {
    const editUrl = require('./assets/images/edit.svg');
    const chevronsURL = require('./assets/images/chevrons-left.svg');
    const deleteUrl = require('./assets/images/trash-2.svg');
    const projectUrl = require('./assets/images/project.svg');
    const projectDiv = document.createElement('div');
    projectDiv.innerHTML = `
            <div class="projectTitle">
                <div class="imageContainer">
                    <img src="${projectUrl}" alt="project">
                </div>
                <p contentEditable=false></p>
            </div>
            <div class="iconButtonContainer">
                <img class="editButton" style="display: none" src="${editUrl}" alt="edit">
                <img class="deleteButton" style="display: none" src="${deleteUrl}" alt="trash-2">
                <img class="chevronButton" src="${chevronsURL}" alt="edit">
            </div>`;

    projectDiv.classList.add('project');
    projectDiv.setAttribute('id', project.id);
    projectDiv.querySelector('p').textContent = project.title
      ? project.title
      : `My project ${projectsArr.length}`;
    return projectDiv;
  };

  const autoClick = (projectDiv) => {
    const iconButtonContainer = projectDiv.querySelector(
      '.iconButtonContainer'
    );
    const editButton = iconButtonContainer.children[0];
    const deleteButton = iconButtonContainer.children[1];
    const chevronButton = iconButtonContainer.children[2];
  };

  const activateProjectDivButtonFunctions = (projectDiv) => {
    const addProject = projectsControlPanel.querySelector('.addProject');
    addProject.style.display = 'block';

    const iconButtonContainer = projectDiv.querySelector(
      '.iconButtonContainer'
    );
    const editButton = iconButtonContainer.children[0];
    const deleteButton = iconButtonContainer.children[1];
    const chevronButton = iconButtonContainer.children[2];
    const projectTitleBeingEdited = projectDiv.querySelector('p');
    const getIndex = () =>
      projectsArr.findIndex((project) => project.id == projectDiv.id);
    let index = getIndex();

    const handleEditButtonClick = () => {
      projectDiv.classList.add('contentEditable');
      projectTitleBeingEdited.setAttribute('contentEditable', true);
    };

    const handleDeleteButtonClick = () => {
      projectsArr.splice(index, 1);
      localStorage.setItem('projectsArr', JSON.stringify(projectsArr));
      projectsControlPanel.removeChild(projectDiv);
      location.reload();
    };

    const handleDocumentClick = (event) => {
      if (!projectDiv.contains(event.target)) {
        projectDiv.classList.remove('contentEditable');
        projectTitleBeingEdited.setAttribute('contentEditable', false);
        editButton.style.display = 'none';
        deleteButton.style.display = 'none';

        index = getIndex();
        if (index !== -1) {
          projectsArr[index].title = projectTitleBeingEdited.textContent;
          projectDiv.id = projectsArr[index].id;
          localStorage.setItem('projectsArr', JSON.stringify(projectsArr));
          updateProjectsControlPanel();
          projectManger.update();
        }

        document.removeEventListener('click', handleDocumentClick);
        editButton.removeEventListener('click', handleEditButtonClick);
        deleteButton.removeEventListener('click', handleDeleteButtonClick);
      }
    };

    chevronButton.addEventListener('click', () => {
      editButton.style.display =
        editButton.style.display == 'block' ? 'none' : 'block';
      deleteButton.style.display =
        deleteButton.style.display == 'block' ? 'none' : 'block';

      if (editButton.style.display == 'block') {
        editButton.addEventListener('click', handleEditButtonClick);
        deleteButton.addEventListener('click', handleDeleteButtonClick);
        document.addEventListener('click', handleDocumentClick);
      }
    });

    if (projectDiv.id == projectsArr[index].timeCreated) {
      setTimeout(() => {
        addProject.style.display = 'none';
        chevronButton.click();
        editButton.click();
        projectTitleBeingEdited.focus();
      }, 0);
    }
  };

  const buildProjectsControlPanel = () => {
    projectsArr.forEach((project) => {
      const projectDiv = createProjectDivNode(project);
      activateProjectDivButtonFunctions(projectDiv);
      projectsControlPanel.appendChild(projectDiv);
    });
  };

  const updateProjectsControlPanel = () => {
    projectsArr.forEach((project) =>
      project.projectTasksArr.forEach((projectTask) =>
        projectTask.checkAndUpdate()
      )
    );
    const projectSidebarTitle =
      projectsControlPanel.querySelector('.sidebarTitle');
    const chosenNode = projectsControlPanel.querySelector('.chosen');
    const id = chosenNode ? chosenNode.id : projectsControlPanel.lastChild.id;
    while (projectsControlPanel.lastChild !== projectSidebarTitle) {
      projectsControlPanel.removeChild(projectsControlPanel.lastChild);
    }
    buildProjectsControlPanel();
    if (id) {
      const newChosenNode = document.getElementById(id);
      if (newChosenNode) {
        newChosenNode.classList.add('chosen');
      }
    }
  };
  updateProjectsControlPanel();

  const addProjectButton = projectsControlPanel.querySelector('.addProject');
  const addProject = (project) => {
    projectsArr.push(project);
    localStorage.setItem('projectsArr', JSON.stringify(projectsArr));
    updateProjectsControlPanel();
  };

  projectsControlPanel.addEventListener('click', (event) => {
    const target = event.target;
    const projectIdList = [];
    projectsArr.forEach((project) => projectIdList.push(project.id));
    if (target == addProjectButton) {
      addProject(new Project(''));
    } else {
      projectIdList.forEach((id) => {
        const projectDiv = idFindParentContainer(target, id);
        if (projectDiv) {
          removeChosenFromClasslist();
          projectDiv.classList.add('chosen');
          projectManger.update();
        }
      });
    }
  });

  const templatesPanel = document.querySelector('.sidebar>.templates');
  templatesPanel.addEventListener('click', (event) => {
    const target = event.target;
    templateIdList.forEach((id) => {
      const templateDiv = idFindParentContainer(target, id);
      if (templateDiv) {
        const template = templatesArr.find(
          (template) => template.title.replace(/\s/g, '') == id
        );
        const _ = require('lodash');
        const project = _.cloneDeep(template);
        project.title = 'My ' + project.title;
        project.timeCreated = currentTimeFormatted();
        addProject(project);
        const projectDiv = projectsControlPanel.lastChild;
        projectDiv.click();
      }
    });
  });
};
