import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react'

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
      if (data.user.role === 'citizen') navigate('/community')
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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4 relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white mb-1">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">GrievanceAI Portal</h1>
          <p className="text-xs text-slate-400 font-medium">DARPG Problem Statement 09</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-500 min-h-[44px]"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-500 min-h-[44px]"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full btn-primary py-3.5 font-bold text-base shadow-lg shadow-blue-500/25 min-h-[48px]">
            Sign In to Portal <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 font-bold hover:underline">
            Register as Citizen
          </Link>
        </p>

        {/* Quick Demo Fill Buttons */}
        <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
          <p className="font-bold text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> One-Click Demo Logins:
          </p>
          <div className="space-y-1">
            <button 
              type="button" 
              onClick={() => fillDemo('citizen@grievance.ai', 'citizen123')}
              className="w-full text-left p-2 rounded-xl hover:bg-slate-800 text-slate-300 flex justify-between font-mono transition-colors text-xs"
            >
              <span>Citizen: citizen@grievance.ai</span>
              <span className="font-sans text-[11px] text-blue-400 font-bold underline">Fill</span>
            </button>
            <button 
              type="button" 
              onClick={() => fillDemo('water@grievance.ai', 'officer123')}
              className="w-full text-left p-2 rounded-xl hover:bg-slate-800 text-slate-300 flex justify-between font-mono transition-colors text-xs"
            >
              <span>Officer: water@grievance.ai</span>
              <span className="font-sans text-[11px] text-blue-400 font-bold underline">Fill</span>
            </button>
            <button 
              type="button" 
              onClick={() => fillDemo('admin@grievance.ai', 'admin123')}
              className="w-full text-left p-2 rounded-xl hover:bg-slate-800 text-slate-300 flex justify-between font-mono transition-colors text-xs"
            >
              <span>Admin: admin@grievance.ai</span>
              <span className="font-sans text-[11px] text-blue-400 font-bold underline">Fill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
