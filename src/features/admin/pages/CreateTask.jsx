import { useEffect, useState } from 'react';
import { createAdminTask, getAllStudents } from '../services/adminDataService';
import { appendAdminMessage } from '../../student/services/messageService';
import { getCurrentStudent } from '../../../services/authService';
import '../styles/admin.css';

export default function CreateTask() {
  const [students, setStudents] = useState([]);
  const [assignmentScope, setAssignmentScope] = useState('single');
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [itemType, setItemType] = useState('task');
  const [adminMessage, setAdminMessage] = useState('');
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
      const normalizedTitle = itemType === 'test' ? `[Test] ${title}` : title;
      const createdBy = getCurrentStudent()?.uid || 'admin';
      if (assignmentScope === 'all') {
        const uniqueStudentIds = [...new Set(students.map((student) => student.uid || student.id).filter(Boolean))];
        if (!uniqueStudentIds.length) {
          throw new Error('No students found to assign this task.');
        }
        await Promise.all(
          uniqueStudentIds.map((studentId) =>
            createAdminTask({ userId: studentId, title: normalizedTitle, completed: false, status: 'pending', createdBy })
          )
        );
      } else {
        await createAdminTask({ userId, title: normalizedTitle, completed: false, status: 'pending', createdBy });
      }
      if (assignmentScope === 'single' && adminMessage.trim()) {
        await appendAdminMessage({ userId, text: adminMessage });
      }
      setTitle('');
      setAdminMessage('');
      setMessage(
        assignmentScope === 'all'
          ? `${itemType === 'test' ? 'Test' : 'Task'} assigned to all students successfully.`
          : `${itemType === 'test' ? 'Test' : 'Task'} and message saved successfully.`
      );
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
        <label htmlFor="type-select">Type</label>
        <select id="type-select" value={itemType} onChange={(event) => setItemType(event.target.value)}>
          <option value="task">Task</option>
          <option value="test">Test</option>
        </select>

        <label htmlFor="assignment-select">Assign To</label>
        <select
          id="assignment-select"
          value={assignmentScope}
          onChange={(event) => setAssignmentScope(event.target.value)}
        >
          <option value="single">Specific Student</option>
          <option value="all">All Students</option>
        </select>

        <label htmlFor="student-select">Student</label>
        <select
          id="student-select"
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          required={assignmentScope === 'single'}
          disabled={assignmentScope === 'all'}
        >
          <option value="">{assignmentScope === 'all' ? 'All students selected' : 'Select a student'}</option>
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
          placeholder={`Enter ${itemType} title`}
          required
        />

        <label htmlFor="admin-message">Message to Student</label>
        <textarea
          id="admin-message"
          value={adminMessage}
          onChange={(event) => setAdminMessage(event.target.value)}
          placeholder={
            assignmentScope === 'all'
              ? 'Optional: use Student Messages tab for direct student notifications'
              : 'Add instruction or motivation for this task'
          }
          rows={4}
          disabled={assignmentScope === 'all'}
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
