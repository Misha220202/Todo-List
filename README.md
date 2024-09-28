# Todo-List

# Overview
* This is a simple and efficient Todo List App that helps users manage their daily tasks. Users can create, edit, delete, and mark tasks as completed. The app is designed to keep track of what needs to be done in a user-friendly manner, ensuring productivity and organization.

# Features
* Add Tasks: Easily add new tasks with a title and optional description.
* Edit Tasks: Modify existing tasks to update their details.
* Delete Tasks: Remove tasks from the list when they are no longer needed.
* Mark Tasks as Completed: Check off tasks that have been completed.
* Filter Tasks: View all tasks, only completed tasks, or only incomplete tasks.
* Persistent Storage: Tasks are saved in the browser's local storage, so they remain available even after the page is reloaded.
* Add projects: Add a new project formed by groups of tasks.
* Responsive Design: The app is designed to work well on both desktop and mobile devices.

# Code Breakdown
### 1. app.js
- **Purpose**: Serves as the main entry point of the application.
- **Functionality**: 
  - Imports styles and necessary modules.
  - Initializes the clock, settings, tasks, and projects controls.
  - Acts as the orchestrator to connect all functionalities.

### 2. basicClass.js
- **Purpose**: Defines the core class for tasks.
- **Functionality**: 
  - Implements the `Task` class, which includes properties such as title, description, due date, priority, and status (completed/uncompleted).
  - Contains methods to manipulate task data.

### 3. projectsControl.js
- **Purpose**: Manages project-related functionalities.
- **Functionality**: 
  - Allows users to create, edit, and delete projects.
  - Facilitates the organization of tasks under different projects.

### 4. settingsControl.js
- **Purpose**: Manages application settings.
- **Functionality**: 
  - Allows users to customize settings such as themes or preferences.
  - Provides a user interface for modifying settings and saving them.

### 5. tasksControl.js
- **Purpose**: Handles task-related functionalities.
- **Functionality**: 
  - Implements functions to add, edit, delete, and mark tasks as complete/incomplete.
  - Manages task categorization and filtering (by date, importance, etc.).

### 6. time.js
- **Purpose**: Manages time-related functionalities.
- **Functionality**: 
  - Implements the `startClock` function to display the current time.
  - Provides date manipulation utilities, possibly using date-fns for enhanced date handling.
