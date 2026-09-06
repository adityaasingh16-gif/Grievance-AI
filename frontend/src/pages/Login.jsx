import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, Mail, Lock } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = await login(email, password)
      if (data.user.role === 'citizen') navigate('/dashboard')
      else if (data.user.role === 'officer') navigate('/officer')
      else navigate('/analytics')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail)
    setPassword(demoPass)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="card w-full max-w-md shadow-xl border-0">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary-50 rounded-2xl mb-3">
            <Shield className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">GrievanceAI Portal</h1>
          <p className="text-sm text-gray-500 mt-1">DARPG Problem Statement 09</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full btn-primary py-3 font-semibold text-base">
            Sign In
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-semibold hover:underline">
            Register as Citizen
          </Link>
        </p>

        <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100 text-xs">
          <p className="font-semibold text-primary-900 mb-2">One-Click Demo Credentials:</p>
          <div className="space-y-1">
            <button 
              type="button" 
              onClick={() => fillDemo('citizen@grievance.ai', 'citizen123')}
              className="w-full text-left p-1.5 rounded hover:bg-primary-100 text-primary-800 flex justify-between font-mono"
            >
              <span>Citizen: citizen@grievance.ai</span>
              <span className="font-sans text-xs underline">Fill</span>
            </button>
            <button 
              type="button" 
              onClick={() => fillDemo('water@grievance.ai', 'officer123')}
              className="w-full text-left p-1.5 rounded hover:bg-primary-100 text-primary-800 flex justify-between font-mono"
            >
              <span>Officer: water@grievance.ai</span>
              <span className="font-sans text-xs underline">Fill</span>
            </button>
            <button 
              type="button" 
              onClick={() => fillDemo('admin@grievance.ai', 'admin123')}
              className="w-full text-left p-1.5 rounded hover:bg-primary-100 text-primary-800 flex justify-between font-mono"
            >
              <span>Admin: admin@grievance.ai</span>
              <span className="font-sans text-xs underline">Fill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
