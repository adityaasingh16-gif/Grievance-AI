import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Filter, Clock, AlertTriangle, CheckCircle, ArrowRight, ShieldAlert } from 'lucide-react'
import { format, isPast } from 'date-fns'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function OfficerDashboard() {
  const [grievances, setGrievances] = useState([])
  const [filter, setFilter] = useState({ status: '', priority: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGrievances()
  }, [filter])

  const fetchGrievances = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)
      if (filter.priority) params.append('priority', filter.priority)

      const res = await axios.get(`${API_URL}/api/grievances/assigned?${params}`)
      setGrievances(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (id) => {
    const resolution = prompt('Enter official resolution details for citizen record:')
    if (!resolution || resolution.trim() === '') return
    try {
      await axios.put(`${API_URL}/api/grievances/${id}/resolve`, { resolutionText: resolution })
      fetchGrievances()
    } catch (err) {
      alert('Failed to resolve grievance: ' + (err.response?.data?.error || err.message))
    }
  }

  const stats = {
    total: grievances.length,
    pending: grievances.filter(g => g.status !== 'Resolved').length,
    critical: grievances.filter(g => g.priority === 'Critical' && g.status !== 'Resolved').length,
    overdue: grievances.filter(g => g.slaDeadline && isPast(new Date(g.slaDeadline)) && g.status !== 'Resolved').length
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Official Workspace</h1>
          <p className="text-sm text-gray-500">Manage, prioritize, and resolve assigned citizen grievances</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500 font-semibold uppercase">Total Assigned</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="card p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-gray-500 font-semibold uppercase">Pending Resolution</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
        </div>
        <div className="card p-4 border-l-4 border-l-red-500">
          <p className="text-xs text-gray-500 font-semibold uppercase">Critical Emergencies</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.critical}</p>
        </div>
        <div className="card p-4 border-l-4 border-l-rose-600">
          <p className="text-xs text-gray-500 font-semibold uppercase">SLA Breached / Overdue</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">{stats.overdue}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card p-4 flex items-center gap-4 bg-white shadow-sm">
        <Filter className="w-5 h-5 text-gray-400" />
        <span className="text-sm font-semibold text-gray-700">Filter By:</span>
        <select
          value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
          className="border rounded-lg px-3 py-1.5 text-sm bg-gray-50"
        >
          <option value="">All Statuses</option>
          <option value="Assigned">Assigned</option>
          <option value="InProgress">In Progress</option>
          <option value="Escalated">Escalated</option>
          <option value="Resolved">Resolved</option>
        </select>
        <select
          value={filter.priority}
          onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}
          className="border rounded-lg px-3 py-1.5 text-sm bg-gray-50"
        >
          <option value="">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Grievance Task List */}
      <div className="space-y-4">
        {grievances.map(g => {
          const isOverdue = g.slaDeadline && isPast(new Date(g.slaDeadline)) && g.status !== 'Resolved'

          return (
            <div key={g._id} className={`card transition-all hover:shadow-md ${isOverdue ? 'border-red-300 bg-red-50/40' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${
                      g.priority === 'Critical' ? 'bg-red-100 text-red-700 font-bold border border-red-200' :
                      g.priority === 'High' ? 'bg-orange-100 text-orange-700 font-bold border border-orange-200' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {g.priority}
                    </span>
                    <span className="badge bg-gray-100 text-gray-700">{g.department}</span>
                    <span className="badge bg-primary-50 text-primary-700 border border-primary-100 uppercase">
                      {g.language || 'en'}
                    </span>
                    {isOverdue && (
                      <span className="badge bg-rose-100 text-rose-700 flex items-center gap-1 font-bold">
                        <AlertTriangle className="w-3 h-3" /> SLA Breached
                      </span>
                    )}
                  </div>

                  <p className="font-semibold text-gray-900 mb-2 leading-snug">{g.rawText}</p>

                  <div className="flex items-center gap-6 text-xs text-gray-500 mt-3">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      SLA Target: {g.slaDeadline ? format(new Date(g.slaDeadline), 'MMM d, HH:mm') : 'N/A'}
                    </span>
                    <span>Citizen: {g.citizenName || 'Anonymous'}</span>
                    <span>Submitted: {format(new Date(g.createdAt), 'MMM d, yyyy')}</span>
                  </div>

                  {g.aiExplanation?.keywords?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {g.aiExplanation.keywords.map(kw => (
                        <span key={kw} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Link
                    to={`/grievance/${g._id}`}
                    className="btn-secondary text-xs py-2 px-3 flex items-center justify-center gap-1 font-semibold"
                  >
                    Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  {g.status !== 'Resolved' && (
                    <button
                      onClick={() => handleResolve(g._id)}
                      className="btn-primary text-xs py-2 px-3 flex items-center justify-center gap-1 font-semibold bg-green-600 hover:bg-green-700 shadow-none"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {grievances.length === 0 && (
          <div className="card text-center py-16 text-gray-500">
            No assigned grievances found for the selected filters.
          </div>
        )}
      </div>
    </div>
  )
}
