import { useEffect, useState } from 'react';
import { createAdminTask, getAllStudents } from '../services/adminDataService';
import '../styles/admin.css';

export default function CreateTask() {
  const [students, setStudents] = useState([]);
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadStudents() {
      try {
        const allStudents = await getAllStudents();
        if (!isMounted) return;
        setStudents(allStudents);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || 'Failed to load students.');
      }
    }

    loadStudents();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      await createAdminTask({ userId, title, completed: false });
      setTitle('');
      setMessage('Task created successfully.');
    } catch (submitError) {
      setError(submitError.message || 'Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-page">
      <h1>Create Task</h1>
      <form onSubmit={handleSubmit} className="admin-form">
        <label htmlFor="student-select">Student</label>
        <select
          id="student-select"
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          required
        >
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student.uid || student.id} value={student.uid || student.id}>
              {student.name} ({student.email || 'No email'})
            </option>
          ))}
        </select>

        <label htmlFor="task-title">Task Title</label>
        <input
          id="task-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter task title"
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </button>
      </form>

      {message && <p>{message}</p>}
      {error && <p className="admin-error">{error}</p>}
    </section>
  );
}
