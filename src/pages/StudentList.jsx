import React, { useEffect, useState } from 'react'
import StudentTable from '../components/StudentTable'
import { getAllStudents, activitiesCol, db, query, where, getDocs } from '../firebase/config'
import { Line, Bar } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend } from 'chart.js'

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

export default function StudentList() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [activities, setActivities] = useState([])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const studs = await getAllStudents()
        // fetch total activity counts per student (optimized: only minimal queries)
        const withMeta = await Promise.all(studs.map(async s => {
          const q = query(activitiesCol, where('uid', '==', s.uid || s.id))
          const snaps = await getDocs(q)
          return {
            ...s,
            totalActivities: snaps.size,
            status: (s.lastActiveDate && s.lastActiveDate.toMillis() < Date.now() - 3 * 24 * 60 * 60 * 1000) ? 'Inactive' : 'Active',
          }
        }))
        if (!mounted) return
        setStudents(withMeta)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  async function handleSelect(s) {
    setSelected(s)
    setActivities([])
    try {
      const q = query(activitiesCol, where('uid', '==', s.uid || s.id))
      const snaps = await getDocs(q)
      setActivities(snaps.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Students</h1>
      {loading && <div>Loading students...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <StudentTable students={students} onSelect={handleSelect} />

      {selected && (
        <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h2 className="text-xl mb-2">{selected.name} — Activities</h2>
          {activities.length === 0 && <div>No activities found</div>}
          {activities.length > 0 && (
            <Bar data={{ labels: activities.map(a => new Date(a.date.seconds * 1000).toLocaleDateString()), datasets: [{ label: 'Coding Problems', data: activities.map(a => a.codingProblemsSolved || 0), backgroundColor: '#60A5FA' }] }} />
          )}
        </div>
      )}
    </div>
  )
}
