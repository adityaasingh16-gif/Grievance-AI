import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Clock, MapPin, User, AlertTriangle, CheckCircle2, Sparkles, ChevronRight, ThumbsUp } from 'lucide-react'
import { format } from 'date-fns'

const API_URL = import.meta.env.VITE_API_URL || ''
const statusSteps = ['Submitted', 'Categorized', 'Assigned', 'InProgress', 'Resolved']

export default function CitizenTrack() {
  const { id } = useParams()
  const [grievances, setGrievances] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGrievances()
  }, [])

  useEffect(() => {
    if (id && grievances.length > 0) {
      const match = grievances.find(g => g._id === id)
      if (match) setSelected(match)
      else fetchDetail(id)
    }
  }, [id, grievances])

  const fetchGrievances = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/grievances/my`)
      setGrievances(res.data)
      if (!id && res.data.length > 0) setSelected(res.data[0])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDetail = async (grievanceId) => {
    try {
      const res = await axios.get(`${API_URL}/api/grievances/${grievanceId}`)
      setSelected(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusIndex = (status) => {
    const idx = statusSteps.indexOf(status)
    return idx >= 0 ? idx : 2
  }

  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-semibold">Loading grievance tracking records...</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Track Your Grievances &amp; SLA</h1>
          <p className="text-sm text-slate-500">Real-time status tracking, official assignment, and AI model diagnostic explainability.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="space-y-3">
          {grievances.map(g => (
            <div
              key={g._id}
              onClick={() => { setSelected(g); fetchDetail(g._id) }}
              className={`card p-4 cursor-pointer transition-all duration-150 hover:shadow-md ${
                selected?._id === g._id ? 'ring-2 ring-blue-500 bg-blue-50/20 border-blue-200' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`badge ${
                  g.priority === 'Critical' ? 'bg-rose-100 text-rose-700 font-bold' :
                  g.priority === 'High' ? 'bg-amber-100 text-amber-800 font-bold' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {g.priority}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {format(new Date(g.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">{g.title || g.rawText.slice(0, 40)}</p>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{g.rawText}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pt-2 border-t border-slate-100">
                <span className="badge bg-slate-100 text-slate-700">{g.department}</span>
                <span className={`badge ${
                  g.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                  g.status === 'Escalated' ? 'bg-rose-100 text-rose-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {g.status}
                </span>
              </div>
            </div>
          ))}

          {grievances.length === 0 && (
            <div className="card text-center py-16 text-slate-500 space-y-2">
              <p className="font-bold text-slate-700">No grievances submitted yet</p>
              <Link to="/submit" className="text-blue-600 font-bold hover:underline text-xs inline-block">
                Submit your first complaint
              </Link>
            </div>
          )}
        </div>

        {/* Right Detail & Timeline View */}
        {selected ? (
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline Progress */}
            <div className="card shadow-sm border-slate-200/80">
              <h3 className="font-extrabold text-slate-900 text-base mb-6 flex items-center justify-between">
                <span>Grievance Resolution Lifecycle</span>
                <span className="text-xs font-mono text-slate-400 font-bold">Ref: {selected._id}</span>
              </h3>

              <div className="flex items-center justify-between relative px-2">
                <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0 rounded-full" />
                <div 
                  className="absolute top-4 left-6 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 -z-0 rounded-full shadow-sm" 
                  style={{ width: `${(getStatusIndex(selected.status) / (statusSteps.length - 1)) * 88}%` }}
                />

                {statusSteps.map((step, i) => {
                  const isActive = i <= getStatusIndex(selected.status)
                  const isCurrent = step === selected.status
                  return (
                    <div key={step} className="flex flex-col items-center relative z-10 bg-white px-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                        isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-200 text-slate-500'
                      } ${isCurrent ? 'ring-4 ring-blue-200' : ''}`}>
                        {isActive && !isCurrent ? '✓' : i + 1}
                      </div>
                      <span className={`text-xs mt-2 font-bold ${isActive ? 'text-blue-700' : 'text-slate-400'}`}>
                        {step}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Complaint Card */}
            <div className="card shadow-sm border-slate-200/80">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="badge bg-blue-50 text-blue-700 border border-blue-200 mb-2 uppercase text-[10px] font-bold">
                    Lang: {selected.language || 'en'}
                  </span>
                  <h3 className="font-extrabold text-xl text-slate-900">{selected.title || 'Complaint Details'}</h3>
                </div>
                {selected.escalationLevel > 0 && (
                  <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200 text-xs font-bold shadow-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Escalated Level {selected.escalationLevel}
                  </div>
                )}
              </div>

              <p className="text-slate-800 mb-6 leading-relaxed text-sm bg-slate-50 p-5 rounded-2xl border border-slate-200/80 font-medium">
                "{selected.rawText}"
              </p>

              {selected.aiSummary && (
                <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-5 mb-6">
                  <p className="text-xs font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" /> AI Executive Summary
                  </p>
                  <p className="text-sm text-blue-800 leading-relaxed font-medium">{selected.aiSummary}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider">Department</p>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">{selected.department}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider">Category</p>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">{selected.category} &gt; {selected.subcategory || 'General'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider">Assigned Officer</p>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400" />
                    {selected.assignedOfficerName || 'Pending Assignment'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider">SLA Target Deadline</p>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {selected.slaDeadline ? format(new Date(selected.slaDeadline), 'MMM d, HH:mm') : 'N/A'}
                  </p>
                </div>
              </div>

              {selected.location?.text && (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 pt-4 border-t border-slate-100">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{selected.location.text}</span>
                </div>
              )}
            </div>

            {/* AI Diagnostics Card */}
            {selected.aiExplanation && (
              <div className="card bg-gradient-to-r from-indigo-50/80 to-blue-50/80 border border-indigo-200/80 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600" /> AI Classification &amp; Sentiment Diagnostics
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold">Classification Confidence:</span>
                    <p className="font-extrabold text-slate-800 text-base mt-0.5">{(selected.aiExplanation.confidence * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Classification Method:</span>
                    <p className="font-bold text-slate-800 text-xs mt-1">{selected.aiExplanation.classificationMethod}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Resolution Notice */}
            {selected.status === 'Resolved' && (
              <div className="card bg-emerald-50 border border-emerald-200 shadow-sm">
                <h3 className="font-bold text-emerald-950 mb-2 flex items-center gap-2 text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Official Resolution Notice
                </h3>
                <p className="text-sm text-emerald-800 leading-relaxed font-medium">{selected.resolutionText}</p>
                <p className="text-xs text-emerald-600 font-bold mt-3">
                  Resolved on: {selected.resolvedAt ? format(new Date(selected.resolvedAt), 'MMM d, yyyy HH:mm') : 'N/A'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 card text-center py-20 text-slate-400">
            Select a grievance from the list to view live tracking and AI insights.
          </div>
        )}
      </div>
    </div>
  )
}
