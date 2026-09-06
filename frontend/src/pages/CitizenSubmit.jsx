import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Send, MapPin, Loader2, CheckCircle, Sparkles, Image as ImageIcon, FileText } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function CitizenSubmit() {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [location, setLocation] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/api/grievances`, {
        title: title || text.slice(0, 50) + '...',
        rawText: text,
        locationText: location,
        imageUrl: imageUrl
      })
      setResult(res.data.grievance)
    } catch (err) {
      alert(err.response?.data?.error || 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center p-8 border-t-4 border-t-green-500 shadow-lg">
          <div className="inline-flex p-4 bg-green-50 rounded-full mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-1 text-gray-900">Grievance Successfully Registered!</h2>
          <p className="text-sm text-gray-500 mb-6">Your complaint has been processed by GrievanceAI NLP models &amp; published to community feed.</p>

          <div className="bg-gray-50 rounded-xl p-5 text-left mb-6 border border-gray-200">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Grievance Reference ID</p>
                <p className="font-mono font-bold text-gray-900 text-sm">{result._id}</p>
              </div>
              <span className={`badge ${
                result.priority === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                result.priority === 'High' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                Priority: {result.priority}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="text-xs text-gray-500">Title</p>
                <p className="font-semibold text-gray-900 truncate">{result.title || result.rawText.slice(0, 40)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Auto-Detected Department</p>
                <p className="font-semibold text-gray-800">{result.department}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Category &amp; Subcategory</p>
                <p className="font-semibold text-gray-800">{result.category} &gt; {result.subcategory || 'General'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Detected Language</p>
                <p className="font-semibold text-gray-800 capitalize">{result.language || 'English'}</p>
              </div>
            </div>

            {result.aiExplanation?.keywords?.length > 0 && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  AI Key Sentiment Triggers
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.aiExplanation.keywords.map(kw => (
                    <span key={kw} className="badge bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => { setResult(null); setTitle(''); setText(''); setLocation(''); setImageUrl(''); }} 
              className="btn-secondary px-6"
            >
              Report Another Issue
            </button>
            <button 
              onClick={() => navigate('/community')} 
              className="btn-primary px-6"
            >
              View Community Feed
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary-100 rounded-xl text-primary-700">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report a Civic Issue</h1>
          <p className="text-sm text-gray-500">Submissions are auto-categorized by AI and listed on the public community voting feed</p>
        </div>
      </div>

      <div className="card shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Headline / Title */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-600" />
              Issue Headline / Summary Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm font-medium"
              placeholder="e.g. Major Water Pipeline Burst on Sector 12 Main Road"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Write naturally in English, Hindi (हिंदी), or Hinglish (e.g. "Bijli pichle 3 din se nahi aa rahi hai...").
            </p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none min-h-[140px] text-gray-800 text-sm leading-relaxed"
              placeholder="Provide complete details including duration, impact on residents, and urgency..."
              required
              minLength={10}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-400">{text.length} characters (min 10)</span>
              <span className="text-xs text-primary-600 font-medium">Auto Language &amp; Priority Detection Active</span>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-600" />
              Location Landmark / Ward / District (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
              placeholder="e.g. Near Metro Pillar 145, MG Road, Gurugram"
            />
          </div>

          {/* Photo Attachment URL */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary-600" />
              Photo / Image Attachment URL (Optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
              placeholder="https://images.unsplash.com/... or image link"
            />
            {imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden h-32 w-full max-w-xs bg-gray-100 border">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || text.length < 10 || !title.trim()}
            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 font-semibold text-base shadow-md"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {loading ? 'Analyzing with AI & Publishing...' : 'Submit Issue & Publish to Feed'}
          </button>
        </form>
      </div>
    </div>
  )
}
