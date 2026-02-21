import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Loader from './Loader';
import { subscribeToStudentAuth } from '../../services/authService';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToStudentAuth((user) => {
      setStudent(user);
      setIsChecking(false);
    });
    return unsubscribe;
  }, []);

  if (isChecking) {
    return <Loader label="Checking authentication..." />;
  }

  if (!student) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
