import { currentDateFormatted } from './time.js';
import { ProjectTask, Project } from './basicClass.js';

export const GroceryListTemplate = new Project('Grocery List Template');

const essentialsTask1 = new ProjectTask(
  'Fruit and vegetables 🍎',
  'Bananas, 1kg Apples, Oranges, Broccoli, etc.',
  currentDateFormatted(),
  'notChecked',
  0,
  'notImportant',
  'Essentials'
);
const essentialsTask2 = new ProjectTask(
  'Bread, cereal and rice 🍞',
  'Loaf of bread, Rice, Noodles, etc.',
  currentDateFormatted(),
  'notChecked',
  0,
  'notImportant',
  'Essentials'
);
const essentialsTask3 = new ProjectTask(
  'Dairy 🥛',
  'Milk, Yoghurt, Butter, etc.',
  currentDateFormatted(),
  'notChecked',
  0,
  'notImportant',
  'Essentials'
);
const essentialsTask4 = new ProjectTask(
  'Drinks 💧',
  'Sparkling water, Orange juice, etc.',
  currentDateFormatted(),
  'notChecked',
  0,
  'notImportant',
  'Essentials'
);
const essentialsTask5 = new ProjectTask(
  'Household 🏠',
  'Dish soap, Detergent, 20 watt light bulb, etc.',
  currentDateFormatted(),
  'notChecked',
  0,
  'notImportant',
  'Essentials'
);

const optionalTask1 = new ProjectTask(
  'Snack and Candy 🍬',
  'Popcorn, Chocolates, Snack bars, etc.',
  currentDateFormatted(),
  'notChecked',
  0,
  'notImportant',
  'Optional'
);

GroceryListTemplate.projectTasksArr.push(
  essentialsTask1,
  essentialsTask2,
  essentialsTask3,
  essentialsTask4,
  essentialsTask5,
  optionalTask1
);
