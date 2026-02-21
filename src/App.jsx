import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentLayout from './features/student/layout/StudentLayout';
import StudentDashboard from './features/student/pages/StudentDashboard';
import LogActivity from './features/student/pages/LogActivity';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLogin from './features/admin/pages/AdminLogin';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import StudentList from './features/admin/pages/StudentList';
import CreateTask from './features/admin/pages/CreateTask';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="log" element={<LogActivity />} />
        <Route path="log-activity" element={<LogActivity />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute redirectPath="/admin/login">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute redirectPath="/admin/login">
            <StudentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/create-task"
        element={
          <ProtectedRoute redirectPath="/admin/login">
            <CreateTask />
          </ProtectedRoute>
        }
      />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
    </Routes>
  );
}
