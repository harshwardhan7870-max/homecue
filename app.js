/**
 * HomeCue – app.js
 * Conversational AI home assistant simulation.
 * No external dependencies – pure vanilla JS.
 *
 * Architecture:
 *   - ResponseEngine  : generates structured simulated AI responses
 *   - ChatUI          : manages DOM, bubbles, sidebar, input
 *   - App             : wires everything together
 */

'use strict';

/* ============================================================
   1. RESPONSE ENGINE
   Keyword-based rule engine that returns structured plans.
   In production, swap `ResponseEngine.getResponse()` with a
   real LLM API call (e.g. Alexa LLM, OpenAI, Gemini).
   ============================================================ */

const ResponseEngine = (() => {

  /** A checklist section with a title and task array */
  const makeSection = (title, tasks) => ({ title, tasks });

  const PLANS = [
    {
      keywords: ['morning', 'wake', 'start day', 'weekday'],
      response: {
        intro: "Here's your personalised weekday morning routine ☀️",
        sections: [
          makeSection('🛏 Rise & Refresh (6:00–6:30 am)', [
            'Wake up – no snooze!',
            'Drink a full glass of water',
            'Quick stretch or 5-min yoga',
          ]),
          makeSection('🚿 Get Ready (6:30–7:00 am)', [
            'Shower and personal hygiene',
            'Get dressed',
            'Take any morning medications',
          ]),
          makeSection('🍳 Breakfast (7:00–7:20 am)', [
            'Prepare a nutritious breakfast',
            'Review your to-do list for the day',
            'Check the weather',
          ]),
          makeSection('🚪 Out the Door (7:20–7:30 am)', [
            'Pack your bag / laptop / keys',
            'Lock doors and windows',
            'Set home security / thermostat',
          ]),
        ],
      },
    },
    {
      keywords: ['clean', 'cleaning', 'tidy', 'house', 'sweep', 'mop', 'vacuum', 'weekend'],
      response: {
        intro: "Here's a thorough weekend house-cleaning checklist 🧹",
        sections: [
          makeSection('🛋 Living Room', [
            'Dust shelves, TV stand, and frames',
            'Vacuum sofa and cushions',
            'Sweep / vacuum floor',
            'Mop if hard floors',
            'Wipe light switches and remotes',
          ]),
          makeSection('🍽 Kitchen', [
            'Wipe down countertops',
            'Clean stovetop and microwave',
            'Scrub sink',
            'Empty and wipe trash bin',
            'Mop kitchen floor',
          ]),
          makeSection('🚽 Bathroom', [
            'Scrub toilet bowl',
            'Wipe sink and mirror',
            'Clean shower / bathtub',
            'Replace towels',
            'Mop floor',
          ]),
          makeSection('🛏 Bedroom', [
            'Change bed sheets',
            'Dust furniture surfaces',
            'Vacuum carpet or sweep floor',
            'Organize wardrobe / closet',
          ]),
        ],
      },
    },
    {
      keywords: ['grocery', 'groceries', 'shopping', 'shop', 'food', 'buy', 'store', 'market'],
      response: {
        intro: "Here's a well-rounded weekly grocery shopping list 🛒",
        sections: [
          makeSection('🥦 Fresh Produce', [
            'Bananas, apples, oranges',
            'Spinach, broccoli, carrots',
            'Tomatoes, onions, garlic',
            'Lemons / limes',
          ]),
          makeSection('🥩 Protein', [
            'Chicken breast or thighs',
            'Eggs (1 dozen)',
            'Canned tuna / salmon',
            'Greek yoghurt',
          ]),
          makeSection('🍞 Grains & Pantry', [
            'Whole-wheat bread or wraps',
            'Oats or muesli',
            'Rice / quinoa',
            'Pasta + pasta sauce',
            'Olive oil, salt, pepper',
          ]),
          makeSection('🧴 Household', [
            'Dish soap',
            'Paper towels',
            'Trash bags',
            'Laundry detergent',
          ]),
        ],
      },
    },
    {
      keywords: ['maintenance', 'repair', 'fix', 'inspect', 'october', 'fall', 'autumn', 'seasonal'],
      response: {
        intro: 'Here are your recommended home maintenance tasks for October 🔧',
        sections: [
          makeSection('🌿 Exterior', [
            'Clear gutters of fallen leaves',
            'Inspect roof for loose / damaged shingles',
            'Seal cracks in driveway or walkways',
            'Drain and store garden hoses',
          ]),
          makeSection('🌡 Heating & Insulation', [
            'Replace HVAC filters',
            'Test smoke and CO detectors',
            'Bleed radiators if needed',
            'Check weatherstripping on doors & windows',
          ]),
          makeSection('⚡ Safety Check', [
            'Test circuit breakers',
            'Inspect fire extinguisher',
            'Check water heater for leaks',
            'Stock emergency kit (flashlights, batteries)',
          ]),
        ],
      },
    },
    {
      keywords: ['evening', 'night', 'relax', 'wind', 'unwind', 'bedtime', 'tonight'],
      response: {
        intro: "Here's a relaxing evening wind-down plan for tonight 🌙",
        sections: [
          makeSection('🍜 Dinner (6:30–7:30 pm)', [
            'Cook or order a wholesome meal',
            'Avoid heavy or spicy foods late',
            'Set the table – eat without screens',
          ]),
          makeSection('🏠 Tidy Up (7:30–8:00 pm)', [
            'Wash dinner dishes',
            'Wipe kitchen counters',
            'Quick 10-min whole-house pick-up',
            'Take out trash if needed',
          ]),
          makeSection('😌 Wind-Down (8:00–9:30 pm)', [
            'Light a candle or dim the lights',
            'Read a book or listen to soft music',
            'Avoid screens 1 hour before bed',
            '10-min journaling or gratitude log',
          ]),
          makeSection('🛏 Bedtime Prep (9:30–10:00 pm)', [
            'Skincare routine',
            'Lay out clothes for tomorrow',
            'Set alarm(s)',
            'Set thermostat to sleep temperature',
          ]),
        ],
      },
    },
  ];

  /** Generic fallback response */
  const FALLBACK = {
    intro: "I'm not sure I caught that — here's a general home to-do checklist to get you started 📋",
    sections: [
      makeSection('🏠 Daily Essentials', [
        'Make your bed',
        'Wipe kitchen counters',
        'Do a 10-min tidy-up of common areas',
        "Check tomorrow's schedule",
      ]),
      makeSection('💡 Quick Tips', [
        'Keep a running grocery list on your fridge',
        'Batch laundry on one day a week',
        'Do a 5-min evening reset every night',
      ]),
    ],
  };

  /**
   * Match user input against keyword rules.
   * @param {string} text – raw user message
   * @returns {{ intro: string, sections: Array }} structured plan
   */
  function getResponse(text) {
    const lower = text.toLowerCase();
    for (const plan of PLANS) {
      if (plan.keywords.some(kw => lower.includes(kw))) {
        return plan.response;
      }
    }
    return FALLBACK;
  }

  return { getResponse };
})();


/* ============================================================
   2. CHAT UI
   ============================================================ */

const ChatUI = (() => {

  /* --- DOM references --- */
  const chatWindow   = document.getElementById('chatWindow');
  const userInput    = document.getElementById('userInput');
  const sendBtn      = document.getElementById('sendBtn');
  const clearBtn     = document.getElementById('clearBtn');
  const menuToggle   = document.getElementById('menuToggle');
  const sidebarEl    = document.getElementById('sidebar');
  const sidebarClose = document.getElementById('sidebarClose');
  const quickPrompts = document.querySelectorAll('.quick-prompt');

  /* Overlay for mobile sidebar */
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  /* ---- unique checklist ID counter ---- */
  let _checkboxCounter = 0;

  /* ---- Sidebar helpers ---- */
  function openSidebar()  { sidebarEl.classList.add('open'); overlay.classList.add('active'); }
  function closeSidebar() { sidebarEl.classList.remove('open'); overlay.classList.remove('active'); }

  menuToggle.addEventListener('click', openSidebar);
  sidebarClose.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  /* ---- Quick prompts ---- */
  quickPrompts.forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.dataset.prompt;
      closeSidebar();
      userInput.value = prompt;
      autoResize();
      sendMessage();
    });
  });

  /* ---- Auto-resize textarea ---- */
  function autoResize() {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
  }

  userInput.addEventListener('input', autoResize);

  /* ---- Send on Enter (Shift+Enter = newline) ---- */
  userInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);
  clearBtn.addEventListener('click', clearConversation);

  /* ============================================================
     Rendering helpers
     ============================================================ */

  /** Scroll chat to the very bottom */
  function scrollBottom() {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  /** Append a message bubble to the chat window */
  function appendMessage(role, htmlContent) {
    const wrapper = document.createElement('div');
    wrapper.className = `message ${role}`;

    const label = document.createElement('span');
    label.className = 'bubble-label';
    label.textContent = role === 'user' ? 'You' : 'HomeCue';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = htmlContent;

    wrapper.appendChild(label);
    wrapper.appendChild(bubble);
    chatWindow.appendChild(wrapper);
    scrollBottom();
    return wrapper;
  }

  /** Show animated typing indicator, returns the element */
  function showTyping() {
    const wrapper = document.createElement('div');
    wrapper.className = 'message bot';

    const label = document.createElement('span');
    label.className = 'bubble-label';
    label.textContent = 'HomeCue';

    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>`;

    wrapper.appendChild(label);
    wrapper.appendChild(indicator);
    chatWindow.appendChild(wrapper);
    scrollBottom();
    return wrapper;
  }

  /**
   * Convert a structured plan object into HTML.
   * Renders interactive checkboxes for every task item.
   */
  function planToHTML(plan) {
    let html = `<p style="margin-bottom:10px">${escapeHTML(plan.intro)}</p>`;

    plan.sections.forEach(section => {
      html += `<span class="section-title">${escapeHTML(section.title)}</span>`;
      html += '<div class="task-list">';
      section.tasks.forEach(task => {
        const id = `task-${++_checkboxCounter}`;
        html += `
          <div class="task-item">
            <input type="checkbox" id="${id}" />
            <label for="${id}">${escapeHTML(task)}</label>
          </div>`;
      });
      html += '</div>';
    });

    return html;
  }

  /** Simple HTML escape to prevent XSS from user input echoed back */
  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ============================================================
     Core send / receive flow
     ============================================================ */

  /** Disable / enable input while awaiting response */
  function setInputLocked(locked) {
    userInput.disabled = locked;
    sendBtn.disabled   = locked;
  }

  /** Main send handler */
  async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    /* 1. Show user bubble */
    appendMessage('user', escapeHTML(text));

    /* 2. Clear + reset input */
    userInput.value = '';
    userInput.style.height = 'auto';

    /* 3. Lock input & show typing */
    setInputLocked(true);
    const typingEl = showTyping();

    /* 4. Simulate async LLM call (300–900 ms delay) */
    const delay = 300 + Math.random() * 600;
    await wait(delay);

    /* 5. Remove typing indicator */
    typingEl.remove();

    /* 6. Get structured response and render */
    const plan = ResponseEngine.getResponse(text);
    appendMessage('bot', planToHTML(plan));

    /* 7. Unlock input & refocus */
    setInputLocked(false);
    userInput.focus();
  }

  /** Clear the conversation and re-show welcome card */
  function clearConversation() {
    chatWindow.innerHTML = '';
    renderWelcome();
  }

  /** Simple promise-based delay */
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* ============================================================
     Welcome screen
     ============================================================ */

  function renderWelcome() {
    const card = document.createElement('div');
    card.className = 'welcome-card';
    card.innerHTML = `
      <span class="emoji">🏠</span>
      <h2>Welcome to HomeCue</h2>
      <p>Your AI home assistant – ask me to plan your morning routine,
         build a cleaning checklist, organise grocery shopping,
         schedule home maintenance, or design a relaxing evening.</p>
      <p style="margin-top:10px; font-size:0.82rem; color:#7c6ff7">
        Try a Quick Prompt from the sidebar, or just type below!
      </p>`;
    chatWindow.appendChild(card);
  }

  /* ============================================================
     Public API
     ============================================================ */
  return { init: renderWelcome };
})();


/* ============================================================
   3. APP ENTRY POINT
   ============================================================ */

(function App() {
  ChatUI.init();
})();
