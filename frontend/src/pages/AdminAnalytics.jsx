import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts'
import { FileText, CheckCircle2, Clock, AlertTriangle, Layers, Activity, Sparkles } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || ''
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/analytics/dashboard`)
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-slate-500 font-semibold">Loading platform analytics...</div>
  if (!data) return <div className="text-center py-20 text-rose-500 font-bold">Failed to load analytics metrics.</div>

  const { overview, categoryDistribution, departmentLoad, priorityDistribution, weeklyTrend, duplicateClusters } = data

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Analytics &amp; Governance</h1>
          <p className="text-sm text-slate-500">Real-time metrics, workload breakdown, community priority trends, and SLA performance.</p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 flex items-center gap-4 border-l-4 border-l-blue-600 bg-white/90">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900">{overview.total}</p>
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Total Grievances</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 border-l-4 border-l-emerald-500 bg-white/90">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900">{overview.resolved}</p>
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Resolved</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 border-l-4 border-l-amber-500 bg-white/90">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900">{overview.pending}</p>
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Pending</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 border-l-4 border-l-rose-600 bg-white/90">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-rose-600">{overview.slaBreaches}</p>
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">SLA Breaches</p>
          </div>
        </div>
      </div>

      {/* Semantic Clustering Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white rounded-2xl p-5 shadow-lg border border-indigo-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 backdrop-blur-md text-amber-300 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="font-extrabold text-white text-base">FAISS Semantic Vector Clustering Engine</p>
            <p className="text-xs text-slate-300 mt-0.5">
              Discovered <strong className="text-amber-300 font-extrabold">{duplicateClusters} duplicate clusters</strong> using multilingual e5 embeddings.
            </p>
          </div>
        </div>
        <span className="badge bg-white/20 text-white border border-white/20 font-mono text-xs">Top-K Vector Index Active</span>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="card shadow-sm border-slate-200/80">
          <h3 className="font-extrabold text-slate-900 text-base mb-4">Grievances by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryDistribution.map(d => ({ name: d._id, count: d.count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Severity Pie */}
        <div className="card shadow-sm border-slate-200/80">
          <h3 className="font-extrabold text-slate-900 text-base mb-4">Priority Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={priorityDistribution.map(d => ({ name: d._id, value: d.count }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
              >
                {priorityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Department Workload */}
        <div className="card shadow-sm border-slate-200/80">
          <h3 className="font-extrabold text-slate-900 text-base mb-4">Pending Workload by Department</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={departmentLoad.map(d => ({ name: d._id, pending: d.count }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip />
              <Bar dataKey="pending" fill="#f59e0b" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend */}
        <div className="card shadow-sm border-slate-200/80">
          <h3 className="font-extrabold text-slate-900 text-base mb-4">Weekly Inflow vs. Resolution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="submitted" stroke="#3b82f6" strokeWidth={2.5} name="Submitted" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2.5} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
