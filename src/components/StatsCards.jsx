import React from 'react'

export default function StatsCards({ stats = {} }) {
  const { totalStudents = 0, activeStudents = 0, inactiveStudents = 0, avgReadiness = 0 } = stats
  const cards = [
    { title: 'Total Students', value: totalStudents },
    { title: 'Active (last 3d)', value: activeStudents },
    { title: 'Inactive', value: inactiveStudents },
    { title: 'Avg Readiness', value: avgReadiness },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.title} className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <div className="text-sm text-gray-500">{c.title}</div>
          <div className="mt-2 text-2xl font-semibold text-gray-800 dark:text-gray-100">{c.value}</div>
        </div>
      ))}
    </div>
  )
}
