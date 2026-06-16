class VibeTimer {
  constructor() {
    this.display = document.getElementById('display');
    this.startBtn = document.getElementById('startBtn');
    this.pauseBtn = document.getElementById('pauseBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.modeBtns = document.querySelectorAll('.mode-btn');
    this.settingsSections = document.querySelectorAll('.settings-section');
    this.lapsList = document.getElementById('laps-list');
    this.lapsContainer = document.getElementById('laps-container');

    // Timer state
    this.timer = null;
    this.time = 0;
    this.isRunning = false;
    this.mode = 'stopwatch';
    this.laps = [];
    this.pomodoroState = {
      currentSession: 0,
      totalSessions: 4,
      isWorkTime: true,
      workTime: 25 * 60,
      breakTime: 5 * 60,
      longBreakTime: 15 * 60
    };

    // Initialize
    this.initEventListeners();
    this.updateDisplay();
    this.showSettingsForMode();
  }

  initEventListeners() {
    // Mode buttons
    this.modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.mode = btn.dataset.mode;
        this.resetTimer();
        this.showSettingsForMode();
      });
    });

    // Control buttons
    this.startBtn.addEventListener('click', () => this.startTimer());
    this.pauseBtn.addEventListener('click', () => this.pauseTimer());
    this.resetBtn.addEventListener('click', () => this.resetTimer());

    // Countdown inputs
    document.getElementById('hours-input').addEventListener('change', (e) => {
      this.validateInput(e.target, 0, 23);
    });

    document.getElementById('minutes-input').addEventListener('change', (e) => {
      this.validateInput(e.target, 0, 59);
    });

    document.getElementById('seconds-input').addEventListener('change', (e) => {
      this.validateInput(e.target, 0, 59);
    });

    // Pomodoro inputs
    document.getElementById('work-time').addEventListener('change', (e) => {
      this.validateInput(e.target, 1, 60);
      this.pomodoroState.workTime = parseInt(e.target.value) * 60;
    });

    document.getElementById('break-time').addEventListener('change', (e) => {
      this.validateInput(e.target, 1, 30);
      this.pomodoroState.breakTime = parseInt(e.target.value) * 60;
    });

    document.getElementById('long-break-time').addEventListener('change', (e) => {
      this.validateInput(e.target, 1, 60);
      this.pomodoroState.longBreakTime = parseInt(e.target.value) * 60;
    });

    document.getElementById('sessions').addEventListener('change', (e) => {
      this.validateInput(e.target, 1, 10);
      this.pomodoroState.totalSessions = parseInt(e.target.value);
    });
  }

  validateInput(input, min, max) {
    let value = parseInt(input.value);
    if (isNaN(value)) {
      input.value = min;
    } else if (value < min) {
      input.value = min;
    } else if (value > max) {
      input.value = max;
    }
  }

  showSettingsForMode() {
    this.settingsSections.forEach(section => {
      section.classList.remove('active');
    });

    if (this.mode === 'countdown') {
      document.getElementById('countdown-settings').classList.add('active');
    } else if (this.mode === 'pomodoro') {
      document.getElementById('pomodoro-settings').classList.add('active');
      this.lapsContainer.style.display = 'none';
    } else {
      this.lapsContainer.style.display = 'block';
    }
  }

  startTimer() {
    if (this.isRunning) return;

    if (this.mode === 'countdown' && this.time === 0) {
      this.setCountdownTime();
    }

    if (this.mode === 'pomodoro' && this.time === 0) {
      this.startPomodoroSession();
    }

    if (this.time <= 0 && this.mode !== 'stopwatch') return;

    this.isRunning = true;
    this.startBtn.disabled = true;
    this.pauseBtn.disabled = false;

    this.timer = setInterval(() => {
      this.time += this.mode === 'stopwatch' ? 1 : -1;
      this.updateDisplay();

      if (this.mode !== 'stopwatch' && this.time <= 0) {
        this.timeUp();
      }
    }, 1000);
  }

  pauseTimer() {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.startBtn.disabled = false;
    this.pauseBtn.disabled = true;

    clearInterval(this.timer);
  }

  resetTimer() {
    this.pauseTimer();
    this.laps = [];

    if (this.mode === 'stopwatch') {
      this.time = 0;
      this.updateLaps();
    } else if (this.mode === 'countdown') {
      this.time = 0;
    } else if (this.mode === 'pomodoro') {
      this.pomodoroState.currentSession = 0;
      this.pomodoroState.isWorkTime = true;
      this.time = 0;
    }

    this.updateDisplay();
  }

  setCountdownTime() {
    const hours = parseInt(document.getElementById('hours-input').value) || 0;
    const minutes = parseInt(document.getElementById('minutes-input').value) || 0;
    const seconds = parseInt(document.getElementById('seconds-input').value) || 0;

    this.time = hours * 3600 + minutes * 60 + seconds;
    this.updateDisplay();
  }

  startPomodoroSession() {
    this.pomodoroState.currentSession++;

    if (this.pomodoroState.isWorkTime) {
      this.time = this.pomodoroState.workTime;
    } else {
      // Check if it's time for a long break
      if (this.pomodoroState.currentSession % this.pomodoroState.totalSessions === 0) {
        this.time = this.pomodoroState.longBreakTime;
      } else {
        this.time = this.pomodoroState.breakTime;
      }
    }

    this.updateDisplay();
  }

  timeUp() {
    this.pauseTimer();

    if (this.mode === 'pomodoro') {
      // Switch between work and break
      this.pomodoroState.isWorkTime = !this.pomodoroState.isWorkTime;
      this.startPomodoroSession();
      this.startTimer();
    } else {
      // For countdown, just stop
      this.time = 0;
      this.updateDisplay();
    }
  }

  updateDisplay() {
    const hours = Math.floor(this.time / 3600);
    const minutes = Math.floor((this.time % 3600) / 60);
    const seconds = this.time % 60;

    const formattedTime = [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');

    this.display.textContent = formattedTime;

    // Change color based on mode and state
    if (this.mode === 'pomodoro') {
      if (this.pomodoroState.isWorkTime) {
        this.display.style.color = '#ef4444'; // Red for work
      } else {
        this.display.style.color = '#10b981'; // Green for break
      }
    } else {
      this.display.style.color = '#1e293b'; // Default color
    }
  }

  recordLap() {
    if (!this.isRunning || this.mode !== 'stopwatch') return;

    this.laps.push(this.time);
    this.updateLaps();
  }

  updateLaps() {
    this.lapsList.innerHTML = '';

    if (this.laps.length === 0) {
      this.lapsList.innerHTML = '<div class="lap-item">No laps recorded yet</div>';
      return;
    }

    // Calculate lap times (difference between consecutive laps)
    const lapTimes = [];
    for (let i = 0; i < this.laps.length; i++) {
      if (i === 0) {
        lapTimes.push(this.laps[i]);
      } else {
        lapTimes.push(this.laps[i] - this.laps[i - 1]);
      }
    }

    // Display laps in reverse order (most recent first)
    for (let i = this.laps.length - 1; i >= 0; i--) {
      const lapItem = document.createElement('div');
      lapItem.className = 'lap-item';

      const lapNumber = document.createElement('span');
      lapNumber.className = 'lap-number';
      lapNumber.textContent = `Lap ${this.laps.length - i}`;

      const lapTime = document.createElement('span');
      lapTime.className = 'lap-time';
      lapTime.textContent = this.formatTime(lapTimes[i]);

      lapItem.appendChild(lapNumber);
      lapItem.appendChild(lapTime);
      this.lapsList.appendChild(lapItem);
    }
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const timer = new VibeTimer();

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (timer.isRunning) {
        timer.pauseTimer();
      } else {
        timer.startTimer();
      }
    } else if (e.code === 'KeyL' && timer.mode === 'stopwatch') {
      timer.recordLap();
    } else if (e.code === 'KeyR') {
      timer.resetTimer();
    }
  });
});