import { useNavigate } from 'react-router-dom'
import { MapPin, Image as ImageIcon, Clock, User } from 'lucide-react'
import UpvoteButton from './UpvoteButton'
import { formatDistanceToNow } from 'date-fns'

const CATEGORY_COLORS = {
  Roads: 'bg-amber-100 text-amber-800 border-amber-200',
  Sanitation: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Electricity: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Public Safety': 'bg-red-100 text-red-800 border-red-200',
  'Water Supply': 'bg-blue-100 text-blue-800 border-blue-200',
  Healthcare: 'bg-purple-100 text-purple-800 border-purple-200',
  Education: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Other: 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function IssueCard({ issue }) {
  const navigate = useNavigate()

  const badgeClass = CATEGORY_COLORS[issue.category] || CATEGORY_COLORS['Other']

  const getRelativeTime = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
    } catch {
      return 'recently'
    }
  }

  return (
    <div
      onClick={() => navigate(`/issue/${issue._id}`)}
      className="card p-5 cursor-pointer transition-all hover:shadow-md hover:border-primary-300 flex flex-col justify-between group bg-white border border-gray-200 rounded-xl"
    >
      <div>
        {/* Optional Image Banner */}
        {issue.imageUrl && (
          <div className="mb-4 rounded-xl overflow-hidden h-44 bg-gray-100 relative">
            <img
              src={issue.imageUrl}
              alt={issue.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-medium backdrop-blur-sm flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> Photo Attached
            </div>
          </div>
        )}

        {/* Top Badges & Meta */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`badge px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}>
            {issue.category}
          </span>
          <span className={`badge text-xs px-2 py-0.5 rounded-md font-bold ${
            issue.status === 'Resolved' ? 'bg-green-100 text-green-700' :
            issue.status === 'InProgress' ? 'bg-amber-100 text-amber-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {issue.status}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base mb-1.5 group-hover:text-primary-600 transition-colors line-clamp-1">
          {issue.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-xs line-clamp-3 leading-relaxed mb-4">
          {issue.description}
        </p>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
        <div className="space-y-0.5 text-xs text-gray-500 max-w-[65%] truncate">
          <div className="flex items-center gap-1 truncate">
            <User className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="truncate">Reported by {issue.reportedBy || 'Citizen'}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <Clock className="w-3 h-3 text-gray-400 shrink-0" />
            <span>{getRelativeTime(issue.createdAt)}</span>
            {issue.location?.text && (
              <>
                <span>•</span>
                <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="truncate">{issue.location.text}</span>
              </>
            )}
          </div>
        </div>

        {/* Upvote Toggle */}
        <UpvoteButton
          issueId={issue._id}
          initialCount={issue.upvoteCount}
          initialHasVoted={issue.hasVoted}
        />
      </div>
    </div>
  )
}
