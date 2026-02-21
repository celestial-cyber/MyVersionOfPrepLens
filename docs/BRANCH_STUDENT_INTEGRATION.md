# PrepLens Progress Update (Student + Admin Integrated)

## 1) Current Branch State

The project now runs with a **shared base architecture** and feature-scoped modules:
- Shared base:
  - `src/App.jsx`
  - `src/main.jsx`
  - `src/firebase.js`
  - `src/services/authService.js`
  - `src/components/common/ProtectedRoute.jsx`
  - `src/styles/global.css`
- Student feature:
  - `src/features/student/**`
- Admin feature:
  - `src/features/admin/**`

Legacy duplicate admin files (old top-level `src/pages/Admin*.jsx`, `src/firebase/config.js`, etc.) are no longer used.

## 2) Auth + Routing (Demo Presentation Mode)

### Single login page for both roles
- Shared login page: `src/pages/Login.jsx`
- Demo allowed emails:
  - `admin@email.com`
  - `student@email.com`
- Role is inferred from email for jury demo flow.

### Role-based route protection
- Implemented via `ProtectedRoute` + `allowedRoles`.
- Student protected routes:
  - `/student/dashboard`
  - `/student/log`
  - `/student/messages`
- Admin protected routes:
  - `/admin/dashboard`
  - `/admin/students`
  - `/admin/create-task`
- `/admin/login` now redirects to `/login` (single-login experience).

## 3) Firestore Data Contract Alignment

Student and admin flows are aligned on the same contract:
- `profiles/{uid}` -> `name, email, targetExam, grade`
- `progress/{uid}` -> `readinessScore, streakDays, completedTasks`
- `tasks/{taskId}` -> `userId, title, completed`
- `activities/{activityId}` -> `userId, day, hours, topic, createdAt`

### Verified shared behavior
- Admin creates tasks into `tasks` with `userId`.
- Student dashboard subscribes to tasks filtered by same `userId`.
- Result: admin-assigned tasks are visible in student dashboard.

## 4) New Student/Admin Interaction Added

### Admin -> Student messages
- Admin can append a message while creating a task.
- New student page: `src/features/student/pages/StudentMessages.jsx`
- Service: `src/features/student/services/messageService.js`
- Firestore collection used: `messages`
  - `userId`, `text`, `from`, `createdAt`

### Student navigation updated
- Added “Admin Messages” link in:
  - `src/features/student/layout/Navbar.jsx`
  - `src/features/student/layout/StudentLayout.jsx`

## 5) Daily Log Backend Improvements

Updated `src/features/student/services/activityService.js`:
- Input validation for hours and auth presence.
- On activity log, updates `progress/{uid}` with:
  - incremented `streakDays`
  - updated `readinessScore` baseline
- Maintains local fallback behavior if Firebase is unavailable.

## 6) UI/Styling Progress

### Monochrome visual alignment
- Global black/white/gray style remains in `src/styles/global.css`.
- Admin styling updated to match student monochrome language:
  - `src/features/admin/styles/admin.css`
  - Monochrome chart colors in admin pages.

## 7) Files Added/Changed in This Progress Phase

### Added
- `src/features/student/pages/StudentMessages.jsx`
- `src/features/student/services/messageService.js`

### Updated
- `src/App.jsx`
- `src/pages/Login.jsx`
- `src/services/authService.js`
- `src/components/common/ProtectedRoute.jsx`
- `src/features/admin/pages/AdminDashboard.jsx`
- `src/features/admin/pages/StudentList.jsx`
- `src/features/admin/pages/CreateTask.jsx`
- `src/features/admin/styles/admin.css`
- `src/features/student/services/activityService.js`
- `src/features/student/layout/Navbar.jsx`
- `src/features/student/layout/StudentLayout.jsx`
- `src/features/student/styles/studentDashboard.css`

### Removed
- `src/features/admin/pages/AdminLogin.jsx` (single-login model now used)

## 8) Demo Notes for Jury

For demonstration, use:
- Admin login: `admin@email.com`
- Student login: `student@email.com`

Suggested demo flow:
1. Login as admin.
2. Create a task + message for student.
3. Login as student.
4. Show task visibility on dashboard and message visibility on `/student/messages`.

## 9) Known Demo Constraints

- Current email-based role split is intentionally simplified for presentation.
- Production flow should enforce roles from Firebase Auth + Firestore rules/custom claims.
- Firestore security rules should explicitly allow admin writes and user-scoped student reads.

## 10) Next Recommended Step After Jury

- Replace demo email-role logic with secure role checks from backend claims or `roles/{uid}`.
- Add an admin message center (separate from task creation) for richer communication.
