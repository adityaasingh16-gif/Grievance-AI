import { useState } from 'react'
import { ThumbsUp } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function UpvoteButton({ issueId, initialCount = 0, initialHasVoted = false, onVoteToggle }) {
  const [upvoteCount, setUpvoteCount] = useState(initialCount)
  const [hasVoted, setHasVoted] = useState(initialHasVoted)
  const [loading, setLoading] = useState(false)

  const handleVote = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (loading) return

    // Optimistic UI update
    const prevCount = upvoteCount
    const prevVoted = hasVoted
    const nextVoted = !hasVoted
    const nextCount = nextVoted ? prevCount + 1 : Math.max(0, prevCount - 1)

    setHasVoted(nextVoted)
    setUpvoteCount(nextCount)
    if (onVoteToggle) onVoteToggle(nextCount, nextVoted)

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await axios.post(
        `${API_URL}/api/issues/${issueId}/vote`,
        {},
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )
      setUpvoteCount(res.data.upvoteCount)
      setHasVoted(res.data.hasVoted)
      if (onVoteToggle) onVoteToggle(res.data.upvoteCount, res.data.hasVoted)
    } catch (err) {
      console.error('Vote failed:', err)
      // Revert optimistic update
      setHasVoted(prevVoted)
      setUpvoteCount(prevCount)
      if (onVoteToggle) onVoteToggle(prevCount, prevVoted)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleVote}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
        hasVoted
          ? 'bg-amber-500 text-gray-950 ring-2 ring-amber-300 font-extrabold'
          : 'bg-gray-100 text-gray-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200'
      }`}
      title={hasVoted ? 'Click to remove your vote' : 'Click to upvote this issue'}
    >
      <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-gray-950' : ''}`} />
      <span>{upvoteCount}</span>
    </button>
  )
}
