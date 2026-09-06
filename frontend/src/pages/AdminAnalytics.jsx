import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts'
import { FileText, CheckCircle, Clock, AlertTriangle, Layers } from 'lucide-react'

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

  if (loading) return <div className="text-center py-12 text-gray-500 font-medium">Loading platform analytics...</div>
  if (!data) return <div className="text-center py-12 text-red-500">Failed to load analytics metrics.</div>

  const { overview, categoryDistribution, departmentLoad, priorityDistribution, weeklyTrend, duplicateClusters } = data

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Intelligence Analytics</h1>
        <p className="text-sm text-gray-500">DARPG PS-09 real-time metrics, workload distribution &amp; SLA monitoring</p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{overview.total}</p>
            <p className="text-xs text-gray-500 font-semibold uppercase">Total Complaints</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{overview.resolved}</p>
            <p className="text-xs text-gray-500 font-semibold uppercase">Successfully Resolved</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{overview.pending}</p>
            <p className="text-xs text-gray-500 font-semibold uppercase">Pending Resolution</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4 border-l-4 border-l-red-500">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{overview.slaBreaches}</p>
            <p className="text-xs text-gray-500 font-semibold uppercase">SLA Breaches</p>
          </div>
        </div>
      </div>

      {/* Semantic Duplicate Cluster Alert banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-indigo-950 text-sm">Semantic Vector Clustering Active</p>
            <p className="text-xs text-indigo-800">
              Discovered <span className="font-bold">{duplicateClusters} active duplicate/near-duplicate clusters</span> using FAISS cosine distance.
            </p>
          </div>
        </div>
        <span className="badge bg-indigo-200 text-indigo-900 font-mono">Top-K Vector Search</span>
      </div>

      {/* Recharts Data Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="card shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Grievance Distribution by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryDistribution.map(d => ({ name: d._id, count: d.count }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Pie Chart */}
        <div className="card shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Priority Severity Split</h3>
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

        {/* Department Workload Vertical Bar Chart */}
        <div className="card shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Pending Workload by Department</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={departmentLoad.map(d => ({ name: d._id, pending: d.count }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="pending" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend Line Chart */}
        <div className="card shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Weekly Grievance Inflow vs. Resolution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="submitted" stroke="#3b82f6" strokeWidth={2} name="Submitted" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
