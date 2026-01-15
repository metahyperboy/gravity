# Personal Goal & Work Alignment App

A distraction-resistant mobile app that keeps you focused on your yearly goals by preventing daily work from drifting into unrelated tasks.

![Goal Alignment App](https://img.shields.io/badge/Status-Fully%20Functional-success)
![Tech Stack](https://img.shields.io/badge/Tech-Vanilla%20JS-yellow)
![No Dependencies](https://img.shields.io/badge/Dependencies-Zero-blue)

## 🎯 Core Philosophy

This app exists to answer one daily question:

> **"Did today's work actually move my life goals forward?"**

## ✨ Features

- **Year Goal Setup** - Define your Top 3 yearly goals with intention
- **Quarter Planning** - Break down goals into 90-day focused outcomes
- **Daily Work Tracker** - Log work in <60 seconds with mandatory alignment check
- **Progress Dashboard** - View alignment metrics without cognitive overload
- **Weekly Reflection** - Auto-prompted learning and course-correction
- **Data Persistence** - localStorage with export/import capabilities

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/metahyperboy/gravity.git
   cd gravity
   ```

2. **Open in browser:**
   - Simply open `index.html` in any modern browser
   - No build process or dependencies required!

3. **Start using:**
   - Define your 3 yearly goals
   - Plan your current quarter
   - Log daily work and track alignment

## 📱 Usage

### First-Time Setup
1. Define your **3 yearly goals** with:
   - Goal title
   - Why it matters to you
   - What success looks like at year-end

2. Plan your **current quarter**:
   - Select 1 primary goal to focus on
   - Define the quarter outcome
   - List 3-5 key tasks

### Daily Practice
1. Navigate to **Today** tab
2. Log your work in under 60 seconds:
   - What did you work on?
   - Which goal does it support?
   - Effort level (Low/Medium/Deep Work)
   - Proactiveness score (1-5)

3. Review **Dashboard** for alignment metrics

### Weekly Reflection
- App auto-prompts every Monday
- Reflect on what moved goals forward
- Identify time wasters
- Plan what to stop doing

## 🎨 Design Principles

✅ **Simplicity over features** - No bloat, just focus  
✅ **One-screen focus** - Single clear purpose per view  
✅ **Under 60 seconds** - Fast daily logging  
✅ **Reflection > Motivation** - Learning, not gamification  
✅ **Distraction resistance** - Calm colors, no notifications  

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Storage:** Browser localStorage (no backend)
- **Design:** Mobile-first, touch-optimized
- **Dependencies:** Zero - pure web standards

## 📊 How It Works

```
Year Goals (1-3 per year)
    ↓
Quarter Planning (90-day focus)
    ↓
Daily Work Tracking (<60 sec logging)
    ↓
Alignment Analysis (% of work aligned with goals)
    ↓
Weekly Reflection (course correction)
```

## 🔒 Data Privacy

- All data stored locally in your browser
- No tracking, no analytics, no external servers
- Export your data anytime as JSON
- Import to restore on another device

## 📦 File Structure

```
gravity/
├── index.html          # Main app shell
├── styles.css          # Design system & components
├── app.js             # Core application logic
├── validators.js      # Business rules enforcement
├── calculations.js    # Alignment & analytics engine
└── README.md          # This file
```

## 🌐 Deployment

### Local Use
Just open `index.html` - works immediately!

### Web Hosting
Upload all files to any static hosting:
- GitHub Pages
- Netlify
- Vercel
- Any web server

No build process needed!

## 🎯 What This App Avoids

❌ Task dumping  
❌ Unlimited goals  
❌ Generic productivity advice  
❌ Overloaded dashboards  
❌ Gamification & badges  
❌ Forced motivation  
❌ Notification spam  

## 🤝 Contributing

This is a personal productivity tool focused on extreme simplicity. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Keep changes aligned with the core philosophy
4. Submit a pull request

**Important:** Features that add complexity or violate the design principles will be carefully evaluated.

## 📄 License

MIT License - Feel free to use and modify for your personal productivity!

## 🙏 Acknowledgments

Built with the philosophy that **focus is a system, not a feeling**.

---

**Remember:** If the answer to "Did today's work move my goals forward?" is unclear, it's time to refocus.
