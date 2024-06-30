import { nextSundayFormatted } from './time.js';
import { ProjectTask, Project } from './basicClass.js';

export const WeeklyReviewTemplate = new Project('Weekly Review Template');

const beforeReviewTask1 = new ProjectTask('Process my digital inboxes', 'Email, GitHub, Slack, Etc.', nextSundayFormatted(), 'notChecked', 7, 'notImportant', 'Before my review');
const beforeReviewTask2 = new ProjectTask('Clear off my desk', '', nextSundayFormatted(), 'notChecked', 7, 'notImportant', 'Before my review');
const beforeReviewTask3 = new ProjectTask('Close all distractions - Do Not Disturb mode', '', nextSundayFormatted(), 'notChecked', 7, 'notImportant', 'Before my review');

const weeklyReviewTask1 = new ProjectTask('Review my Next Actions list', '', nextSundayFormatted(), 'notChecked', 7, 'notImportant', 'The weekly review');
const weeklyReviewTask2 = new ProjectTask('Review my Projects list', '', nextSundayFormatted(), 'notChecked', 7, 'notImportant', 'The weekly review');
const weeklyReviewTask3 = new ProjectTask('Review past and upcoming calendar items', '', nextSundayFormatted(), 'notChecked', 7, 'notImportant', 'The weekly review');
const weeklyReviewTask4 = new ProjectTask('Review my Waiting For list', '', nextSundayFormatted(), 'notChecked', 7, 'notImportant', 'The weekly review');

const afterReviewTask1 = new ProjectTask('What went well this week?', '', nextSundayFormatted(), 'notChecked', 7, 'notImportant', 'After my review');
const afterReviewTask2 = new ProjectTask('What could be adjusted?', 'What should I stop doing? Create a task to adjust these items.', nextSundayFormatted(), 'notChecked', 7, 'notImportant', 'After my review');
const afterReviewTask3 = new ProjectTask('What should I start doing?', 'Create a task to plan these items in more detail.', nextSundayFormatted(), 'notChecked', 7, 'notImportant', 'After my review');

WeeklyReviewTemplate.projectTasksArr.push(beforeReviewTask1, beforeReviewTask2, beforeReviewTask3, weeklyReviewTask1, weeklyReviewTask2, weeklyReviewTask3, weeklyReviewTask4, afterReviewTask1, afterReviewTask2, afterReviewTask3);