# Student Branch Documentation and Admin Integration Guide

## 1) What this branch currently contains

### App/runtime setup
- Vite + React app scaffold
- Router setup in `src/App.jsx`
- Firebase SDK integrated (`firebase`, `auth`, `firestore`)
- Chart.js used for student activity chart

### Auth
- Firebase email/password auth flow
- Register/login pages:
  - `src/pages/Register.jsx`
  - `src/pages/Login.jsx`
- Auth service:
  - `src/services/authService.js`
- Protected routes:
  - `src/components/common/ProtectedRoute.jsx`

### Student module moved to feature folder
All student dashboard code is grouped under:
- `src/features/student/`

Structure:
- `layout/`:
  - `StudentLayout.jsx`
  - `Navbar.jsx`
  - `studentLayout.css`
- `pages/`:
  - `StudentDashboard.jsx`
  - `LogActivity.jsx`
- `dashboard/components/`:
  - `SummaryCards.jsx`
  - `ActivityChart.jsx` (Chart.js)
  - `StreakCard.jsx`
  - `TaskList.jsx`
- `services/`:
  - `activityService.js`
  - `taskService.js`
  - `studentDataService.js`
- `styles/`:
  - `studentDashboard.css`

### Styling conventions now in place
- Global link style: black/gray and no underline
- Global button style: black solid button box
- File: `src/styles/global.css`

### Environment/config
- Firebase config read from `.env` via:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
- Runtime config file:
  - `src/firebase.js`

## 2) Data model contract (used by student side)

If admin branch writes to this contract, student dashboard updates in real-time.

### Collections and docs
- `profiles/{uid}`
  - `name: string`
  - `email: string`
  - `targetExam: string`
  - `grade: string`

- `progress/{uid}`
  - `readinessScore: number`
  - `streakDays: number`
  - `completedTasks: number`

- `tasks/{taskId}`
  - `userId: string` (Firebase uid)
  - `title: string`
  - `completed: boolean`

- `activities/{activityId}`
  - `userId: string` (Firebase uid)
  - `day: string`
  - `hours: number`
  - `topic: string`
  - `createdAt: timestamp`

## 3) Common base files for both student + admin branches

These should be kept single-source shared files:
- `src/firebase.js`
- `src/services/authService.js`
- `src/components/common/ProtectedRoute.jsx`
- `src/styles/global.css`
- `src/App.jsx` (root route registry only)
- `src/main.jsx`
- `.env.example`
- `package.json`

Feature-specific files should stay isolated:
- `src/features/student/**`
- `src/features/admin/**` (to be created/migrated similarly)

## 4) How to integrate admin branch safely

## Step A: move admin code to feature folder first
Before merging, in admin branch, move admin files to:
- `src/features/admin/layout/`
- `src/features/admin/pages/`
- `src/features/admin/services/`
- `src/features/admin/styles/`

This avoids collisions with student files.

## Step B: unify shared services
When merging, keep exactly one copy of:
- `src/firebase.js`
- `src/services/authService.js`

If both branches changed them, merge manually and preserve:
- env-based Firebase config from this branch
- all auth methods needed by both dashboards

## Step C: unify router
In `src/App.jsx` register both route trees:
- `/student/*` -> `features/student/...`
- `/admin/*` -> `features/admin/...`

Keep login/register common unless admin needs separate auth UI.

## Step D: merge dependencies once
In `package.json` keep union of deps from both branches.
Do not duplicate version entries.

Current student-side required deps:
- `firebase`
- `react-router-dom`
- `chart.js`
- `react-chartjs-2`

## Step E: standardize Firestore schema
Admin writes must match the student contract in section 2.
If admin currently writes different field names, add a mapping layer in admin services.

## Step F: Firestore security rules (minimum)
Use uid-scoped rules for student reads and controlled admin writes.
At minimum:
- student can read/write their own docs
- admin role can read/write all

Role source can be custom claims or a `roles/{uid}` doc.

## 5) Merge conflict hotspots and resolution policy

Likely conflict files:
- `src/App.jsx`
- `src/firebase.js`
- `src/services/authService.js`
- `package.json`
- `src/styles/global.css`

Resolution policy:
1. Keep shared/base files in root shared locations.
2. Keep all feature code in `src/features/{featureName}`.
3. Prefer additive merges in router and package deps.
4. Never duplicate firebase init in multiple files.
5. Keep one auth source (`src/services/authService.js`).

## 6) Quick validation checklist after merge

- `npm install`
- `npm run build`
- login works for student
- login works for admin
- student route renders
- admin route renders
- admin update to `profiles/progress/tasks/activities` reflects on student dashboard live

## 7) Optional next improvement

Add explicit barrel exports to reduce import path churn:
- `src/features/student/index.js`
- `src/features/admin/index.js`

This keeps `App.jsx` cleaner and future merges easier.
