// ============================================
// CALCULATIONS - Alignment & Analytics Engine
// ============================================

const Calculations = {
    /**
     * Calculate alignment score
     * Returns percentage of work aligned with current quarter goal
     */
    calculateAlignmentScore(dailyLogs, currentQuarterGoalId) {
        if (!dailyLogs || dailyLogs.length === 0) {
            return 100; // No data yet = perfect alignment (benefit of doubt)
        }

        const alignedLogs = dailyLogs.filter(log =>
            !log.isDistraction && log.quarterGoalId === currentQuarterGoalId
        );

        return Math.round((alignedLogs.length / dailyLogs.length) * 100);
    },

    /**
     * Get alignment color based on score
     */
    getAlignmentColor(score) {
        if (score >= 80) return 'success';
        if (score >= 50) return 'warning';
        return 'danger';
    },

    /**
     * Count deep work days in a time period
     */
    countDeepWorkDays(dailyLogs, startDate, endDate) {
        return dailyLogs.filter(log => {
            const logDate = new Date(log.date);
            return log.effortLevel === 'deep' &&
                logDate >= startDate &&
                logDate <= endDate;
        }).length;
    },

    /**
     * Calculate distraction frequency for current week
     */
    calculateDistractionFrequency(dailyLogs) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentLogs = dailyLogs.filter(log =>
            new Date(log.date) >= oneWeekAgo
        );

        if (recentLogs.length === 0) return 0;

        return recentLogs.filter(log => log.isDistraction).length;
    },

    /**
     * Calculate proactiveness trend
     * Returns: 'up', 'stable', or 'down' with 7-day average
     */
    calculateProactivenessTrend(dailyLogs) {
        if (dailyLogs.length < 2) {
            return { trend: 'stable', average: 0, arrow: '→' };
        }

        // Get last 7 days and previous 7 days
        const last7Days = dailyLogs.slice(-7);
        const prev7Days = dailyLogs.slice(-14, -7);

        const last7Avg = this.average(last7Days.map(l => l.proactivenessScore));
        const prev7Avg = prev7Days.length > 0
            ? this.average(prev7Days.map(l => l.proactivenessScore))
            : last7Avg;

        let trend = 'stable';
        let arrow = '→';

        if (last7Avg > prev7Avg + 0.3) {
            trend = 'up';
            arrow = '↑';
        } else if (last7Avg < prev7Avg - 0.3) {
            trend = 'down';
            arrow = '↓';
        }

        return {
            trend,
            average: Math.round(last7Avg * 10) / 10,
            arrow
        };
    },

    /**
     * Calculate consistency streak
     * Returns number of consecutive days with entries
     */
    calculateConsistencyStreak(dailyLogs) {
        if (dailyLogs.length === 0) return 0;

        // Sort logs by date descending
        const sortedLogs = [...dailyLogs].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const log of sortedLogs) {
            const logDate = new Date(log.date);
            logDate.setHours(0, 0, 0, 0);

            const diffDays = Math.floor((currentDate - logDate) / (1000 * 60 * 60 * 24));

            if (diffDays === streak) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else if (diffDays > streak) {
                break; // Gap found, streak ends
            }
        }

        return streak;
    },

    /**
     * Calculate quarter progress
     * Returns percentage based on days elapsed and work completion
     */
    calculateQuarterProgress(quarter) {
        if (!quarter || !quarter.startDate) return 0;

        const startDate = new Date(quarter.startDate);
        const now = new Date();
        const quarterDays = 90;

        const daysElapsed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        const timeProgress = Math.min((daysElapsed / quarterDays) * 100, 100);

        return Math.round(timeProgress);
    },

    /**
     * Get weekly summary data for reflection prompt
     */
    getWeeklySummary(dailyLogs, currentQuarterGoalId) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const weekLogs = dailyLogs.filter(log =>
            new Date(log.date) >= oneWeekAgo
        );

        if (weekLogs.length === 0) {
            return {
                daysLogged: 0,
                alignmentScore: 0,
                deepWorkDays: 0,
                avgProactiveness: 0,
                distractionCount: 0
            };
        }

        return {
            daysLogged: weekLogs.length,
            alignmentScore: this.calculateAlignmentScore(weekLogs, currentQuarterGoalId),
            deepWorkDays: weekLogs.filter(l => l.effortLevel === 'deep').length,
            avgProactiveness: Math.round(this.average(weekLogs.map(l => l.proactivenessScore)) * 10) / 10,
            distractionCount: weekLogs.filter(l => l.isDistraction).length
        };
    },

    /**
     * Get calendar data for last 30 days
     * Returns array of dates with logged status
     */
    getCalendarData(dailyLogs) {
        const calendar = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            // FIXED: Use local date string instead of UTC toISOString()
            // This prevents timezone shift that was causing wrong dates
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const hasLog = dailyLogs.some(log => log.date === dateStr);

            // Format display label with month and day
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const displayLabel = `${monthNames[date.getMonth()]} ${date.getDate()}`;

            calendar.push({
                date: dateStr,
                day: date.getDate(),
                displayLabel: displayLabel,
                logged: hasLog
            });
        }

        return calendar;
    },

    /**
     * Determine current quarter based on current date
     */
    getCurrentQuarterNumber() {
        const month = new Date().getMonth(); // 0-11
        return Math.floor(month / 3) + 1; // 1-4
    },

    /**
     * Check if weekly reflection should be prompted
     * Returns true if it's a new week and no reflection exists for this week
     */
    shouldPromptWeeklyReflection(weeklyReflections) {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Get Monday of current week
        const monday = new Date(today);
        monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
        monday.setHours(0, 0, 0, 0);

        const mondayStr = monday.toISOString().split('T')[0];

        // Check if reflection already exists for this week
        const existingReflection = weeklyReflections.find(r =>
            r.weekStartDate === mondayStr
        );

        return !existingReflection;
    },

    /**
     * Helper: Calculate average
     */
    average(numbers) {
        if (numbers.length === 0) return 0;
        return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    },

    /**
     * Format date for display
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    /**
     * Get relative time (e.g., "2 days ago")
     */
    getRelativeTime(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    }
};
