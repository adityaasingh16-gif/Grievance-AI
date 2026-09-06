import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, MapPin, User, Clock, ShieldCheck } from 'lucide-react'
import UpvoteButton from '../components/UpvoteButton'
import { formatDistanceToNow } from 'date-fns'
import { API_URL } from '../config'

export default function IssueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchIssueDetail()
  }, [id])

  const fetchIssueDetail = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/api/issues/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      setIssue(res.data)
    } catch (err) {
      console.error('Failed to load issue detail:', err)
      setError('Issue not found or removed.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-500 font-medium">Loading issue details...</div>
  }

  if (error || !issue) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <p className="text-red-600 font-semibold">{error || 'Issue not found'}</p>
        <button onClick={() => navigate('/community')} className="btn-secondary text-xs font-bold px-4 py-2">
          Return to Community Feed
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <button
        onClick={() => navigate('/community')}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Community Feed
      </button>

      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm space-y-6">
        {/* Header Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div className="flex items-center gap-2">
            <span className="badge bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full text-xs">
              {issue.category}
            </span>
            <span className={`badge px-3 py-1 rounded-full text-xs font-bold ${
              issue.status === 'Resolved' ? 'bg-green-100 text-green-700' :
              issue.status === 'InProgress' ? 'bg-amber-100 text-amber-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {issue.status}
            </span>
          </div>

          <UpvoteButton
            issueId={issue._id}
            initialCount={issue.upvoteCount}
            initialHasVoted={issue.hasVoted}
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
          {issue.title}
        </h1>

        {/* Reporter & Meta Details */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-700">Reported by {issue.reportedBy || 'Citizen'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{issue.createdAt ? formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true }) : ''}</span>
          </div>
          {issue.location?.text && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-700">{issue.location.text}</span>
            </div>
          )}
        </div>

        {/* Image Attachment */}
        {issue.imageUrl && (
          <div className="rounded-xl overflow-hidden max-h-[400px] bg-gray-100 border border-gray-200">
            <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-contain" />
          </div>
        )}

        {/* Description Body */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Issue Description</h3>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
            {issue.description}
          </p>
        </div>

        {/* Priority Signal Note */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-900">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Community Priority Impact:</span> Upvotes directly influence how municipal departments prioritize local maintenance and repair schedules.
          </div>
        </div>
      </div>
    </div>
  )
}
