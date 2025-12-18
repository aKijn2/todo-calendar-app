const API_BASE_URL = 'http://localhost:3000/api';
let currentDate = new Date();
let selectedDate = new Date();
let allTasks = []; // Initialize as empty array to prevent errors

// Retry logic for API calls
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok || response.status === 404) {
                return response;
            }
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (err) {
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                throw err;
            }
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    loadTasks();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    document.getElementById('prevMonth').addEventListener('click', previousMonth);
    document.getElementById('nextMonth').addEventListener('click', nextMonth);
    document.getElementById('todayBtn').addEventListener('click', goToToday);
    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    document.getElementById('taskTitle').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
}

// Calendar Functions
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Update header
    document.getElementById('monthYear').textContent = new Date(year, month).toLocaleString('default', {
        month: 'long',
        year: 'numeric'
    });

    // Clear previous days
    const daysContainer = document.getElementById('calendarDays');
    daysContainer.innerHTML = '';

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createDayElement(day, 'other-month');
        daysContainer.appendChild(dayElement);
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayElement = createDayElement(day, null, date);

        // Check if today
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }

        // Check if selected
        if (date.toDateString() === selectedDate.toDateString()) {
            dayElement.classList.add('selected');
        }

        // Check if has tasks
        const dateStr = formatDate(date);
        if (allTasks.some(task => task.date === dateStr)) {
            dayElement.classList.add('has-tasks');
        }

        dayElement.addEventListener('click', () => selectDate(date));
        daysContainer.appendChild(dayElement);
    }

    // Next month days
    const totalCells = daysContainer.children.length;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, 'other-month');
        daysContainer.appendChild(dayElement);
    }
}

function createDayElement(day, classes = '', date = null) {
    const div = document.createElement('div');
    div.className = `day ${classes || ''}`;
    div.textContent = day;
    return div;
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

function selectDate(date) {
    selectedDate = new Date(date);
    renderCalendar();
    updateSelectedDateDisplay();
    loadTasksForDate();
}

function goToToday() {
    currentDate = new Date();
    selectedDate = new Date();
    renderCalendar();
    updateSelectedDateDisplay();
    loadTasksForDate();
}

function updateSelectedDateDisplay() {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    document.getElementById('selectedDate').textContent = selectedDate.toLocaleDateString('en-US', options);
}

// Task Functions
async function loadTasks() {
    try {
        const response = await fetchWithRetry(`${API_BASE_URL}/tasks`);
        const data = await response.json();
        
        console.log('Loaded tasks from API:', data);
        
        // Handle both successful array responses and error responses
        if (Array.isArray(data)) {
            // Normalize dates to YYYY-MM-DD format
            allTasks = data.map(task => ({
                ...task,
                date: task.date.split('T')[0]  // Extract just the date part
            }));
            console.log('Normalized tasks:', allTasks);
            console.log('Current selected date:', formatDate(selectedDate));
            const tasksForSelectedDate = allTasks.filter(task => task.date === formatDate(selectedDate));
            console.log('Tasks for selected date:', tasksForSelectedDate);
        } else {
            console.error('API error:', data);
            allTasks = [];
        }
        
        renderCalendar();
        loadTasksForDate();
    } catch (err) {
        console.error('Error loading tasks:', err);
        allTasks = [];
    }
}

function loadTasksForDate() {
    const dateStr = formatDate(selectedDate);
    const tasksForDate = allTasks.filter(task => task.date === dateStr);
    renderTasksList(tasksForDate);
}

function renderTasksList(tasks) {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '';

    if (tasks.length === 0) {
        tasksList.innerHTML = '<p class="empty-message">No tasks for this day</p>';
        return;
    }

    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        tasksList.appendChild(taskElement);
    });
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-item ${task.completed ? 'completed' : ''}`;

    const content = document.createElement('div');
    content.className = 'task-content';

    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;

    content.appendChild(title);

    if (task.description) {
        const description = document.createElement('div');
        description.className = 'task-description-text';
        description.textContent = task.description;
        content.appendChild(description);
    }

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const completeBtn = document.createElement('button');
    completeBtn.className = `task-btn complete`;
    completeBtn.textContent = task.completed ? 'Undo' : 'Done';
    completeBtn.addEventListener('click', () => toggleTask(task));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-btn delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(task));

    actions.appendChild(completeBtn);
    actions.appendChild(deleteBtn);

    div.appendChild(content);
    div.appendChild(actions);

    return div;
}

async function addTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();

    if (!title) {
        alert('Please enter a task title');
        return;
    }

    try {
        const dateStr = formatDate(selectedDate);
        console.log('Adding task for date:', dateStr);
        
        const response = await fetchWithRetry(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description,
                date: dateStr,
                completed: false
            })
        });

        const responseData = await response.json();
        console.log('Task added response:', responseData);

        if (response.ok) {
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskDescription').value = '';
            console.log('Reloading tasks...');
            await loadTasks();
        } else {
            console.error('Failed to add task:', responseData);
        }
    } catch (err) {
        console.error('Error adding task:', err);
    }
}

async function toggleTask(task) {
    try {
        const response = await fetchWithRetry(`${API_BASE_URL}/tasks/${task.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...task,
                completed: !task.completed
            })
        });

        if (response.ok) {
            loadTasks();
        }
    } catch (err) {
        console.error('Error toggling task:', err);
    }
}

async function deleteTask(task) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        const response = await fetchWithRetry(`${API_BASE_URL}/tasks/${task.id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadTasks();
        }
    } catch (err) {
        console.error('Error deleting task:', err);
    }
}

// Utility Functions
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Initialize on load
updateSelectedDateDisplay();
