import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ThumbsUp, Search, MapPin, Sparkles, Filter, PlusCircle, Flame, Clock, Image as ImageIcon, CheckCircle2, ArrowRight } from 'lucide-react'
import { API_URL } from '../config'
const CATEGORIES = ['All', 'Water Supply', 'Electricity', 'Roads & Infrastructure', 'Sanitation', 'Public Transport', 'Healthcare', 'Education', 'Corruption & Misconduct']

export default function CommunityFeed() {
  const [grievances, setGrievances] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('upvotes') // 'upvotes' or 'newest'
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCommunityIssues()
  }, [selectedCategory, sortBy])

  const fetchCommunityIssues = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== 'All') params.append('category', selectedCategory)
      if (searchQuery) params.append('search', searchQuery)
      if (sortBy) params.append('sort', sortBy)

      const res = await axios.get(`${API_URL}/api/grievances/community?${params}`)
      setGrievances(res.data)
    } catch (err) {
      console.error('Failed to load community issues:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchCommunityIssues()
  }

  const handleUpvote = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()

    setGrievances(prev => prev.map(g => {
      if (g._id === id) {
        const nextHasUpvoted = !g.hasUpvoted
        const nextUpvoteCount = nextHasUpvoted ? g.upvoteCount + 1 : Math.max(0, g.upvoteCount - 1)
        return { ...g, hasUpvoted: nextHasUpvoted, upvoteCount: nextUpvoteCount }
      }
      return g
    }))

    try {
      const res = await axios.post(`${API_URL}/api/grievances/${id}/upvote`)
      setGrievances(prev => prev.map(g => {
        if (g._id === id) {
          return {
            ...g,
            upvoteCount: res.data.upvoteCount,
            hasUpvoted: res.data.hasUpvoted,
            priority: res.data.priority || g.priority
          }
        }
        return g
      }))
    } catch (err) {
      console.error('Upvote failed:', err)
      fetchCommunityIssues()
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Banner with Sleek Aesthetic Gradient */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 fill-amber-300" /> Community Priority Feed
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Citizen Upvote &amp; Priority Feed</h1>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Community-driven civic prioritization platform. Upvote high-impact issues to raise priority for faster official department resolution.
          </p>
        </div>

        <Link
          to="/submit"
          className="relative z-10 btn-primary bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-amber-500/25 border-0 shrink-0 min-h-[48px] text-sm"
        >
          <PlusCircle className="w-5 h-5 text-slate-950" /> Report New Issue
        </Link>
      </div>

      {/* Filter & Search Bar Toolbar */}
      <div className="card p-5 space-y-4 shadow-sm bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title, location, or keyword..."
              className="input-field pl-11"
            />
          </form>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort:</span>
            <button
              onClick={() => setSortBy('upvotes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[40px] ${
                sortBy === 'upvotes'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Most Upvoted
            </button>
            <button
              onClick={() => setSortBy('newest')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[40px] ${
                sortBy === 'newest'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Newest First
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl font-bold shrink-0 transition-all min-h-[38px] ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 font-semibold">Loading community reported issues...</div>
      ) : grievances.length === 0 ? (
        <div className="card text-center py-20 text-slate-500 space-y-3">
          <p className="text-lg font-bold text-slate-800">No issues found matching your filter</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Be the first to report an issue in this category to get official response.</p>
          <Link to="/submit" className="btn-primary inline-flex items-center gap-2 text-xs font-bold mt-2">
            <PlusCircle className="w-4 h-4" /> Report Issue Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {grievances.map(g => (
            <div
              key={g._id}
              onClick={() => navigate(`/track/${g._id}`)}
              className="card p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl border-slate-200/90 flex flex-col justify-between group"
            >
              <div>
                {/* Media Image */}
                {g.imageUrl && (
                  <div className="mb-4 rounded-2xl overflow-hidden h-48 bg-slate-100 relative shadow-inner">
                    <img
                      src={g.imageUrl}
                      alt={g.title || 'Issue Photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="absolute top-3 right-3 bg-slate-900/80 text-white text-[11px] px-2.5 py-1 rounded-full font-semibold backdrop-blur-md flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" /> Photo Attached
                    </div>
                  </div>
                )}

                {/* Metadata Pills */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`badge ${
                      g.priority === 'Critical' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                      g.priority === 'High' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {g.priority} Priority
                    </span>
                    <span className="badge bg-slate-100 text-slate-700 border border-slate-200">{g.category}</span>
                  </div>

                  <span className={`badge ${
                    g.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    g.status === 'Escalated' ? 'bg-rose-100 text-rose-700' :
                    'bg-indigo-100 text-indigo-700 border border-indigo-200'
                  }`}>
                    {g.status}
                  </span>
                </div>

                {/* Title & Body */}
                <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {g.title || g.rawText.slice(0, 50)}
                </h3>
                <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed mb-4">
                  {g.rawText}
                </p>
              </div>

              {/* Card Footer: Location & Upvote Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate max-w-[60%] font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{g.location?.text || 'Location not specified'}</span>
                </div>

                {/* Upvote Button with Micro-interaction */}
                <button
                  onClick={(e) => handleUpvote(g._id, e)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-[0.94] ${
                    g.hasUpvoted
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-200/80'
                  }`}
                  title={g.hasUpvoted ? 'Upvoted' : 'Click to upvote'}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${g.hasUpvoted ? 'fill-white' : ''}`} />
                  <span className="text-xs font-extrabold">{g.upvoteCount || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
