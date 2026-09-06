import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Clock, MapPin, User, AlertTriangle, CheckCircle, ArrowLeft, Sparkles, Layers } from 'lucide-react'
import { format } from 'date-fns'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function GrievanceDetail() {
  const { id } = useParams()
  const [grievance, setGrievance] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDetail()
  }, [id])

  const fetchDetail = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/grievances/${id}`)
      setGrievance(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async () => {
    const resolution = prompt('Enter official resolution details:')
    if (!resolution || resolution.trim() === '') return
    try {
      await axios.put(`${API_URL}/api/grievances/${id}/resolve`, { resolutionText: resolution })
      fetchDetail()
    } catch (err) {
      alert('Failed to resolve')
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading grievance detail...</div>
  if (!grievance) return <div className="text-center py-12 text-red-500 font-semibold">Grievance record not found</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/officer" className="inline-flex items-center gap-2 text-sm text-primary-600 font-semibold hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="card shadow-md">
        <div className="flex items-start justify-between pb-4 border-b border-gray-200 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge ${
                grievance.priority === 'Critical' ? 'bg-red-100 text-red-700 font-bold' :
                grievance.priority === 'High' ? 'bg-orange-100 text-orange-700 font-bold' :
                'bg-blue-100 text-blue-700'
              }`}>
                {grievance.priority} Priority
              </span>
              <span className="badge bg-gray-100 text-gray-700">{grievance.department}</span>
              <span className="badge bg-green-100 text-green-700">{grievance.status}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Grievance Ref #{grievance._id}</h1>
          </div>

          {grievance.status !== 'Resolved' && (
            <button onClick={handleResolve} className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4" /> Mark Resolved
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Full Citizen Complaint Text</p>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 text-sm leading-relaxed font-medium">
              "{grievance.rawText}"
            </div>
          </div>

          {grievance.aiSummary && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
              <p className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> AI Executive Summary
              </p>
              <p className="text-sm text-blue-800">{grievance.aiSummary}</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm pt-2">
            <div>
              <p className="text-xs text-gray-500">Citizen Name</p>
              <p className="font-semibold text-gray-800">{grievance.citizenId?.name || grievance.citizenName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Citizen Phone</p>
              <p className="font-semibold text-gray-800">{grievance.citizenId?.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">SLA Target Deadline</p>
              <p className="font-semibold text-gray-800">
                {grievance.slaDeadline ? format(new Date(grievance.slaDeadline), 'MMM d, HH:mm') : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Explainability Card */}
      {grievance.aiExplanation && (
        <div className="card bg-gradient-to-r from-indigo-50/70 to-purple-50/70 border border-indigo-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" /> AI Model Diagnostic Explanation
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-500">Classification Confidence:</span>
              <p className="font-bold text-gray-800 text-sm mt-0.5">{((grievance.aiExplanation.confidence || 0.85) * 100).toFixed(1)}%</p>
            </div>
            <div>
              <span className="text-gray-500">Language Detected:</span>
              <p className="font-bold text-gray-800 text-sm capitalize mt-0.5">{grievance.language || 'en'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
