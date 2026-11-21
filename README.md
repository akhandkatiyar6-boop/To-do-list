# TaskFlow &bull; Modern To-Do & Task Analytics Dashboard

A modern, responsive, and feature-packed To-Do List and Productivity Dashboard built with vanilla HTML5, CSS3, and modern JavaScript. Designed with a clean SaaS slate aesthetic, dual dark/light theme support, real-time analytics, and task categorization.

![TaskFlow Dashboard](https://img.shields.io/badge/Status-Active-success)
![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-f7df1e?logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-Modern_Slate_Design-1572b6?logo=css3)
![HTML5](https://img.shields.io/badge/HTML5-Semantic-e34f26?logo=html5)

---

## ✨ Features

- **🎨 Modern Slate UI & Dual Theme Engine:**
  - Default dark mode with deep slate tones (`#090d16` / `#111827`) and glowing accents.
  - Minimalist light mode with smooth transitions.
  - One-click theme toggle with persistent storage in `localStorage`.
- **📊 Real-time Productivity Analytics:**
  - Dynamic completion progress bar with multi-stop gradient fill.
  - Live metric stat cards: **Total Tasks**, **In Progress**, **Completed**, and **High Priority**.
  - Dynamic percentage completion indicator (`X of Y tasks completed`).
- **🏷️ Rich Task Metadata:**
  - **Priority Badges:** High 🔥 (Rose/Red with glowing stripe), Medium (Amber), Low (Sky Blue).
  - **Category Tags:** 🎓 School, 💼 Work, 👤 Personal, 🚀 Project, 💪 Health.
  - **Smart Due Date Badges:** Relative date tags highlighting **Overdue** (animated pulse), **Due Today**, or upcoming deadlines.
- **🔍 Advanced Search, Filtering & Sorting:**
  - Filter tabs: **All**, **Active**, **Completed** with live counter badges.
  - Real-time client-side search by task title.
  - Filter by Category and Priority simultaneously.
  - Multi-criteria sorting: *Newest First*, *Oldest First*, *Due Date*, *Priority*, *Alphabetical*.
  - Quick action to **Clear Completed** tasks.
- **⚡ Micro-Interactions & Usability:**
  - Smooth CSS card enter (`@keyframes cardEnter`) and exit (`@keyframes cardLeave`) animations.
  - Custom rounded checkbox with pop animation.
  - Toggle completion by clicking either the checkbox or the task text.
  - Full keyboard support (<kbd>Enter</kbd> to add tasks).
  - All data persisted securely in the browser's `localStorage`.

---

## 🚀 Getting Started

### Prerequisites
All you need is any modern web browser (Chrome, Firefox, Edge, Safari). No build tools, bundlers, or dependencies required!

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/akhandkatiyar6-boop/To-do-list.git
   cd To-do-list
   ```

2. **Open the project:**
   - Double-click `index.html` to open it in your default browser, OR
   - Run a lightweight local server:
     ```bash
     # Using Python 3
     python -m http.server 8000
     ```
   - Then open `http://localhost:8000` in your web browser.

---

## 📁 Project Structure

```
├── index.html        # Semantic HTML5 layout, analytics cards, toolbar & modal structure
├── style.css         # Modern CSS custom properties (design tokens), animations & media queries
├── script.js         # Reactive state management, LocalStorage synchronization & event handling
└── README.md         # Project documentation and feature overview
```

---

## 🛠️ Built With

- **HTML5:** Semantic markup, accessibility attributes (`aria-label`, `role`).
- **CSS3:** Custom properties (CSS variables), Flexbox, CSS Grid, keyframe animations, responsive design.
- **JavaScript (ES6+):** Modular functions, state-driven rendering, LocalStorage API, DOM manipulation.
- **Typography:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) via Google Fonts.

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
