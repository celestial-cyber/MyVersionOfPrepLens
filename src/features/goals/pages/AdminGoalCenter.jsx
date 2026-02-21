import { useEffect, useMemo, useState } from 'react';
import { getAllStudents } from '../../admin/services/adminDataService';
import { GOAL_ALL_STUDENTS_SCOPE, createWeeklyGoal } from '../services/goalService';

export default function AdminGoalCenter() {
  const [students, setStudents] = useState([]);
  const [title, setTitle] = useState('Solve coding problems');
  const [target, setTarget] = useState(3);
  const [assignToAll, setAssignToAll] = useState(true);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getAllStudents().then(setStudents);
  }, []);

  const selectableStudents = useMemo(() => students.map((student) => ({ id: student.uid, name: student.name })), [students]);

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  async function handleCreate(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      if (assignToAll) {
        await createWeeklyGoal({ uid: GOAL_ALL_STUDENTS_SCOPE, title, target, weekStart: Date.now(), autoAdjust: true });
      } else {
        await Promise.all(selected.map((studentId) => createWeeklyGoal({ uid: studentId, title, target, weekStart: Date.now(), autoAdjust: true })));
      }
      setMessage('Weekly goals created. Targets will auto-adjust by performance.');
      setSelected([]);
    } catch (submitError) {
      setError(submitError.message || 'Failed to create goals.');
    }
  }

  return (
    <section className="admin-page">
      <h1>Smart Weekly Goals</h1>
      <form className="admin-form" onSubmit={handleCreate}>
        <label htmlFor="goal-title">Goal Title</label>
        <input id="goal-title" value={title} onChange={(event) => setTitle(event.target.value)} required />

        <label htmlFor="goal-target">Target Count</label>
        <input id="goal-target" type="number" min="1" value={target} onChange={(event) => setTarget(Number(event.target.value) || 1)} />

        <label className="test-check-row">
          <input type="checkbox" checked={assignToAll} onChange={(event) => setAssignToAll(event.target.checked)} /> Assign to all students
        </label>

        {!assignToAll && (
          <div className="test-student-grid">
            {selectableStudents.map((student) => (
              <label key={student.id} className="test-check-row">
                <input type="checkbox" checked={selected.includes(student.id)} onChange={() => toggle(student.id)} />
                {student.name}
              </label>
            ))}
          </div>
        )}

        <button type="submit">Create Weekly Goal</button>
      </form>
      {message && <p>{message}</p>}
      {error && <p className="admin-error">{error}</p>}
    </section>
  );
}
