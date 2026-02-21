import React, { useEffect, useState } from 'react'
import { getAllStudents, activitiesCol, db, query, where, getDocs } from '../firebase/config'
import StatsCards from '../components/StatsCards'
import { Pie, Bar } from 'react-chartjs-2'
import { Chart, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'

Chart.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function AdminDashboard() {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const students = await getAllStudents()
        // compute stats
        const now = Date.now()
        const activeCut = now - 3 * 24 * 60 * 60 * 1000
        let active = 0
        let inactive = 0
        let sumReadiness = 0
        for (const s of students) {
          const last = s.lastActiveDate ? s.lastActiveDate.toMillis() : 0
          if (last >= activeCut) active++
          else inactive++
          sumReadiness += s.readinessScore || 0
        }
        const avg = students.length ? Math.round((sumReadiness / students.length) * 100) / 100 : 0

        if (!mounted) return
        setStats({ totalStudents: students.length, activeStudents: active, inactiveStudents: inactive, avgReadiness: avg })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (loading) return <div className="p-8">Loading dashboard...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>

  // Simple sample charts (static placeholder queries)
  const pieData = {
    labels: ['Active', 'Inactive'],
    datasets: [{ data: [stats.activeStudents, stats.inactiveStudents], backgroundColor: ['#60A5FA', '#A78BFA'] }],
  }

  const barData = {
    labels: ['Coding', 'Aptitude', 'Core', 'SoftSkills'],
    datasets: [{ label: 'Activity distribution', data: [40, 30, 20, 10], backgroundColor: '#60A5FA' }],
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Admin Dashboard</h1>
      <StatsCards stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="mb-2">Active vs Inactive</h3>
          <Pie data={pieData} />
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="mb-2">Activity distribution</h3>
          <Bar data={barData} />
        </div>
      </div>
    </div>
  )
}
