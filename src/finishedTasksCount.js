export const finishedTasksCount = (tasksArr) => {
    const totalCount = tasksArr.length;
    const finishedCount = tasksArr.filter(projectTasks => projectTasks.checkStatus == 'checked').length;
    return finishedCount + '/' + totalCount;
}