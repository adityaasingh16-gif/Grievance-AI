import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Search, Flame, Clock, PlusCircle, Filter } from 'lucide-react'
import IssueCard from '../components/IssueCard'

const API_URL = import.meta.env.VITE_API_URL || ''

const CATEGORIES = ['All', 'Roads', 'Sanitation', 'Electricity', 'Public Safety', 'Water Supply', 'Healthcare', 'Education', 'Other']

export default function CommunityFeed() {
  const [issues, setIssues] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('votes') // 'votes' or 'new'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIssues()
  }, [selectedCategory, sortBy])

  const fetchIssues = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (selectedCategory !== 'All') params.append('category', selectedCategory)
      if (searchQuery) params.append('search', searchQuery)
      if (sortBy) params.append('sort', sortBy)

      const res = await axios.get(`${API_URL}/api/issues?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      setIssues(res.data.issues || [])
    } catch (err) {
      console.error('Failed to load community issues:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchIssues()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Public Community Voting Feed</span>
          </div>
          <h1 className="text-2xl font-extrabold">Community Issue Prioritization</h1>
          <p className="text-sm text-primary-200 mt-1 max-w-xl">
            Upvote local civic issues in your neighborhood. Issues with higher community votes give municipal departments a bottom-up priority signal.
          </p>
        </div>

        <Link
          to="/report-issue"
          className="btn-primary bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-3 px-5 rounded-xl flex items-center gap-2 shadow-md shrink-0 border-0 text-sm"
        >
          <PlusCircle className="w-5 h-5 text-gray-950" /> Report Local Issue
        </Link>
      </div>

      {/* Filter & Search Bar Toolbar */}
      <div className="bg-white p-4 space-y-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search community issues by title, description, or locality..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none bg-gray-50"
            />
          </form>

          {/* Sort Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-500 font-semibold uppercase">Sort By:</span>
            <button
              onClick={() => setSortBy('votes')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
                sortBy === 'votes'
                  ? 'bg-amber-500 text-gray-950 font-extrabold shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" /> Most Upvoted
            </button>
            <button
              onClick={() => setSortBy('new')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
                sortBy === 'new'
                  ? 'bg-primary-900 text-white font-extrabold shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Newest
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-semibold shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-500 font-medium">Loading community reported issues...</div>
      ) : issues.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500 border border-gray-200 space-y-3">
          <p className="text-base font-semibold text-gray-800">No community issues reported yet in this category</p>
          <p className="text-xs text-gray-500">Be the first in your area to post an issue and gather upvotes!</p>
          <div>
            <Link to="/report-issue" className="btn-primary inline-flex items-center gap-2 text-xs font-bold px-4 py-2 mt-2">
              <PlusCircle className="w-4 h-4" /> Report Issue Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {issues.map(issue => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  )
}
