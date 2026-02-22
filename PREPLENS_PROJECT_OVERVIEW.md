

# 🚀 PrepLens — Smart Placement Preparation Tracker

**PrepLens** is an placement preparation platform that bridges the gap between academic learning and industry readiness.
It provides **role-based dashboards** for Students and Admins, along with AI-driven insights to guide preparation effectively.

**Built by Team Celestial Voyagers ✨**

---

# 📌 Overview

PrepLens helps students prepare systematically for placements while enabling coordinators to monitor and guide progress.

### 🎯 Core Goals

* Track preparation progress
* Identify weak areas using AI
* Enable admin-guided preparation
* Provide structured mock interview tracking
* Deliver actionable improvement plans

---

# 🧩 Feature Mapping

| Concept                 | Implementation                         | Status |
| ----------------------- | -------------------------------------- | ------ |
| Comprehensive Dashboard | Readiness Score, streaks, tasks        | ✅ Done |
| Daily Progress Tracking | Activity Logging + Firestore Sync      | ✅ Done |
| Admin Control Center    | Student management + tasks + messaging | ✅ Done |
| AI Assessment Reports   | OpenAI GPT-4o-mini powered insights    | ✅ Done |
| Guided Testing Module   | Categorized tests + scoring            | ✅ Done |
| Mock Interview Prep     | Interview logging + feedback           | ✅ Done |
| Notifications           | Real-time alerts & reminders           | ✅ Done |

---

# 👥 User Flow

## 🎓 Student Journey

1. Login → Student Dashboard
2. Track preparation via Activity Log
3. Take categorized tests
4. Receive AI performance report
5. Follow assigned tasks & admin messages

## 🧑‍💼 Admin Journey

1. Login → Admin Dashboard
2. Monitor student readiness
3. Assign tasks & send guidance
4. Analyze test performance reports

---

# 🛠️ Tech Stack

### Frontend

* React + Vite
* Tailwind CSS + Custom CSS
* Framer Motion
* Chart.js (`react-chartjs-2`)
* React Router DOM

### Backend & Cloud

* Firebase Auth
* Firebase Firestore
* OpenAI API (`gpt-4o-mini`)
* jsPDF for AI report export
* Local fallback DB (Offline support)

---

# ⚡ Quick Start

### Prerequisites

* Node.js 18+
* npm 9+

### Install

```bash
npm install
```

### Run Dev Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

---

# 🔐 Environment Variables

Create `.env` file from `.env.example` and add:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

If missing → App runs in demo mode.

---

# 🗂️ Firestore Database Structure

```
Firestore
│
├── profiles/{uid}
│   ├── name
│   ├── email
│   ├── targetExam
│   ├── grade
│   ├── role
│   ├── createdAt
│   └── updatedAt
│
├── progress/{uid}
│   ├── readinessScore
│   ├── streakDays
│   ├── completedTasks
│   └── lastActiveAt
│
├── activities/{activityId}
│   ├── userId
│   ├── day
│   ├── hours
│   ├── topic
│   ├── category
│   └── createdAt
│
├── tasks/{taskId}
│   ├── userId
│   ├── title
│   ├── status
│   ├── scope
│   ├── createdBy
│   └── timestamps
│
├── tests/{testId}
│   ├── title
│   ├── categories[]
│   ├── assignedTo[]
│   ├── difficulty
│   ├── questionIds[]
│   └── deadline
│
├── testResults/{resultId}
│   ├── uid
│   ├── testId
│   ├── answers[]
│   ├── score
│   ├── categoryWiseScore
│   └── submittedAt
│
├── aiReports/{reportId}
│   ├── strengths[]
│   ├── weaknesses[]
│   ├── improvementPlan[]
│   ├── summary
│   └── generatedAt
│
├── weeklyGoals/{goalId}
├── mockInterviews/{mockId}
└── notifications/{notificationId}
```

---

# 🧠 Question Bank

* Total Questions → **50**
* Aptitude → **15**
* Technical → **15**
* Reasoning → **10**
* Verbal → **10**

System auto-selects **20 random questions** per test.

---

# 📈 Real-World Value

PrepLens solves the **“Directionless Preparation Problem”** by:

* Providing structured prep tracking
* Delivering AI-driven feedback
* Enabling placement coordinators to guide students
* Creating printable improvement plans

---

# ⚙️ Scalability Design

* Modular feature folders (`src/features/`)
* Firestore indexing ready
* Local offline fallback
* JSON-mode AI responses for reliability
* Role-based architecture

---

# 🌟 Unique Innovations

* AI Report PDF generator
* Sync-first offline support
* Admin-guided preparation ecosystem
* Hybrid persistence system

---

# 📁 Project Structure

```
PrepLens/
│
├── src/
│   ├── features/
│   │   ├── admin/
│   │   ├── student/
│   │   ├── testing/
│   │   ├── insights/
│   │   └── auth/
│   │
│   ├── components/
│   ├── services/
│   ├── utils/
│   └── App.jsx
│
├── docs/
│   └── FIRESTORE_SCHEMA.md
│
├── .env.example
├── package.json
└── README.md
```

---

# 🧑‍💻 Team

**Built by Team Celestial Voyagers** 🚀

---

# 📌 Future Improvements

* Company-wise mock interview simulator
* Resume analyzer
* Placement prediction AI
* Mobile app version
* Peer-to-peer mock interviews


