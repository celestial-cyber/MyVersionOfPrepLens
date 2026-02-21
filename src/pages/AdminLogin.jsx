import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, getUserDoc, signOut } from '../firebase/config'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(email, password)
      const uid = cred.user.uid
      const userDoc = await getUserDoc(uid)
      if (!userDoc || userDoc.role !== 'admin') {
        await signOut()
        setError('Unauthorized: admin access required')
        setLoading(false)
        return
      }
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded shadow">
        <h2 className="text-2xl mb-4 text-gray-800 dark:text-gray-100">Admin Login</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <label className="block mb-2">
          <span className="text-sm text-gray-700 dark:text-gray-200">Email</span>
          <input className="mt-1 block w-full p-2 border rounded" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label className="block mb-4">
          <span className="text-sm text-gray-700 dark:text-gray-200">Password</span>
          <input type="password" className="mt-1 block w-full p-2 border rounded" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <button type="submit" disabled={loading} className="w-full py-2 bg-indigo-600 text-white rounded">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
