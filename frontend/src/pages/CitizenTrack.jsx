import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Clock, MapPin, User, AlertTriangle, CheckCircle, ChevronRight, Sparkles } from 'lucide-react'
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
    return <div className="text-center py-12 text-gray-500 font-medium">Loading citizen grievances track record...</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Track Grievance Resolution &amp; SLA</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Grievance List */}
        <div className="space-y-3">
          {grievances.map(g => (
            <div
              key={g._id}
              onClick={() => { setSelected(g); fetchDetail(g._id) }}
              className={`card p-4 cursor-pointer transition-all hover:shadow-md ${
                selected?._id === g._id ? 'ring-2 ring-primary-500 bg-primary-50/30' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`badge ${
                  g.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                  g.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {g.priority}
                </span>
                <span className="text-xs text-gray-400">
                  {format(new Date(g.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2">{g.rawText}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="badge bg-gray-100">{g.department}</span>
                <span className={`badge ${
                  g.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                  g.status === 'Escalated' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {g.status}
                </span>
              </div>
            </div>
          ))}

          {grievances.length === 0 && (
            <div className="card text-center py-12 text-gray-500">
              <p className="mb-2">No grievances submitted yet</p>
              <Link to="/dashboard" className="text-primary-600 font-semibold hover:underline text-sm">
                Submit your first complaint
              </Link>
            </div>
          )}
        </div>

        {/* Right Side: Grievance Detailed Tracking */}
        {selected ? (
          <div className="lg:col-span-2 space-y-6">
            {/* SLA Status Timeline */}
            <div className="card shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-6 flex items-center justify-between">
                <span>Grievance Lifecycle Progress</span>
                <span className="text-xs font-normal text-gray-500">Ref: {selected._id}</span>
              </h3>

              <div className="flex items-center justify-between relative px-2">
                <div className="absolute top-4 left-6 right-6 h-1 bg-gray-200 -z-0" />
                <div 
                  className="absolute top-4 left-6 h-1 bg-primary-600 transition-all duration-500 -z-0" 
                  style={{ width: `${(getStatusIndex(selected.status) / (statusSteps.length - 1)) * 88}%` }}
                />

                {statusSteps.map((step, i) => {
                  const isActive = i <= getStatusIndex(selected.status)
                  const isCurrent = step === selected.status
                  return (
                    <div key={step} className="flex flex-col items-center relative z-10 bg-white px-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isActive ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                      } ${isCurrent ? 'ring-4 ring-primary-200' : ''}`}>
                        {isActive && !isCurrent ? '✓' : i + 1}
                      </div>
                      <span className={`text-xs mt-2 font-medium ${isActive ? 'text-primary-700' : 'text-gray-400'}`}>
                        {step}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Complaint Details Card */}
            <div className="card shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="badge bg-primary-100 text-primary-700 uppercase mb-2">
                    Lang: {selected.language || 'en'}
                  </span>
                  <h3 className="font-bold text-lg text-gray-900">Original Complaint Text</h3>
                </div>
                {selected.escalationLevel > 0 && (
                  <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-3 py-1 rounded-lg border border-red-200 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    Escalation Level {selected.escalationLevel}
                  </div>
                )}
              </div>

              <p className="text-gray-800 mb-6 leading-relaxed text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                "{selected.rawText}"
              </p>

              {selected.aiSummary && (
                <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 mb-6">
                  <p className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    AI Executive Summary
                  </p>
                  <p className="text-sm text-blue-800">{selected.aiSummary}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="font-semibold text-gray-800">{selected.department}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Category & Subcategory</p>
                  <p className="font-semibold text-gray-800">{selected.category} &gt; {selected.subcategory || 'General'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Assigned Officer</p>
                  <p className="font-semibold text-gray-800 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {selected.assignedOfficerName || 'Pending Assignment'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">SLA Resolution Target</p>
                  <p className="font-semibold text-gray-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {selected.slaDeadline ? format(new Date(selected.slaDeadline), 'MMM d, HH:mm') : 'N/A'}
                  </p>
                </div>
              </div>

              {selected.location?.text && (
                <div className="flex items-center gap-2 text-sm text-gray-600 pt-3 border-t border-gray-100">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{selected.location.text}</span>
                </div>
              )}
            </div>

            {/* AI Classification & Explainability Panel */}
            {selected.aiExplanation && (
              <div className="card bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border border-indigo-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  AI Model Classification Explanation
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Model Confidence:</span>
                    <span className="font-bold text-gray-800">{((selected.aiExplanation.confidence || 0.85) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Classification Method:</span>
                    <span className="font-medium text-gray-800">{selected.aiExplanation.classificationMethod}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Extracted Key Sentiment Tokens:</span>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {selected.aiExplanation.keywords?.map(kw => (
                        <span key={kw} className="badge bg-white text-indigo-700 border border-indigo-200">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resolution Information */}
            {selected.status === 'Resolved' && (
              <div className="card bg-green-50 border border-green-200">
                <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Official Resolution Notice
                </h3>
                <p className="text-sm text-green-800 leading-relaxed">{selected.resolutionText}</p>
                <p className="text-xs text-green-600 mt-2">
                  Resolved on: {selected.resolvedAt ? format(new Date(selected.resolvedAt), 'MMM d, yyyy HH:mm') : 'N/A'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 card text-center py-16 text-gray-400">
            Select a grievance from the left to view live status tracking and AI insights.
          </div>
        )}
      </div>
    </div>
  )
}
