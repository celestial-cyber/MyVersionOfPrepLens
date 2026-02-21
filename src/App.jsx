import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentLayout from './features/student/layout/StudentLayout';
import StudentDashboard from './features/student/pages/StudentDashboard';
import LogActivity from './features/student/pages/LogActivity';
import StudentMessages from './features/student/pages/StudentMessages';
import ProtectedRoute from './components/common/ProtectedRoute';
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
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="log" element={<LogActivity />} />
        <Route path="log-activity" element={<LogActivity />} />
        <Route path="messages" element={<StudentMessages />} />
      </Route>

      <Route path="/admin/login" element={<Navigate to="/login" replace />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute redirectPath="/login" allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute redirectPath="/login" allowedRoles={['admin']}>
            <StudentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/create-task"
        element={
          <ProtectedRoute redirectPath="/login" allowedRoles={['admin']}>
            <CreateTask />
          </ProtectedRoute>
        }
      />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
    </Routes>
  );
}
