/**
 * ==============================================================================
 * TASKFLOW DASHBOARD - APPLICATION JAVASCRIPT
 * Modern, responsive to-do management with task metadata, analytics & filtering
 * ==============================================================================
 */

// ==============================================================================
// 1. STATE MANAGEMENT & CONSTANTS
// ==============================================================================

const STORAGE_KEYS = {
    TASKS: "todoTasks",
    THEME: "taskflow_theme"
};

// Application State
const state = {
    tasks: [],
    filters: {
        status: "all",      // 'all' | 'active' | 'completed'
        category: "all",    // 'all' | 'School' | 'Work' | 'Personal' | 'Project' | 'Health'
        priority: "all",    // 'all' | 'High' | 'Medium' | 'Low'
        search: "",
        sortBy: "created-desc" // 'created-desc' | 'created-asc' | 'due-date' | 'priority' | 'alpha'
    },
    theme: "dark"
};

// Priority Weight Mapping for Sorting
const PRIORITY_WEIGHTS = {
    "High": 3,
    "Medium": 2,
    "Low": 1
};

// Category Emojis / Icons
const CATEGORY_ICONS = {
    "School": "🎓",
    "Work": "💼",
    "Personal": "👤",
    "Project": "🚀",
    "Health": "💪"
};


// ==============================================================================
// 2. DOM ELEMENT REFERENCES
// ==============================================================================

const DOM = {
    // Theme
    themeToggleBtn: document.getElementById("themeToggleBtn"),
    htmlRoot: document.documentElement,
    currentDateDisplay: document.getElementById("currentDateDisplay"),

    // Analytics & Metrics
    progressSummaryText: document.getElementById("progressSummaryText"),
    completionPercentage: document.getElementById("completionPercentage"),
    progressBarFill: document.getElementById("progressBarFill"),
    statTotal: document.getElementById("statTotal"),
    statActive: document.getElementById("statActive"),
    statCompleted: document.getElementById("statCompleted"),
    statHighPriority: document.getElementById("statHighPriority"),

    // Form Controls
    taskForm: document.getElementById("taskForm"),
    taskInput: document.getElementById("taskInput"),
    taskPriority: document.getElementById("taskPriority"),
    taskCategory: document.getElementById("taskCategory"),
    taskDueDate: document.getElementById("taskDueDate"),

    // Filtering & Searching
    statusTabs: document.querySelectorAll(".tab-btn"),
    countAll: document.getElementById("countAll"),
    countActive: document.getElementById("countActive"),
    countCompleted: document.getElementById("countCompleted"),
    searchInput: document.getElementById("searchInput"),
    clearSearchBtn: document.getElementById("clearSearchBtn"),
    filterCategory: document.getElementById("filterCategory"),
    filterPriority: document.getElementById("filterPriority"),
    sortBy: document.getElementById("sortBy"),
    clearCompletedBtn: document.getElementById("clearCompletedBtn"),

    // Tasks List & Empty State
    taskList: document.getElementById("taskList"),
    emptyMessage: document.getElementById("emptyMessage"),
    emptyMessageDetail: document.getElementById("emptyMessageDetail")
};


// ==============================================================================
// 3. PERSISTENCE (LOCAL STORAGE)
// ==============================================================================

/**
 * Loads tasks and migrates any older data structure gracefully
 */
function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                state.tasks = parsed
                    .filter(item => item && typeof item.text === "string" && item.text.trim() !== "")
                    .map(item => ({
                        id: item.id ? String(item.id) : (Date.now().toString(36) + Math.random().toString(36).substring(2)),
                        text: item.text.trim(),
                        completed: item.completed === true,
                        priority: ["High", "Medium", "Low"].includes(item.priority) ? item.priority : "Medium",
                        category: ["School", "Work", "Personal", "Project", "Health"].includes(item.category) ? item.category : "Personal",
                        dueDate: typeof item.dueDate === "string" ? item.dueDate : "",
                        createdAt: typeof item.createdAt === "number" ? item.createdAt : Date.now()
                    }));
            }
        }
    } catch (err) {
        console.error("Failed to parse stored tasks:", err);
        state.tasks = [];
    }
}

/**
 * Saves current tasks array to LocalStorage
 */
function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.tasks));
    } catch (err) {
        console.error("Failed to save tasks:", err);
        alert("Browser storage limit reached or cookies disabled.");
    }
}


// ==============================================================================
// 4. THEME MANAGEMENT
// ==============================================================================

function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme === "light" || savedTheme === "dark") {
        state.theme = savedTheme;
    } else {
        // Detect OS preference
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        state.theme = prefersDark ? "dark" : "light";
    }
    applyTheme(state.theme);
}

function applyTheme(theme) {
    state.theme = theme;
    DOM.htmlRoot.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

function toggleTheme() {
    const nextTheme = state.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
}


// ==============================================================================
// 5. DATE DISPLAY & HELPER FUNCTIONS
// ==============================================================================

function updateCurrentDateDisplay() {
    const now = new Date();
    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    DOM.currentDateDisplay.textContent = now.toLocaleDateString(undefined, options);

    // Set minimum date on task due date picker to today
    const todayStr = now.toISOString().split("T")[0];
    DOM.taskDueDate.min = todayStr;
}

/**
 * Formats a due date string into user-friendly status badge info
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {object|null}
 */
function formatDueDateInfo(dateStr) {
    if (!dateStr) return null;

    const [year, month, day] = dateStr.split("-").map(Number);
    const targetDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));

    let label = "";
    let isOverdue = false;
    let isDueToday = false;

    if (diffDays < 0) {
        isOverdue = true;
        label = `Overdue by ${Math.abs(diffDays)}d`;
    } else if (diffDays === 0) {
        isDueToday = true;
        label = "Due Today";
    } else if (diffDays === 1) {
        label = "Due Tomorrow";
    } else if (diffDays < 7) {
        label = `Due in ${diffDays}d`;
    } else {
        label = targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    return { label, isOverdue, isDueToday, rawDate: dateStr };
}


// ==============================================================================
// 6. ANALYTICS & METRICS CALCULATIONS
// ==============================================================================

function updateAnalytics() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completed).length;
    const active = total - completed;
    const highPriority = state.tasks.filter(t => !t.completed && t.priority === "High").length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    // Update Top Numbers
    DOM.statTotal.textContent = total;
    DOM.statActive.textContent = active;
    DOM.statCompleted.textContent = completed;
    DOM.statHighPriority.textContent = highPriority;

    // Update Progress Bar & Pill
    DOM.progressSummaryText.textContent = `${completed} of ${total} tasks completed`;
    DOM.completionPercentage.textContent = `${percentage}%`;
    DOM.progressBarFill.style.width = `${percentage}%`;

    // Update Status Tab Counts
    DOM.countAll.textContent = total;
    DOM.countActive.textContent = active;
    DOM.countCompleted.textContent = completed;
}


// ==============================================================================
// 7. TASK FILTERING & SORTING LOGIC
// ==============================================================================

function getFilteredAndSortedTasks() {
    let result = [...state.tasks];

    // 1. Status Filter
    if (state.filters.status === "active") {
        result = result.filter(t => !t.completed);
    } else if (state.filters.status === "completed") {
        result = result.filter(t => t.completed);
    }

    // 2. Category Filter
    if (state.filters.category !== "all") {
        result = result.filter(t => t.category === state.filters.category);
    }

    // 3. Priority Filter
    if (state.filters.priority !== "all") {
        result = result.filter(t => t.priority === state.filters.priority);
    }

    // 4. Search Filter
    if (state.filters.search.trim() !== "") {
        const query = state.filters.search.toLowerCase().trim();
        result = result.filter(t => t.text.toLowerCase().includes(query));
    }

    // 5. Sorting
    result.sort((a, b) => {
        // Keep completed items at bottom when viewing 'all'
        if (state.filters.status === "all" && a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }

        switch (state.filters.sortBy) {
            case "created-asc":
                return a.createdAt - b.createdAt;
            case "priority":
                return (PRIORITY_WEIGHTS[b.priority] || 0) - (PRIORITY_WEIGHTS[a.priority] || 0);
            case "due-date":
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return a.dueDate.localeCompare(b.dueDate);
            case "alpha":
                return a.text.localeCompare(b.text);
            case "created-desc":
            default:
                return b.createdAt - a.createdAt;
        }
    });

    return result;
}


// ==============================================================================
// 8. RENDERING TASK CARDS & EMPTY STATES
// ==============================================================================

function render() {
    updateAnalytics();

    const filteredTasks = getFilteredAndSortedTasks();
    DOM.taskList.innerHTML = "";

    // Show/Hide Empty State
    if (filteredTasks.length === 0) {
        DOM.emptyMessage.style.display = "flex";
        if (state.tasks.length === 0) {
            DOM.emptyMessageDetail.textContent = "No tasks yet! Add your first to-do item above to get started.";
        } else {
            DOM.emptyMessageDetail.textContent = "No tasks match your current filter and search criteria.";
        }
    } else {
        DOM.emptyMessage.style.display = "none";
    }

    // Render Cards
    const fragment = document.createDocumentFragment();

    filteredTasks.forEach(task => {
        const card = createTaskCardElement(task);
        fragment.appendChild(card);
    });

    DOM.taskList.appendChild(fragment);
}

/**
 * Creates a single task card DOM element
 * @param {object} task
 * @returns {HTMLLIElement}
 */
function createTaskCardElement(task) {
    const li = document.createElement("li");
    li.className = `task-card ${task.completed ? "completed" : ""}`;
    li.dataset.id = task.id;
    li.dataset.priority = task.priority;

    // Left content: Checkbox + Info Block
    const contentWrap = document.createElement("div");
    contentWrap.className = "task-card-content";

    // Custom Checkbox
    const checkWrap = document.createElement("div");
    checkWrap.className = "custom-checkbox-wrapper";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox-input";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark "${task.text}" as ${task.completed ? "incomplete" : "complete"}`);

    const checkIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    checkIcon.setAttribute("class", "task-checkbox-icon");
    checkIcon.setAttribute("width", "13");
    checkIcon.setAttribute("height", "13");
    checkIcon.setAttribute("viewBox", "0 0 24 24");
    checkIcon.setAttribute("fill", "none");
    checkIcon.setAttribute("stroke", "currentColor");
    checkIcon.setAttribute("stroke-width", "3.5");
    checkIcon.setAttribute("stroke-linecap", "round");
    checkIcon.setAttribute("stroke-linejoin", "round");
    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("points", "20 6 9 17 4 12");
    checkIcon.appendChild(polyline);

    checkWrap.appendChild(checkbox);
    checkWrap.appendChild(checkIcon);

    checkbox.addEventListener("change", () => toggleTask(task.id));

    // Info Block (Title + Badges)
    const infoBlock = document.createElement("div");
    infoBlock.className = "task-info-block";

    const titleSpan = document.createElement("span");
    titleSpan.className = "task-text-title";
    titleSpan.textContent = task.text;
    titleSpan.title = "Click to toggle completion";
    titleSpan.addEventListener("click", () => toggleTask(task.id));

    // Badges Row
    const badgesRow = document.createElement("div");
    badgesRow.className = "task-badges-row";

    // 1. Priority Badge
    const priorityBadge = document.createElement("span");
    priorityBadge.className = `badge badge-priority-${task.priority}`;
    priorityBadge.textContent = `${task.priority} Priority`;
    badgesRow.appendChild(priorityBadge);

    // 2. Category Badge
    const catBadge = document.createElement("span");
    catBadge.className = `badge badge-cat-${task.category}`;
    catBadge.textContent = `${CATEGORY_ICONS[task.category] || "📌"} ${task.category}`;
    badgesRow.appendChild(catBadge);

    // 3. Due Date Badge
    if (task.dueDate) {
        const dueInfo = formatDueDateInfo(task.dueDate);
        if (dueInfo) {
            const dueBadge = document.createElement("span");
            let dueClass = "badge badge-due-date";
            if (!task.completed) {
                if (dueInfo.isOverdue) dueClass += " overdue";
                else if (dueInfo.isDueToday) dueClass += " due-today";
            }
            dueBadge.className = dueClass;
            dueBadge.innerHTML = `📅 ${dueInfo.label}`;
            dueBadge.title = `Due date: ${dueInfo.rawDate}`;
            badgesRow.appendChild(dueBadge);
        }
    }

    infoBlock.appendChild(titleSpan);
    infoBlock.appendChild(badgesRow);

    contentWrap.appendChild(checkWrap);
    contentWrap.appendChild(infoBlock);

    // Right Action: Delete Button
    const actionsWrap = document.createElement("div");
    actionsWrap.className = "task-actions";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn-card-action";
    deleteBtn.setAttribute("aria-label", `Delete task: ${task.text}`);
    deleteBtn.title = "Delete task";
    deleteBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        </svg>
    `;

    deleteBtn.addEventListener("click", () => deleteTask(task.id, li));

    actionsWrap.appendChild(deleteBtn);

    li.appendChild(contentWrap);
    li.appendChild(actionsWrap);

    return li;
}


// ==============================================================================
// 9. TASK MUTATIONS (ADD, TOGGLE, DELETE, CLEAR)
// ==============================================================================

/**
 * Handles Task Form Submission
 */
function handleAddTask(e) {
    e.preventDefault();

    const text = DOM.taskInput.value.trim();
    if (!text) {
        DOM.taskInput.focus();
        return;
    }

    const priority = DOM.taskPriority.value;
    const category = DOM.taskCategory.value;
    const dueDate = DOM.taskDueDate.value;

    const newTask = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        text,
        priority,
        category,
        dueDate,
        completed: false,
        createdAt: Date.now()
    };

    // Add to beginning of tasks list
    state.tasks.unshift(newTask);
    saveTasks();
    render();

    // Reset Form Input
    DOM.taskInput.value = "";
    DOM.taskDueDate.value = "";
    DOM.taskInput.focus();
}

/**
 * Toggles task completed status
 * @param {string} taskId
 */
function toggleTask(taskId) {
    const task = state.tasks.find(t => String(t.id) === String(taskId));
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        render();
    }
}

/**
 * Deletes a task with smooth exit animation
 * @param {string} taskId
 * @param {HTMLLIElement} cardElement
 */
function deleteTask(taskId, cardElement) {
    if (cardElement) {
        cardElement.classList.add("removing");
        setTimeout(() => {
            state.tasks = state.tasks.filter(t => String(t.id) !== String(taskId));
            saveTasks();
            render();
        }, 280);
    } else {
        state.tasks = state.tasks.filter(t => String(t.id) !== String(taskId));
        saveTasks();
        render();
    }
}

/**
 * Clears all completed tasks
 */
function clearCompletedTasks() {
    const completedCount = state.tasks.filter(t => t.completed).length;
    if (completedCount === 0) return;

    if (confirm(`Are you sure you want to remove ${completedCount} completed task${completedCount > 1 ? "s" : ""}?`)) {
        state.tasks = state.tasks.filter(t => !t.completed);
        saveTasks();
        render();
    }
}


// ==============================================================================
// 10. EVENT LISTENERS SETUP
// ==============================================================================

function setupEventListeners() {
    // Form Submission
    DOM.taskForm.addEventListener("submit", handleAddTask);

    // Theme Toggle
    DOM.themeToggleBtn.addEventListener("click", toggleTheme);

    // Status Filter Tabs
    DOM.statusTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            DOM.statusTabs.forEach(t => {
                t.classList.remove("active");
                t.setAttribute("aria-selected", "false");
            });
            tab.classList.add("active");
            tab.setAttribute("aria-selected", "true");
            state.filters.status = tab.dataset.filterStatus;
            render();
        });
    });

    // Search Input
    DOM.searchInput.addEventListener("input", (e) => {
        state.filters.search = e.target.value;
        DOM.clearSearchBtn.style.display = state.filters.search.length > 0 ? "block" : "none";
        render();
    });

    DOM.clearSearchBtn.addEventListener("click", () => {
        DOM.searchInput.value = "";
        state.filters.search = "";
        DOM.clearSearchBtn.style.display = "none";
        DOM.searchInput.focus();
        render();
    });

    // Category Filter Dropdown
    DOM.filterCategory.addEventListener("change", (e) => {
        state.filters.category = e.target.value;
        render();
    });

    // Priority Filter Dropdown
    DOM.filterPriority.addEventListener("change", (e) => {
        state.filters.priority = e.target.value;
        render();
    });

    // Sort Order Dropdown
    DOM.sortBy.addEventListener("change", (e) => {
        state.filters.sortBy = e.target.value;
        render();
    });

    // Clear Completed Button
    DOM.clearCompletedBtn.addEventListener("click", clearCompletedTasks);
}


// ==============================================================================
// 11. APPLICATION INITIALIZATION
// ==============================================================================

function init() {
    initTheme();
    updateCurrentDateDisplay();
    loadTasks();
    setupEventListeners();
    render();
}

// Start application once DOM is loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
