// ============================================
// APP.JS - Core Application Logic
// Personal Goal & Work Alignment App
// ============================================

// ========== DATA STORAGE KEY ==========
const STORAGE_KEY = 'goal_alignment_app_data';

// ========== STATE ==========
let appState = {
    yearGoals: [],
    quarters: [],
    dailyLogs: [],
    weeklyReflections: [],
    setupComplete: false,
    currentView: 'setup'
};

// ========== INITIALIZATION ==========
function initializeApp() {
    loadData();

    // Determine which view to show
    if (!appState.setupComplete) {
        navigateTo('setup');
    } else {
        // Check for weekly reflection
        if (Calculations.shouldPromptWeeklyReflection(appState.weeklyReflections)) {
            showWeeklyReflectionModal();
        }
        navigateTo('today');
    }

    renderApp();
}

// ========== DATA PERSISTENCE ==========
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function loadData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            appState = JSON.parse(stored);
        } catch (e) {
            console.error('Failed to load data:', e);
        }
    }
}

function exportData() {
    const dataStr = JSON.stringify(appState, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `goal-alignment-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    alert('✅ Data exported successfully!');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);

                if (confirm('⚠️ This will replace all current data. Are you sure?')) {
                    appState = importedData;
                    saveData();
                    location.reload();
                }
            } catch (err) {
                alert('❌ Invalid file format');
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

function resetApp() {
    const confirm1 = confirm('⚠️ WARNING: This will delete ALL your data. Are you absolutely sure?');
    if (!confirm1) return;

    const confirm2 = confirm('⚠️ FINAL WARNING: This cannot be undone. Continue?');
    if (!confirm2) return;

    const confirm3 = prompt('Type "DELETE ALL DATA" to confirm:');
    if (confirm3 === 'DELETE ALL DATA') {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    } else {
        alert('Reset cancelled');
    }
}

// ========== NAVIGATION ==========
function navigateTo(viewName) {
    appState.currentView = viewName;

    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Show selected view
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
        targetView.classList.add('active');
    }

    // Update bottom nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === viewName) {
            item.classList.add('active');
        }
    });

    // Hide bottom nav on setup view
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        bottomNav.style.display = appState.setupComplete ? 'flex' : 'none';
    }

    // Render the view
    renderView(viewName);
}

// ========== RENDER FUNCTIONS ==========
function renderApp() {
    // Initial render happens in HTML, this function is for updates
    renderView(appState.currentView);
}

function renderView(viewName) {
    switch (viewName) {
        case 'setup':
            renderSetupView();
            break;
        case 'quarters':
            renderQuartersView();
            break;
        case 'today':
            renderTodayView();
            break;
        case 'dashboard':
            renderDashboardView();
            break;
        case 'settings':
            renderSettingsView();
            break;
    }
}

// ========== SETUP VIEW ==========
function renderSetupView() {
    // Goals are managed via form inputs in HTML
    // This function can add dynamic validation feedback
}

function submitYearGoals() {
    const goals = [];

    for (let i = 1; i <= 3; i++) {
        goals.push({
            id: `goal-${Date.now()}-${i}`,
            title: document.getElementById(`goal-${i}-title`).value,
            why: document.getElementById(`goal-${i}-why`).value,
            successCriteria: document.getElementById(`goal-${i}-success`).value,
            createdAt: new Date().toISOString()
        });
    }

    const validation = Validators.validateYearGoals(goals);

    if (!validation.valid) {
        alert('❌ Please fix the following:\n\n' + validation.errors.join('\n'));
        return;
    }

    const confirmed = confirm(
        '🎯 These 3 goals will guide your entire year.\n\n' +
        'Ready to commit?\n\n' +
        'You can edit them later, but it requires intentional confirmation.'
    );

    if (confirmed) {
        appState.yearGoals = goals;
        appState.setupComplete = true;
        saveData();

        // Show success message
        alert('✅ Year goals locked! Now let\'s plan Quarter 1.');

        // Initialize Q1
        navigateTo('quarters');
    }
}

// ========== QUARTERS VIEW ==========
function renderQuartersView() {
    const container = document.getElementById('quarters-container');
    const currentQuarterNum = Calculations.getCurrentQuarterNumber();

    // Determine which quarter to show
    let activeQuarter = appState.quarters.find(q => q.number === currentQuarterNum && !q.locked);

    if (!activeQuarter) {
        // Check if we need to plan this quarter
        const quarterExists = appState.quarters.find(q => q.number === currentQuarterNum);
        if (quarterExists && quarterExists.locked) {
            // Quarter already planned, show summary
            container.innerHTML = renderQuarterSummary(quarterExists);
            return;
        }
        // Show planning form for current quarter
        activeQuarter = { number: currentQuarterNum };
    }

    container.innerHTML = renderQuarterPlanningForm(activeQuarter);
}

function renderQuarterPlanningForm(quarter) {
    const goalOptions = appState.yearGoals.map(goal =>
        `<option value="${goal.id}">${goal.title}</option>`
    ).join('');

    return `
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Quarter ${quarter.number} Planning</h2>
        <p class="card-subtitle">${getQuarterDateRange(quarter.number)}</p>
      </div>
      
      <div class="quarter-tabs mb-6">
        ${[1, 2, 3, 4].map(num => {
        const q = appState.quarters.find(qt => qt.number === num);
        let className = 'quarter-tab';
        if (num === quarter.number) className += ' active';
        else if (q && q.locked) className += ' locked';
        return `<div class="${className}">Q${num}</div>`;
    }).join('')}
      </div>
      
      <form id="quarter-form" onsubmit="submitQuarterPlan(event, ${quarter.number})">
        <div class="form-group">
          <label class="form-label">Which yearly goal will you focus on?</label>
          <select id="quarter-goal" class="form-select" required>
            <option value="">Select a goal...</option>
            ${goalOptions}
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">What's the specific outcome for this quarter?</label>
          <textarea id="quarter-outcome" class="form-textarea" 
                    placeholder="Describe a measurable outcome you'll achieve..."
                    required></textarea>
          <span class="form-hint">Be specific and achievable in 90 days</span>
        </div>
        
        <div class="form-group">
          <label class="form-label">Key Tasks (3-5 only)</label>
          <div id="task-list-container"></div>
          <button type="button" class="btn btn-ghost" onclick="addQuarterTask()" 
                  id="add-task-btn">+ Add Task</button>
        </div>
        
        <button type="submit" class="btn btn-large">Start Quarter ${quarter.number}</button>
      </form>
    </div>
  `;
}

function getQuarterDateRange(quarterNum) {
    const year = new Date().getFullYear();
    const ranges = {
        1: `Jan 1 - Mar 31, ${year}`,
        2: `Apr 1 - Jun 30, ${year}`,
        3: `Jul 1 - Sep 30, ${year}`,
        4: `Oct 1 - Dec 31, ${year}`
    };
    return ranges[quarterNum];
}

let quarterTasks = [];

function addQuarterTask() {
    if (quarterTasks.length >= 5) {
        alert('❌ Maximum 5 tasks allowed. Keep it focused!');
        return;
    }

    quarterTasks.push('');
    renderQuarterTasks();
}

function removeQuarterTask(index) {
    quarterTasks.splice(index, 1);
    renderQuarterTasks();
}

function updateQuarterTask(index, value) {
    quarterTasks[index] = value;
}

function renderQuarterTasks() {
    const container = document.getElementById('task-list-container');

    container.innerHTML = quarterTasks.map((task, index) => `
    <div class="task-item">
      <input type="text" class="form-input" 
             value="${task}" 
             onchange="updateQuarterTask(${index}, this.value)"
             placeholder="Task ${index + 1}..."
             required />
      <button type="button" class="task-remove" onclick="removeQuarterTask(${index})">✕</button>
    </div>
  `).join('');

    // Show/hide add button
    const addBtn = document.getElementById('add-task-btn');
    if (addBtn) {
        addBtn.style.display = quarterTasks.length >= 5 ? 'none' : 'block';
    }
}

function submitQuarterPlan(event, quarterNum) {
    event.preventDefault();

    const quarterData = {
        number: quarterNum,
        primaryGoalId: document.getElementById('quarter-goal').value,
        outcome: document.getElementById('quarter-outcome').value,
        keyTasks: quarterTasks.filter(t => t.trim()),
        locked: true,
        startDate: new Date().toISOString()
    };

    const validation = Validators.validateQuarterPlan(quarterData);

    if (!validation.valid) {
        alert('❌ Please fix the following:\n\n' + validation.errors.join('\n'));
        return;
    }

    // Add quarter to state
    const existingIndex = appState.quarters.findIndex(q => q.number === quarterNum);
    if (existingIndex >= 0) {
        appState.quarters[existingIndex] = quarterData;
    } else {
        appState.quarters.push(quarterData);
    }

    saveData();

    alert(`✅ Quarter ${quarterNum} started! Focus on your daily work now.`);
    navigateTo('today');
}

function renderQuarterSummary(quarter) {
    const goal = appState.yearGoals.find(g => g.id === quarter.primaryGoalId);
    const progress = Calculations.calculateQuarterProgress(quarter);

    return `
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Quarter ${quarter.number} (Active)</h2>
        <p class="card-subtitle">${getQuarterDateRange(quarter.number)}</p>
      </div>
      
      <div class="alert alert-info mb-6">
        🔒 This quarter is locked. Stay committed to your focus.
      </div>
      
      <div class="mb-6">
        <h3>Focus Goal</h3>
        <p><strong>${goal ? goal.title : 'Unknown'}</strong></p>
      </div>
      
      <div class="mb-6">
        <h3>Quarter Outcome</h3>
        <p>${quarter.outcome}</p>
      </div>
      
      <div class="mb-6">
        <h3>Key Tasks</h3>
        <ul class="task-list">
          ${quarter.keyTasks.map(task => `
            <li class="task-item">
              <input type="checkbox" class="task-checkbox" />
              <span class="task-text">${task}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      
      <div class="progress-container">
        <div class="progress-label">
          <span>Quarter Progress</span>
          <span>${progress}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>
    </div>
  `;
}

// ========== TODAY (DAILY TRACKER) VIEW ==========
function renderTodayView() {
    const container = document.getElementById('today-container');
    const currentQuarter = getCurrentActiveQuarter();

    if (!currentQuarter) {
        container.innerHTML = `
      <div class="card">
        <p class="text-center">No active quarter. Please plan your quarter first.</p>
        <button class="btn btn-large" onclick="navigateTo('quarters')">Plan Quarter</button>
      </div>
    `;
        return;
    }

    const goal = appState.yearGoals.find(g => g.id === currentQuarter.primaryGoalId);
    const today = new Date().toISOString().split('T')[0];
    const todayLog = appState.dailyLogs.find(log => log.date === today);
    const lastLog = appState.dailyLogs[appState.dailyLogs.length - 1];
    const streak = Calculations.calculateConsistencyStreak(appState.dailyLogs);

    container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Today's Work</h2>
        <p class="card-subtitle">
          Q${currentQuarter.number} Focus: <strong>${goal ? goal.title : 'Unknown'}</strong>
        </p>
      </div>
      
      ${lastLog ? `
        <p class="text-muted mb-4">
          Last logged: ${Calculations.getRelativeTime(lastLog.date)} • 
          Streak: ${streak} day${streak !== 1 ? 's' : ''}
        </p>
      ` : ''}
      
      ${todayLog ? renderTodayLogSummary(todayLog) : renderDailyLogForm(currentQuarter)}
    </div>
  `;
}

function renderDailyLogForm(currentQuarter) {
    const goal = appState.yearGoals.find(g => g.id === currentQuarter.primaryGoalId);

    return `
    <form id="daily-log-form" onsubmit="submitDailyLog(event)">
      <div class="form-group">
        <label class="form-label">What did you work on today?</label>
        <textarea id="log-work" class="form-textarea" rows="3" 
                  placeholder="Brief description of your work..."
                  required></textarea>
      </div>
      
      <div class="form-group">
        <label class="form-label">Which quarter goal does this support?</label>
        <select id="log-goal" class="form-select" onchange="handleGoalSelection()" required>
          <option value="${currentQuarter.primaryGoalId}">${goal ? goal.title : 'Current Quarter Goal'}</option>
          <option value="distraction">None - This was a distraction</option>
        </select>
      </div>
      
      <div id="distraction-warning" class="hidden alert alert-warning mb-4">
        ⚠️ Consider: Does this truly need your time?
      </div>
      
      <div class="form-group">
        <label class="form-label">Effort Level</label>
        <div class="radio-group" id="effort-group">
          <button type="button" class="radio-btn" data-value="low" onclick="selectEffort('low')">Low</button>
          <button type="button" class="radio-btn" data-value="medium" onclick="selectEffort('medium')">Medium</button>
          <button type="button" class="radio-btn" data-value="deep" onclick="selectEffort('deep')">Deep Work</button>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Proactiveness Today (1-5)</label>
        <div class="radio-group" id="proactive-group">
          ${[1, 2, 3, 4, 5].map(num =>
        `<button type="button" class="radio-btn" data-value="${num}" onclick="selectProactiveness(${num})">${num}</button>`
    ).join('')}
        </div>
        <span class="form-hint">1 = Reactive, 5 = Highly Proactive</span>
      </div>
      
      <button type="submit" class="btn btn-large">Log Today</button>
    </form>
  `;
}

let selectedEffort = null;
let selectedProactiveness = null;

function selectEffort(level) {
    selectedEffort = level;
    document.querySelectorAll('#effort-group .radio-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.value === level) {
            btn.classList.add('active');
        }
    });
}

function selectProactiveness(score) {
    selectedProactiveness = score;
    document.querySelectorAll('#proactive-group .radio-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.value) === score) {
            btn.classList.add('active');
        }
    });
}

function handleGoalSelection() {
    const select = document.getElementById('log-goal');
    const warning = document.getElementById('distraction-warning');

    if (select.value === 'distraction') {
        warning.classList.remove('hidden');
    } else {
        warning.classList.add('hidden');
    }
}

function submitDailyLog(event) {
    event.preventDefault();

    const currentQuarter = getCurrentActiveQuarter();
    const goalSelection = document.getElementById('log-goal').value;

    const logData = {
        date: new Date().toISOString().split('T')[0],
        work: document.getElementById('log-work').value,
        quarterGoalId: goalSelection === 'distraction' ? null : goalSelection,
        effortLevel: selectedEffort,
        proactivenessScore: selectedProactiveness,
        isDistraction: goalSelection === 'distraction',
        notes: ''
    };

    const validation = Validators.validateDailyLog(logData);

    if (!validation.valid) {
        alert('❌ Please fix the following:\n\n' + validation.errors.join('\n'));
        return;
    }

    // Check if log for today already exists
    const existingIndex = appState.dailyLogs.findIndex(log => log.date === logData.date);
    if (existingIndex >= 0) {
        appState.dailyLogs[existingIndex] = logData;
    } else {
        appState.dailyLogs.push(logData);
    }

    saveData();

    alert('✅ Logged. Tomorrow\'s focus matters.');

    // Reset form
    selectedEffort = null;
    selectedProactiveness = null;

    renderTodayView();
}

function renderTodayLogSummary(log) {
    const currentQuarter = getCurrentActiveQuarter();
    const goal = appState.yearGoals.find(g => g.id === log.quarterGoalId);

    return `
    <div class="alert alert-info">
      ✅ You've already logged today's work.
    </div>
    
    <div class="mb-4">
      <h4>Today's Work</h4>
      <p>${log.work}</p>
    </div>
    
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">Goal</div>
        <div class="stat-value" style="font-size: var(--font-size-sm);">
          ${log.isDistraction ? '⚠️ Distraction' : (goal ? goal.title : 'Unknown')}
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">Effort</div>
        <div class="stat-value" style="font-size: var(--font-size-base);">
          ${log.effortLevel}
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">Proactiveness</div>
        <div class="stat-value">${log.proactivenessScore}</div>
      </div>
    </div>
    
    <button class="btn btn-large btn-ghost mt-4" onclick="renderTodayView()">Edit Today's Log</button>
  `;
}

// ========== DASHBOARD VIEW ==========
function renderDashboardView() {
    const container = document.getElementById('dashboard-container');
    const currentQuarter = getCurrentActiveQuarter();

    if (!currentQuarter) {
        container.innerHTML = '<p class="text-center">No active quarter data.</p>';
        return;
    }

    const goal = appState.yearGoals.find(g => g.id === currentQuarter.primaryGoalId);
    const quarterProgress = Calculations.calculateQuarterProgress(currentQuarter);
    const alignmentScore = Calculations.calculateAlignmentScore(appState.dailyLogs, currentQuarter.primaryGoalId);
    const alignmentColor = Calculations.getAlignmentColor(alignmentScore);
    const streak = Calculations.calculateConsistencyStreak(appState.dailyLogs);
    const trend = Calculations.calculateProactivenessTrend(appState.dailyLogs);
    const distractionCount = Calculations.calculateDistractionFrequency(appState.dailyLogs);
    const calendarData = Calculations.getCalendarData(appState.dailyLogs);

    container.innerHTML = `
    <h2 class="mb-6">Progress Dashboard</h2>
    
    <!-- Quarter Progress -->
    <div class="card">
      <h3 class="mb-4">Q${currentQuarter.number}: ${goal ? goal.title : 'Unknown'}</h3>
      
      <div class="progress-container">
        <div class="progress-label">
          <span>Quarter Progress</span>
          <span>${quarterProgress}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${quarterProgress}%"></div>
        </div>
      </div>
      
      <p class="text-muted text-center mt-4">
        ${Math.round((100 - quarterProgress) * 0.9)} days remaining
      </p>
    </div>
    
    <!-- Alignment Score -->
    <div class="card">
      <h3 class="mb-4">Alignment Analysis</h3>
      
      <div class="stat-card mb-4" style="grid-column: span 2;">
        <div class="stat-value text-${alignmentColor}">${alignmentScore}%</div>
        <div class="stat-label">Work Aligned with Quarter Goal</div>
      </div>
      
      ${distractionCount > 0 ? `
        <div class="alert alert-warning">
          ⚠️ ${distractionCount} distraction${distractionCount > 1 ? 's' : ''} this week
        </div>
      ` : `
        <div class="alert alert-info">
          ✅ No distractions this week - excellent focus!
        </div>
      `}
    </div>
    
    <!-- Consistency & Proactiveness -->
    <div class="card">
      <h3 class="mb-4">Consistency & Drive</h3>
      
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-value">${streak}</div>
          <div class="stat-label">Day Streak</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-value">${trend.average} ${trend.arrow}</div>
          <div class="stat-label">Proactiveness</div>
        </div>
      </div>
      
      <div class="mt-6">
        <p class="text-muted mb-2" style="font-size: var(--font-size-sm);">Last 30 Days</p>
        <div class="calendar-grid">
          ${calendarData.map(day => `
            <div class="calendar-day ${day.logged ? 'logged' : ''}" 
                 title="${day.date}">
              ${day.day}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ========== SETTINGS VIEW ==========
function renderSettingsView() {
    const container = document.getElementById('settings-container');

    container.innerHTML = `
    <h2 class="mb-6">Settings</h2>
    
    <div class="card">
      <h3 class="mb-4">Your Year Goals</h3>
      ${appState.yearGoals.map((goal, index) => `
        <div class="mb-4">
          <h4>Goal ${index + 1}: ${goal.title}</h4>
          <p class="text-muted"><strong>Why:</strong> ${goal.why}</p>
          <p class="text-muted"><strong>Success:</strong> ${goal.successCriteria}</p>
        </div>
      `).join('')}
      
      <button class="btn btn-ghost" onclick="editYearGoals()">Edit Goals</button>
    </div>
    
    <div class="card">
      <h3 class="mb-4">Data Management</h3>
      
      <button class="btn btn-large mb-4" onclick="exportData()">📥 Export Data</button>
      <button class="btn btn-large btn-secondary mb-4" onclick="importData()">📤 Import Data</button>
      <button class="btn btn-large btn-danger" onclick="resetApp()">🗑️ Reset App</button>
    </div>
    
    <div class="card">
      <h3 class="mb-4">App Philosophy</h3>
      <p class="text-muted">
        This app exists to answer one daily question:
      </p>
      <p class="text-center" style="font-size: var(--font-size-lg); font-weight: 600; margin: var(--space-6) 0;">
        "Did today's work actually move my life goals forward?"
      </p>
      <p class="text-muted">
        If the answer is unclear, it's time to refocus.
      </p>
    </div>
  `;
}

function editYearGoals() {
    if (!Validators.confirmGoalEdit()) {
        return;
    }

    // For simplicity, redirect to setup with pre-filled data
    alert('Goal editing feature: Re-enter your goals below. They will replace the current ones.');

    // Prefill the setup form
    appState.setupComplete = false;
    navigateTo('setup');

    setTimeout(() => {
        appState.yearGoals.forEach((goal, index) => {
            const num = index + 1;
            document.getElementById(`goal-${num}-title`).value = goal.title;
            document.getElementById(`goal-${num}-why`).value = goal.why;
            document.getElementById(`goal-${num}-success`).value = goal.successCriteria;
        });
    }, 100);
}

// ========== WEEKLY REFLECTION MODAL ==========
function showWeeklyReflectionModal() {
    const modal = document.getElementById('weekly-reflection-modal');
    const currentQuarter = getCurrentActiveQuarter();
    const summary = Calculations.getWeeklySummary(appState.dailyLogs, currentQuarter?.primaryGoalId);

    document.getElementById('reflection-stats').innerHTML = `
    <div class="stat-grid mb-6">
      <div class="stat-card">
        <div class="stat-value">${summary.daysLogged}</div>
        <div class="stat-label">Days Logged</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${summary.alignmentScore}%</div>
        <div class="stat-label">Aligned</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${summary.deepWorkDays}</div>
        <div class="stat-label">Deep Work</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${summary.avgProactiveness}</div>
        <div class="stat-label">Proactiveness</div>
      </div>
    </div>
  `;

    modal.classList.add('active');
}

function submitWeeklyReflection(event) {
    event.preventDefault();

    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const reflectionData = {
        weekStartDate: monday.toISOString().split('T')[0],
        forward: document.getElementById('reflection-forward').value,
        wasted: document.getElementById('reflection-wasted').value,
        stopDoing: document.getElementById('reflection-stop').value,
        createdAt: new Date().toISOString()
    };

    const validation = Validators.validateWeeklyReflection(reflectionData);

    if (!validation.valid) {
        alert('❌ Please answer all questions:\n\n' + validation.errors.join('\n'));
        return;
    }

    appState.weeklyReflections.push(reflectionData);
    saveData();

    document.getElementById('weekly-reflection-modal').classList.remove('active');

    alert('✅ Your insights will shape next week\'s focus.');

    // Reset form
    document.getElementById('weekly-reflection-form').reset();
}

// ========== HELPER FUNCTIONS ==========
function getCurrentActiveQuarter() {
    const currentQuarterNum = Calculations.getCurrentQuarterNumber();
    return appState.quarters.find(q => q.number === currentQuarterNum && q.locked);
}

// ========== INITIALIZE ON LOAD ==========
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();

    // Initialize quarter tasks array
    if (quarterTasks.length === 0) {
        for (let i = 0; i < 3; i++) {
            quarterTasks.push('');
        }
    }

    // Render initial quarter tasks if on quarters view
    if (document.getElementById('task-list-container')) {
        renderQuarterTasks();
    }
});
