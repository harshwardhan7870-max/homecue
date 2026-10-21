
'use strict';

/* =========================================================
   HomeCue — Interactive Demo
   All device controls and MCP events are simulated locally.
   ========================================================= */

const $ = (selector) => document.querySelector(selector);

const state = {
  theme: 'dark',
  lightsOn: false,
  alarmArmed: false,
  temperature: 72,
  requestCount: 0,
  routine: 'Evening Wind-down',
  checkedTasks: new Set(),
  recognition: null,
  listening: false
};

const routines = {
  'Morning Routine': [
    'Wake up and drink a glass of water',
    'Stretch for five minutes',
    'Prepare breakfast',
    'Review today’s schedule'
  ],
  'Cleaning Checklist': [
    'Tidy the living room',
    'Wipe kitchen counters',
    'Clean the bathroom',
    'Vacuum or sweep the floors'
  ],
  'Grocery List': [
    'Check the refrigerator and pantry',
    'List fresh fruits and vegetables',
    'Check household essentials',
    'Review the shopping list'
  ],
  'Home Maintenance': [
    'Check smoke detector batteries',
    'Inspect doors and windows',
    'Check for water leaks',
    'Review upcoming maintenance tasks'
  ],
  'Evening Wind-down': [
    'Wash dishes and tidy the kitchen',
    'Prepare clothes for tomorrow',
    'Dim the lights and relax',
    'Set an alarm for tomorrow'
  ]
};

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char]);
}

/* ---------- Simulated MCP execution log ---------- */

function logExecution(operation, params, result) {
  state.requestCount++;

  const log = {
    timestamp: new Date().toISOString(),
    request_id: `demo-${String(state.requestCount).padStart(4, '0')}`,
    protocol: 'MCP-style demo simulation',
    simulated: true,
    operation,
    params,
    response: result
  };

  const output = $('#mcpLogOutput');
  if (!output) return;

  const existing = output.dataset.logs
    ? JSON.parse(output.dataset.logs)
    : [];

  existing.unshift(log);
  const recent = existing.slice(0, 30);

  output.dataset.logs = JSON.stringify(recent);
  output.textContent = JSON.stringify(recent, null, 2);
}

/* ---------- Chat messages ---------- */

function addMessage(role, content) {
  const chat = $('#chatBox');
  if (!chat) return;

  const message = document.createElement('div');
  message.className = `msg ${role}`;

  // Use textContent for plain text; never trust user HTML.
  message.textContent = content;
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}

function chooseRoutine(prompt) {
  const text = prompt.toLowerCase();

  if (text.includes('morning') || text.includes('wake up')) {
    return 'Morning Routine';
  }
  if (text.includes('clean') || text.includes('tidy')) {
    return 'Cleaning Checklist';
  }
  if (text.includes('grocery') || text.includes('shopping')) {
    return 'Grocery List';
  }
  if (text.includes('maintenance') || text.includes('repair')) {
    return 'Home Maintenance';
  }
  if (
    text.includes('evening') ||
    text.includes('wind-down') ||
    text.includes('bedtime') ||
    text.includes('tonight')
  ) {
    return 'Evening Wind-down';
  }

  return null;
}


if (/\blights?\b/.test(text)) {
  const wantsOn =
    /\b(turn|switch)\s+on\s+(?:the\s+)?(?:smart\s+)?lights?\b/.test(text) ||
    /\b(turn|switch)\s+(?:the\s+)?(?:smart\s+)?lights?\s+on\b/.test(text) ||
    /\benable\s+(?:the\s+)?lights?\b/.test(text);

  const wantsOff =
    /\b(turn|switch)\s+off\s+(?:the\s+)?(?:smart\s+)?lights?\b/.test(text) ||
    /\b(turn|switch)\s+(?:the\s+)?(?:smart\s+)?lights?\s+off\b/.test(text) ||
    /\bdisable\s+(?:the\s+)?lights?\b/.test(text);

  if (wantsOn) {
    state.lightsOn = true;
    updateDeviceControls();
    changeDevice('lights', 'on');
  } else if (wantsOff) {
    state.lightsOn = false;
    updateDeviceControls();
    changeDevice('lights', 'off');
  }

  return `Demo: Smart lights are ${state.lightsOn ? 'ON' : 'OFF'}. No physical device was controlled.`;
}

  if (text.includes('thermostat') || text.includes('temperature')) {
    const match = text.match(/(-?\d{1,3})\s*(?:°|degrees)?\s*(?:f|fahrenheit)?/);
    if (match) {
      const temp = Number(match[1]);
      if (temp >= 50 && temp <= 90) {
        state.temperature = temp;
        updateDeviceControls();
      }
    }
    return `Demo thermostat setting: ${state.temperature}°F. This does not change a real thermostat.`;
  }

  
if (text.includes('alarm') || text.includes('security')) {
  const wantsDisarm = /\b(disarm|deactivate)\b/.test(text);
  const wantsArm = /\barm\b|\bactivate\b/.test(text);

  if (wantsDisarm) {
    state.alarmArmed = false;
    updateDeviceControls();
    changeDevice('security_alarm', 'disarmed');
  } else if (wantsArm) {
    state.alarmArmed = true;
    updateDeviceControls();
    changeDevice('security_alarm', 'armed');
  }

  return `Demo security system: ${state.alarmArmed ? 'ARMED' : 'DISARMED'}. No real security system was changed.`;
}


  const routine = chooseRoutine(prompt);

  if (routine) {
    renderRoutine(routine);
    logExecution('routine.generate', { prompt, routine }, {
      status: 'success',
      simulated: true,
      task_count: routines[routine].length
    });
    return `I've prepared your ${routine} checklist. You can tick off each task and track your progress above.`;
  }

  logExecution('assistant.respond', { prompt }, {
    status: 'success',
    simulated: true,
    note: 'Local keyword-based response; no AI API was called.'
  });

  return 'I can help with morning routines, cleaning, groceries, home maintenance, evening plans, and simulated smart-home controls. Try one of the Quick Prompts!';
}

function sendPrompt(prompt) {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) return;

  addMessage('user', cleanPrompt);
  const reply = respondToPrompt(cleanPrompt);
  addMessage('assistant', reply);
}

/* ---------- Routine checklist and progress ---------- */

function renderRoutine(name) {
  state.routine = name;
  state.checkedTasks.clear();

  const title = $('#routineTitle');
  const list = $('#checklist');

  if (title) title.textContent = name;
  if (!list) return;

  list.replaceChildren();

  routines[name].forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'checklist-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `routine-task-${index}`;
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        state.checkedTasks.add(index);
      } else {
        state.checkedTasks.delete(index);
      }
      updateProgress();
    });

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = task;

    li.append(checkbox, label);
    list.appendChild(li);
  });

  updateProgress();
}

function updateProgress() {
  const total = routines[state.routine].length;
  const completed = state.checkedTasks.size;
  const percentage = total ? Math.round(completed / total * 100) : 0;

  const text = $('#routineProgressText');
  const bar = $('#routineProgressBar');

  if (text) text.textContent = `${completed} / ${total} Completed`;
  if (bar) {
    bar.style.width = `${percentage}%`;
    bar.setAttribute('aria-valuenow', String(percentage));
  }
}

/* ---------- Smart controls ---------- */

function updateDeviceControls() {
  const lights = $('#lightsBtn');
  const alarm = $('#alarmBtn');
  const temp = $('#tempVal');

  if (lights) {
    lights.textContent = state.lightsOn ? 'ON' : 'OFF';
    lights.classList.toggle('on', state.lightsOn);
    lights.classList.toggle('off', !state.lightsOn);
    lights.setAttribute('aria-pressed', String(state.lightsOn));
  }

  if (alarm) {
    alarm.textContent = state.alarmArmed ? 'ARMED' : 'DISARMED';
    alarm.classList.toggle('armed', state.alarmArmed);
    alarm.classList.toggle('disarmed', !state.alarmArmed);
    alarm.setAttribute('aria-pressed', String(state.alarmArmed));
  }

  if (temp) temp.textContent = `${state.temperature}°F`;
}

function changeDevice(device, value) {
  logExecution(`device.${device}`, { value }, {
    status: 'success',
    simulated: true,
    message: `${device} demo state updated`
  });
}

/* ---------- Dark / light theme ---------- */

function applyTheme(theme) {
  theme = theme === 'light' ? 'light' : 'dark';
  state.theme = theme;
  document.body.dataset.theme = theme;

  const button = $('#themeToggle');
  if (button) {
    button.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
    button.setAttribute('aria-pressed', String(theme === 'dark'));
  }

  try {
    localStorage.setItem('homecue-theme', theme);
  } catch {
    // The theme still works if browser storage is unavailable.
  }
}

/* ---------- Voice input: Web Speech API ---------- */

function setupVoiceInput() {
  const button = $('#micBtn');
  const status = $('#voiceStatus');

  if (!button) return;

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    button.title = 'Voice input is not supported by this browser';
    button.addEventListener('click', () => {
      if (status) {
        status.textContent =
          'Voice input is not supported here. Please type your command.';
        status.classList.remove('hidden');
      }
    });
    return;
  }

  state.recognition = new SpeechRecognition();
  state.recognition.lang = 'en-US';
  state.recognition.interimResults = false;
  state.recognition.maxAlternatives = 1;

  state.recognition.onstart = () => {
    state.listening = true;
    button.textContent = '⏹️';
    if (status) {
      status.textContent = 'Listening... Speak your command.';
      status.classList.remove('hidden');
    }
  };

  state.recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    const input = $('#userInput');
    if (input) input.value = transcript;
    if (status) status.textContent = `Heard: ${transcript}`;
  };

  state.recognition.onerror = event => {
    if (status) {
      status.textContent = `Voice input issue: ${event.error}. You can type instead.`;
      status.classList.remove('hidden');
    }
  };

  state.recognition.onend = () => {
    state.listening = false;
    button.textContent = '🎙️';
  };

  button.addEventListener('click', () => {
    try {
      if (state.listening) {
        state.recognition.stop();
      } else {
        state.recognition.start();
      }
    } catch {
      if (status) {
        status.textContent = 'Could not start voice input. Try typing instead.';
        status.classList.remove('hidden');
      }
    }
  });
}

/* ---------- Event wiring ---------- */

function init() {
  // Restore theme if browser storage is available.
  let savedTheme = 'dark';
  try {
    savedTheme = localStorage.getItem('homecue-theme') || 'dark';
  } catch {
    // Default to dark theme.
  }
  applyTheme(savedTheme);

  $('#themeToggle')?.addEventListener('click', () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  $('#lightsBtn')?.addEventListener('click', () => {
    state.lightsOn = !state.lightsOn;
    updateDeviceControls();
    changeDevice('lights', state.lightsOn ? 'on' : 'off');
  });

  $('#alarmBtn')?.addEventListener('click', () => {
    state.alarmArmed = !state.alarmArmed;
    updateDeviceControls();
    changeDevice('security_alarm', state.alarmArmed ? 'armed' : 'disarmed');
  });

  $('#tempDown')?.addEventListener('click', () => {
    state.temperature = Math.max(50, state.temperature - 1);
    updateDeviceControls();
    changeDevice('thermostat', `${state.temperature}°F`);
  });

  $('#tempUp')?.addEventListener('click', () => {
    state.temperature = Math.min(90, state.temperature + 1);
    updateDeviceControls();
    changeDevice('thermostat', `${state.temperature}°F`);
  });

  $('#chatForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const input = $('#userInput');
    if (!input) return;
    sendPrompt(input.value);
    input.value = '';
  });

  document.querySelectorAll('.prompt-btn').forEach(button => {
    button.addEventListener('click', () => {
      const prompt = button.dataset.prompt || button.textContent.trim();
      sendPrompt(prompt);
    });
  });

  $('#resetRoutine')?.addEventListener('click', () => {
    renderRoutine(state.routine);
    logExecution('routine.reset', { routine: state.routine }, {
      status: 'success',
      simulated: true
    });
  });

  $('#clearChat')?.addEventListener('click', () => {
    const chat = $('#chatBox');
    if (chat) {
      chat.replaceChildren();
      addMessage('system', 'Conversation cleared. Choose a Quick Prompt or type a new command.');
    }
  });

  $('#clearMcpLog')?.addEventListener('click', () => {
    const output = $('#mcpLogOutput');
    if (!output) return;
    output.dataset.logs = '[]';
    output.textContent = JSON.stringify({
      status: 'ready',
      simulated: true,
      note: 'Waiting for a demo action. No real MCP traffic is recorded.'
    }, null, 2);
  });

  renderRoutine(state.routine);
  updateDeviceControls();
  setupVoiceInput();

  logExecution('app.start', {}, {
    status: 'ready',
    simulated: true,
    note: 'HomeCue demo initialized locally.'
  });
}

document.addEventListener('DOMContentLoaded', init);
