import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Filter, Clock, AlertTriangle, CheckCircle2, ArrowRight, ThumbsUp, ShieldAlert } from 'lucide-react'
import { format, isPast } from 'date-fns'
import { API_URL } from '../config'

export default function OfficerDashboard() {
  const [grievances, setGrievances] = useState([])
  const [filter, setFilter] = useState({ status: '', priority: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGrievances()
  }, [filter])

  const fetchGrievances = async () => {
    try {
      setLoading(true)
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
      alert('Failed to resolve: ' + (err.response?.data?.error || err.message))
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Official Department Workspace</h1>
          <p className="text-sm text-slate-500">Inspect assigned grievances, community priority votes, and issue official resolutions.</p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-l-blue-600 bg-white/90">
          <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Total Assigned</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="card p-5 border-l-4 border-l-amber-500 bg-white/90">
          <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Pending Resolution</p>
          <p className="text-3xl font-extrabold text-amber-600 mt-1">{stats.pending}</p>
        </div>
        <div className="card p-5 border-l-4 border-l-rose-600 bg-white/90">
          <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Critical Emergencies</p>
          <p className="text-3xl font-extrabold text-rose-600 mt-1">{stats.critical}</p>
        </div>
        <div className="card p-5 border-l-4 border-l-rose-700 bg-white/90">
          <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">SLA Breached</p>
          <p className="text-3xl font-extrabold text-rose-700 mt-1">{stats.overdue}</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="card p-4 flex flex-wrap items-center gap-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wider">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filter Tasks:</span>
        </div>
        <select
          value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
          className="input-field py-2 text-xs w-auto min-h-[40px]"
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
          className="input-field py-2 text-xs w-auto min-h-[40px]"
        >
          <option value="">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 font-semibold">Loading assigned tasks...</div>
      ) : grievances.length === 0 ? (
        <div className="card text-center py-20 text-slate-500 font-medium">
          No assigned grievances match the selected criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {grievances.map(g => {
            const isOverdue = g.slaDeadline && isPast(new Date(g.slaDeadline)) && g.status !== 'Resolved'

            return (
              <div key={g._id} className={`card p-6 transition-all duration-200 hover:shadow-lg border-slate-200/90 ${isOverdue ? 'border-rose-300 bg-rose-50/30' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge ${
                        g.priority === 'Critical' ? 'bg-rose-100 text-rose-700 font-bold border border-rose-200' :
                        g.priority === 'High' ? 'bg-amber-100 text-amber-800 font-bold border border-amber-200' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {g.priority} Priority
                      </span>
                      <span className="badge bg-slate-100 text-slate-700">{g.department}</span>
                      {g.upvoteCount > 0 && (
                        <span className="badge bg-amber-50 text-amber-800 border border-amber-200 font-extrabold flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 fill-amber-500 text-amber-500" /> {g.upvoteCount} Community Votes
                        </span>
                      )}
                      {isOverdue && (
                        <span className="badge bg-rose-100 text-rose-700 font-extrabold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> SLA Breached
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base mb-1">{g.title || g.rawText.slice(0, 50)}</h3>
                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed mb-3">{g.rawText}</p>

                    <div className="flex items-center gap-6 text-xs text-slate-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        SLA Deadline: {g.slaDeadline ? format(new Date(g.slaDeadline), 'MMM d, HH:mm') : 'N/A'}
                      </span>
                      <span>Citizen: {g.citizenName || 'Anonymous'}</span>
                      <span>Submitted: {format(new Date(g.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Link
                      to={`/grievance/${g._id}`}
                      className="btn-secondary text-xs py-2 px-4 flex items-center justify-center gap-1.5 font-bold min-h-[38px]"
                    >
                      Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    {g.status !== 'Resolved' && (
                      <button
                        onClick={() => handleResolve(g._id)}
                        className="btn-primary text-xs py-2 px-4 flex items-center justify-center gap-1.5 font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 border-0 min-h-[38px]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
