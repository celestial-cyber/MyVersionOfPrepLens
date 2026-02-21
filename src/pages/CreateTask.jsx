import React, { useState } from 'react'
import { createTask } from '../firebase/config'

export default function CreateTask() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await createTask({
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
        createdByAdmin: true,
      })
      setSuccess('Task created')
      setTitle('')
      setDescription('')
      setDeadline('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Create Daily Quest</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm">Deadline</label>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="mt-1 p-2 border rounded" />
        </div>
        <button disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Saving...' : 'Create Task'}</button>
      </form>
    </div>
  )
}
