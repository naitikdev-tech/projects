// ==========================================
// 1. DOM ELEMENTS (Selection)
// ==========================================
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const taskListElement = document.getElementById('task-list');
const taskCounter = document.getElementById('task-counter');

// ==========================================
// 2. STATE (Data Store in Memory & Local Storage)
// ==========================================
// Check if we have tasks stored in localStorage. If not, default to an empty array.
let tasks = JSON.parse(localStorage.getItem('taskflow_tasks')) || [];

// Helper to save current state array to localStorage
function saveTasks() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
}

// ==========================================
// 3. RENDER FUNCTION
// ==========================================
// This function reads the current state (tasks array) 
// and matches the DOM (HTML) to represent it.
function renderTasks() {
    // Clear the current list contents to avoid duplicating items
    taskListElement.innerHTML = '';

    // If there are no tasks, we can show a placeholder message
    if (tasks.length === 0) {
        taskListElement.innerHTML = `
            <li class="empty-state" style="text-align: center; color: var(--text-muted); padding: 2rem 0; font-size: 0.95rem;">
                No tasks yet. Add one above to get started!
            </li>
        `;
        taskCounter.textContent = '0 tasks';
        return;
    }

    // Loop through the tasks array and create HTML elements for each
    tasks.forEach(task => {
        // Create the list item element
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'task-completed' : ''}`;
        
        // Construct the internal elements of a task item
        li.innerHTML = `
            <div class="task-left">
                <label class="checkbox-container">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                    <span class="checkmark"></span>
                </label>
                <span class="task-content">${escapeHTML(task.text)}</span>
                <span class="priority-badge badge-${task.priority}">${task.priority}</span>
            </div>
            <button class="btn-delete" data-id="${task.id}" aria-label="Delete task">
                <!-- SVG Icon for Trash Can -->
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin='round' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                </svg>
            </button>
        `;

        // Append the configured task item to our list container
        taskListElement.appendChild(li);
    });

    // Update the visual counter
    const activeCount = tasks.filter(t => !t.completed).length;
    taskCounter.textContent = `${activeCount} active task${activeCount !== 1 ? 's' : ''}`;
}

// Utility to escape HTML to prevent Cross-Site Scripting (XSS)
function escapeHTML(str) {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
}

// Initialize the rendering on load
renderTasks();

// ==========================================
// 4. EVENT LISTENERS & FORM HANDLERS
// ==========================================
taskForm.addEventListener('submit', (e) => {
    // 1. Prevent the page from refreshing on form submission
    e.preventDefault();

    // 2. Extract values and sanitize text input
    const text = taskInput.value.trim();
    const priority = prioritySelect.value;

    // 3. Double-check input validation
    if (!text) return;

    // 4. Create a new task object
    const newTask = {
        id: Date.now(), // Unique ID using epoch timestamp
        text: text,
        priority: priority,
        completed: false
    };

    // 5. Update our state (Source of Truth)
    tasks.push(newTask);

    // Save changes to local storage
    saveTasks();

    // 6. Refresh the DOM to reflect state changes
    renderTasks();

    // 7. Clear the form input for the next task
    taskInput.value = '';
    taskInput.focus();
});

// ==========================================
// 5. EVENT DELEGATION (Toggle & Delete)
// ==========================================
taskListElement.addEventListener('click', (e) => {
    // A. Check if user clicked the checkbox (or target matches checkbox input)
    if (e.target.matches('input[type="checkbox"]')) {
        const taskId = parseInt(e.target.getAttribute('data-id'), 10);
        
        // Find the task and toggle its completed state
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = e.target.checked;
            saveTasks();
            renderTasks();
        }
        return;
    }

    // B. Check if user clicked the delete button (or a child of the delete button, like the SVG)
    const deleteButton = e.target.closest('.btn-delete');
    if (deleteButton) {
        const taskId = parseInt(deleteButton.getAttribute('data-id'), 10);
        
        // Filter out the deleted task from our array
        tasks = tasks.filter(t => t.id !== taskId);
        
        // Save updates and render
        saveTasks();
        renderTasks();
    }
});