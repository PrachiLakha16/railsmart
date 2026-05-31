# 🚂 RailSmart

> A smarter Indian railway booking platform with AI-powered features

**Live Demo:** https://railsmart.vercel.app

---

## 🎯 Problem Statement

iXigo and IRCTC lack intelligent features that help users:
- Find alternate routes when direct trains are waitlisted
- Get alerted before chart preparation when WL won't confirm
- Book Tatkal tickets quickly with saved passenger profiles

---

## ✨ Key Features

### 🔀 Alternate Route Engine
- Single-hop A→B→C route finding algorithm
- Validates layover timing (45min - 2hr window)
- Filters by WL confirmation probability
- Tier-based journey time limits

### 💰 Cheapest Route Filter
- Compares direct vs alternate route pricing
- Smart ranking by price + duration + WL chance

### 🔔 Smart WL Alerts
- Monitors waitlisted tickets every 5 minutes
- Alerts user when confirmation chance drops below 50%
- Notifies before chart preparation to enable timely cancellation
- Saves cancellation charges for user

### ⚡ Tatkal Autofill
- Save passenger profiles with berth preferences
- One-click fills entire booking form
- Saves precious seconds during Tatkal window

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Bootstrap, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcryptjs |
| Deployment | Vercel (frontend), Render (backend) |

---

## 🏗️ Architecture