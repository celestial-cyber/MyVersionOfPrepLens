import { useEffect, useState } from 'react';
import { getCurrentStudent, subscribeToStudentAuth } from '../../../services/authService';
import { deleteMessageForUser, subscribeMessagesForUser } from '../services/messageService';
import '../styles/studentDashboard.css';

function formatDate(value) {
  if (!value) return 'Just now';
  return new Date(value).toLocaleString();
}

export default function StudentMessages() {
  const [student, setStudent] = useState(getCurrentStudent());
  const [messages, setMessages] = useState([]);
  const [deletingMessageId, setDeletingMessageId] = useState('');

  useEffect(() => {
    let stopMessages = () => {};

    const stopAuth = subscribeToStudentAuth((user) => {
      setStudent(user);
      stopMessages();

      if (!user?.uid) {
        setMessages([]);
        return;
      }

      stopMessages = subscribeMessagesForUser(user.uid, setMessages);
    });

    return () => {
      stopMessages();
      stopAuth();
    };
  }, []);

  async function handleDeleteMessage(messageId) {
    const userId = student?.uid || '';
    if (!userId) return;
    const shouldDelete = window.confirm('Delete this message?');
    if (!shouldDelete) return;
    setDeletingMessageId(messageId);
    try {
      await deleteMessageForUser({ userId, messageId });
    } catch (error) {
      console.error('Failed to delete message.', error);
    } finally {
      setDeletingMessageId('');
    }
  }

  return (
    <section className="dashboard-page">
      <h1 className="dashboard-title">Admin Messages</h1>
      <p className="dashboard-meta">Messages for: {student?.email || 'Unknown student'}</p>
      <div className="dashboard-section">
        {messages.length === 0 && (
          <>
            <p className="dashboard-empty">No admin messages yet.</p>
            <ul className="dashboard-simple-list">
              <li>Demo tip: Ask your trainer to assign a task from Admin Create Task page.</li>
              <li>Once assigned, messages appear here as notifications.</li>
            </ul>
          </>
        )}
        {messages.length > 0 && (
          <ul className="message-list">
            {messages.map((message) => (
              <li key={message.id} className="message-item">
                <div className="message-row">
                  <p className="message-text">{message.text}</p>
                  <button
                    type="button"
                    className="item-delete-btn"
                    disabled={deletingMessageId === message.id}
                    onClick={() => handleDeleteMessage(message.id)}
                  >
                    {deletingMessageId === message.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
                <p className="message-time">{formatDate(message.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
