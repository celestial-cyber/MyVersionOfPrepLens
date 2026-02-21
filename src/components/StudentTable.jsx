import React from 'react'

export default function StudentTable({ students = [], onSelect }) {
  return (
    <div className="overflow-auto bg-white dark:bg-gray-800 rounded shadow mt-4">
      <table className="w-full table-auto">
        <thead>
          <tr className="text-left border-b">
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Total Activities</th>
            <th className="p-3">Readiness</th>
            <th className="p-3">Last Active</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.uid || s.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => onSelect && onSelect(s)}>
              <td className="p-3">{s.name}</td>
              <td className="p-3">{s.email}</td>
              <td className="p-3">{s.totalActivities ?? 0}</td>
              <td className="p-3">{s.readinessScore ?? 0}</td>
              <td className="p-3">{s.lastActiveDate ? new Date(s.lastActiveDate.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
              <td className="p-3">{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
