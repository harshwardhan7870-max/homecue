# 🏠 HomeCue – AI Home Assistant Simulation

> **Alexa+ Hackathon Prototype** · Conversational interface for everyday household task planning.

HomeCue lets users type natural-language requests and instantly receive organized checklists, daily routines, and household task plans through a clean, interactive chat UI — no backend required.

---

## ✨ Features

| Feature | Details |
|---|---|
| 💬 Chat Interface | Clean, animated conversation bubbles |
| ✅ Interactive Checklists | Tick off tasks as you complete them |
| ⚡ Quick Prompts | One-click sidebar shortcuts for common requests |
| 📱 Responsive | Works on desktop, tablet, and mobile |
| 🎨 Dark Sidebar + Light Chat | Ergonomic two-tone layout |
| 🔌 Zero Dependencies | Pure HTML / CSS / JS — no build step needed |

---

## 🚀 Getting Started

### Option A – Open directly in your browser

```
index.html  →  Right-click → Open with → Browser
```

### Option B – Serve locally (recommended for development)

**Using Python (comes with most systems):**

```bash
# Python 3
python -m http.server 8080

# Then open: http://localhost:8080
```

**Using Node.js:**

```bash
npx serve .
```

---

## 📁 Project Structure

```
mydevProject/
├── index.html      # App shell, chat layout, sidebar
├── style.css       # All styles – CSS custom properties, responsive
├── app.js          # ResponseEngine + ChatUI logic (vanilla JS)
├── README.md       # This file
└── LICENSE         # MIT License
```

---

## 💡 How It Works

```
User types a message
        ↓
app.js  →  ResponseEngine.getResponse(text)
        ↓
Keyword matching against built-in plan rules
        ↓
Returns { intro, sections: [{ title, tasks[] }] }
        ↓
ChatUI renders interactive checkboxes in a bot bubble
```

### Supported Request Types

| You say… | HomeCue returns… |
|---|---|
| "morning routine" | ☀️ Weekday Morning Routine plan |
| "cleaning checklist" | 🧹 Room-by-room cleaning list |
| "grocery shopping" | 🛒 Weekly grocery list |
| "home maintenance" / "october" | 🔧 Seasonal maintenance tasks |
| "evening" / "wind down" | 🌙 Evening relaxation schedule |

---

## 🔌 Connecting a Real LLM

The `ResponseEngine.getResponse()` function in `app.js` is designed as a **drop-in replacement point**. To connect a real AI backend:

```js
// In app.js – replace the ResponseEngine.getResponse() call in sendMessage():

const response = await fetch('https://your-llm-api.example.com/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: text })
});
const plan = await response.json(); // must match { intro, sections } shape
```

---

## 🛠 Development Notes

- **CSS custom properties** in `:root` make theming trivial — update colours in one place.
- **No frameworks** were used intentionally to keep the demo self-contained for the hackathon.
- The `.venv` directory is present for any Python-based tooling (e.g. a local API server) added later.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

[MIT](./LICENSE) © 2026 HomeCue Contributors
