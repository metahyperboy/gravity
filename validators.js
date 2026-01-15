// ============================================
// VALIDATORS - Business Rules Enforcement
// ============================================

const Validators = {
  /**
   * Validate Year Goals Setup
   * Rules:
   * - Exactly 3 goals required
   * - Each goal must have: title (min 5 chars), why (min 10 chars), success criteria
   */
  validateYearGoals(goals) {
    const errors = [];

    if (!goals || goals.length !== 3) {
      errors.push('You must define exactly 3 yearly goals');
      return { valid: false, errors };
    }

    goals.forEach((goal, index) => {
      const goalNum = index + 1;

      if (!goal.title || goal.title.trim().length < 5) {
        errors.push(`Goal ${goalNum}: Title must be at least 5 characters`);
      }

      if (!goal.why || goal.why.trim().length < 10) {
        errors.push(`Goal ${goalNum}: "Why" explanation must be at least 10 characters`);
      }

      if (!goal.successCriteria || goal.successCriteria.trim().length < 10) {
        errors.push(`Goal ${goalNum}: Success criteria must be at least 10 characters`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate Quarter Planning
   * Rules:
   * - Must select 1 primary goal
   * - 3-5 key tasks required
   * - Quarter outcome must be defined
   */
  validateQuarterPlan(quarterData) {
    const errors = [];

    if (!quarterData.primaryGoalId) {
      errors.push('You must select which yearly goal to focus on');
    }

    if (!quarterData.outcome || quarterData.outcome.trim().length < 10) {
      errors.push('Quarter outcome must be at least 10 characters');
    }

    if (!quarterData.keyTasks || quarterData.keyTasks.length < 3) {
      errors.push('You must define at least 3 key tasks');
    }

    if (quarterData.keyTasks && quarterData.keyTasks.length > 5) {
      errors.push('Maximum 5 key tasks allowed - keep it focused');
    }

    // Validate each task is not empty
    if (quarterData.keyTasks) {
      quarterData.keyTasks.forEach((task, index) => {
        if (!task.trim()) {
          errors.push(`Task ${index + 1} cannot be empty`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate Daily Log Entry
   * Rules:
   * - Work description required (min 5 chars)
   * - Quarter goal selection required
   * - Effort level required
   * - Proactiveness score required (1-5)
   */
  validateDailyLog(logData) {
    const errors = [];

    if (!logData.work || logData.work.trim().length < 5) {
      errors.push('Work description must be at least 5 characters');
    }

    if (!logData.quarterGoalId && logData.quarterGoalId !== 'distraction') {
      errors.push('You must select which goal this work supports');
    }

    if (!logData.effortLevel) {
      errors.push('You must select an effort level');
    }

    if (!logData.proactivenessScore || logData.proactivenessScore < 1 || logData.proactivenessScore > 5) {
      errors.push('Proactiveness score must be between 1 and 5');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate Weekly Reflection
   * Rules:
   * - All three questions must be answered
   * - Minimum length for thoughtful responses
   */
  validateWeeklyReflection(reflectionData) {
    const errors = [];

    if (!reflectionData.forward || reflectionData.forward.trim().length < 10) {
      errors.push('Please describe what moved your goal forward (min 10 characters)');
    }

    if (!reflectionData.wasted || reflectionData.wasted.trim().length < 5) {
      errors.push('Please identify what wasted time (min 5 characters)');
    }

    if (!reflectionData.stopDoing || reflectionData.stopDoing.trim().length < 5) {
      errors.push('Please identify what to stop doing (min 5 characters)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate goal edit request
   * Requires confirmation since goals shouldn't be casually changed
   */
  confirmGoalEdit() {
    return confirm(
      '⚠️ WARNING: Changing your yearly goals mid-year can disrupt your focus.\n\n' +
      'Are you absolutely certain you want to edit your core goals?'
    );
  },

  /**
   * Validate quarter lock
   * Once a quarter is started, it cannot be edited
   */
  canEditQuarter(quarter) {
    if (quarter.locked) {
      return {
        allowed: false,
        message: 'This quarter has already started and cannot be edited. Stay committed to your focus.'
      };
    }
    return { allowed: true };
  },

  /**
   * Check if user can start a new quarter
   */
  canStartQuarter(quarterNumber, quarters) {
    // Must complete previous quarters in order
    if (quarterNumber > 1) {
      const prevQuarter = quarters.find(q => q.number === quarterNumber - 1);
      if (!prevQuarter || !prevQuarter.locked) {
        return {
          allowed: false,
          message: `You must complete Quarter ${quarterNumber - 1} planning first`
        };
      }
    }

    const currentQuarter = quarters.find(q => q.number === quarterNumber);
    if (currentQuarter && currentQuarter.locked) {
      return {
        allowed: false,
        message: 'This quarter has already been started'
      };
    }

    return { allowed: true };
  }
};
