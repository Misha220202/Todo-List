import { format, compareAsc } from 'date-fns';
import { currentDate, currentTimeFormatted } from './time.js';
import { finishedTasksCount } from './finishedTasksCount.js';

export class Task {
  constructor(
    title,
    description,
    dueDateFormatted,
    checkStatus,
    recurringCycle = 0,
    importance = 'notImportant'
  ) {
    this.title = title;
    this.description = description;
    this.dueDateFormatted = dueDateFormatted; //"YYYY-MM-DD"
    this.checkStatus = checkStatus;
    this.recurringCycle = recurringCycle; //in Days
    this.importance = importance;
  }

  get dueDate() {
    return new Date(this.dueDateFormatted + 'T00:00:00');
  }

  get dueDateFormattedEEEE() {
    return format(this.dueDate, 'yyyy-MM-dd EEEE');
  }

  get id() {
    return (this.title + this.description + this.dueDateFormatted).replace(
      /\s/g,
      ''
    );
  }

  updateDueDateFormatted() {
    if (this.recurringCycle > 0) {
      const newDueDate = this.dueDate;
      if (this.recurringCycle == 30) {
        // Monthly
        newDueDate.setMonth(newDueDate.getMonth() + 1);
      } else {
        while (newDueDate < currentDate()) {
          newDueDate.setDate(newDueDate.getDate() + this.recurringCycle);
        }
      }
      this.dueDateFormatted = format(newDueDate, 'yyyy-MM-dd');
    }
  }

  updateCheckStatus() {
    if (this.recurringCycle > 0 && currentDate() > this.dueDate) {
      this.checkStatus = 'notChecked';
    }
  }

  checkAndUpdate() {
    if (this.recurringCycle > 0 && currentDate() > this.dueDate) {
      this.updateCheckStatus();
      this.updateDueDateFormatted();
    }
  }
}

export class ProjectTask extends Task {
  constructor(
    title,
    description,
    dueDateFormatted,
    checkStatus,
    recurringCycle = 0,
    importance = 'notImportant',
    groupName = ''
  ) {
    super(
      title,
      description,
      dueDateFormatted,
      checkStatus,
      recurringCycle,
      importance
    );
    this.groupName = groupName;
  }
}

export class Project {
  constructor(title, defaultGroupNames, projectTasksArr = []) {
    this.title = title;
    this.defaultGroupNames = defaultGroupNames;
    this.projectTasksArr = projectTasksArr;
    this.timeCreated = currentTimeFormatted();
  }

  get id() {
    return this.title + this.timeCreated;
  }

  get finishedProjectTasksCount() {
    return finishedTasksCount(this.projectTasksArr);
  }

  get groupNames() {
    const taskGroupNames = this.projectTasksArr.map(
      (projectTask) => projectTask.groupName
    );
    const allGroupNames = [...taskGroupNames];
    if (this.defaultGroupNames) {
      this.defaultGroupNames.forEach((groupName) =>
        allGroupNames.splice(0, 0, groupName)
      );
    }
    return Array.from(new Set(allGroupNames));
  }

  get groups() {
    const groups = [];
    this.groupNames.forEach((groupName) => {
      const projectTasks = this.projectTasksArr.filter(
        (projectTasks) => projectTasks.groupName == groupName
      );
      projectTasks.sort((a, b) => compareAsc(a.dueDate, b.dueDate));
      const groupTasksCount = finishedTasksCount(projectTasks);
      groups.push({ groupName, projectTasks, groupTasksCount });
    });
    return groups;
  }
}

export class User {
  constructor(username, profileUrl, tasksArr = [], projectsArr = []) {
    this.username = username;
    this.profileUrl = profileUrl;
    this.tasksArr = tasksArr;
    this.projectsArr = projectsArr;
  }
}
