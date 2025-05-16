# 🌟 Habit Tracker Web App

A feature-rich, gamified habit tracking app built with **HTML**, **CSS**, and **JavaScript**. Track daily habits and goals, earn virtual coins for completing tasks, and redeem exciting rewards—all in a clean, responsive UI!

---

## 🚀 Features

- ✅ Add daily tasks & goals with categories
- 🎯 Set task priority and coin value
- ⏳ Tasks auto-delete 5 minutes after completion
- 🪙 Earn coins and spend them on rewards
- 🛍️ Add custom rewards
- 🔔 Interactive notifications system
- 👤 Customizable username
- 📈 Track progress visually
- 🔉 Audio feedback with animation
- 📱 Responsive and mobile-friendly design

---

## 🛠️ Tech Stack

| Layer     | Tech Used                            |
|-----------|--------------------------------------|
| Markup    | HTML5                                |
| Styling   | CSS3 (custom components)             |
| Scripting | Vanilla JavaScript (ES6+)            |
| Icons     | Font Awesome                         |
| Storage   | Web Storage API (localStorage)       |
| Audio     | Coin sound via `audio.mp3`           |

---

## 📁 Project Structure

```
habit-tracker/
│
├── index.html       # Main HTML layout and modals
├── style.css        # All custom styles and animations
├── script.js        # Main logic and interactivity
└── audio.mp3        # Sound effect when earning coins
```

---

## 🎮 How to Use

### 📝 Add a Task
- Click on the ➕ button.
- Enter task description.
- Select:
  - Category (e.g., Study, Physical)
  - Priority (Low, Medium, High)
  - Coin reward (30 to 100)
- Click **Add Task**.

### ✅ Complete a Task
- Click the checkbox to complete it.
- Coins are rewarded.
- Completed tasks are auto-deleted after 5 minutes.

### 🧑 Customize Username
- Click on the username at the top to change it.

### 🏆 Claim Rewards
- Click the 👤 icon to open rewards.
- View default and custom rewards.
- Buy with coins or add your own custom reward.

### 🔔 View Notifications
- Click the 🔔 icon to view earned coins or reward claims.
- Delete individual or clear all notifications.

---

## 📦 Storage

The app uses `localStorage` to persist:
- Tasks
- Rewards
- Username
- Coins
- Notifications
- Tab state

No backend or login is required.

---

## 📱 Responsive UI

- Fully responsive for mobile, tablet, and desktop
- CSS media queries for smooth layout adaptation
- Custom scrollbars and modals for mobile usability

---

## ✨ Highlights

- 🎮 Gamified experience with coins & rewards
- ⏰ Auto-removal of completed tasks
- 🎉 Toasts and animated coin feedback
- 🧠 Smart logic and dynamic DOM manipulation

---

## 📦 Setup & Deployment

No installation required. Just clone and open:

```bash
git clone https://github.com/kadamsahil2511/ToDo
cd habit-tracker
open index.html
```

> Works offline — 100% client-side.

---

## 🧠 Future Improvements

- 🔄 Sync with backend or cloud
- 📆 Calendar & streak tracker
- 🌓 Dark mode / themes
- 📱 PWA support for installable app

---

## 📄 License

MIT License. Use freely with attribution.

---

## 🙌 Author

Made with 💚 by Sourabh Yadav (https://github.com/yadavsourabhgh) & Sahil Kadam 

---
