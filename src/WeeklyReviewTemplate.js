import { currentDateFormatted } from './time.js';
import { ProjectTask, Project } from './basicClass.js';

export const WeeklyReviewTemplate = new Project('WeeklyReviewTemplate');

const beforeReviewTask1 = new ProjectTask('Process my digital inboxes', 'Email, GitHub, Slack, Etc.', currentDateFormatted, 7, 'notImportant', 'Before my review');
const beforeReviewTask2 = new ProjectTask('Clear off my desk', '', currentDateFormatted, 7, 'notImportant', 'Before my review');
const beforeReviewTask3 = new ProjectTask('Close all distractions - Do Not Disturb mode', '', currentDateFormatted, 7, 'notImportant', 'Before my review');

const weeklyReviewTask1 = new ProjectTask('Review my Next Actions list', '', currentDateFormatted, 7, 'notImportant', 'The weekly review');
const weeklyReviewTask2 = new ProjectTask('Review my Projects list', '', currentDateFormatted, 7, 'notImportant', 'The weekly review');
const weeklyReviewTask3 = new ProjectTask('Review past and upcoming calendar items', '', currentDateFormatted, 7, 'notImportant', 'The weekly review');
const weeklyReviewTask4 = new ProjectTask('Review my Waiting For list', '', currentDateFormatted, 7, 'notImportant', 'The weekly review');

const afterReviewTask1 = new ProjectTask('What went well this week?', '', currentDateFormatted, 7, 'notImportant', 'After my review');
const afterReviewTask2 = new ProjectTask('What could be adjusted?', 'What should I stop doing? Create a task to adjust these items.', currentDateFormatted, 7, 'notImportant', 'After my review');
const afterReviewTask3 = new ProjectTask('What should I start doing?', 'Create a task to plan these items in more detail.', currentDateFormatted, 7, 'notImportant', 'After my review');

WeeklyReviewTemplate.projectTasksArr.push(beforeReviewTask1, beforeReviewTask2, beforeReviewTask3, weeklyReviewTask1, weeklyReviewTask2, weeklyReviewTask3, weeklyReviewTask4, afterReviewTask1, afterReviewTask2, afterReviewTask3);