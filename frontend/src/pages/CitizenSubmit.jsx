import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Send, MapPin, Loader2, CheckCircle2, Sparkles, Image as ImageIcon, FileText, ArrowRight } from 'lucide-react'
import { API_URL } from '../config'

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
        <div className="card text-center p-8 border-t-4 border-t-emerald-500 shadow-xl space-y-6">
          <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-3xl shadow-inner mx-auto">
            <CheckCircle2 className="w-16 h-16" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Grievance Successfully Registered!</h2>
            <p className="text-sm text-slate-500 mt-1">Processed by GrievanceAI NLP models &amp; published to community feed.</p>
          </div>

          <div className="bg-slate-50/80 rounded-2xl p-6 text-left border border-slate-200/80 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200/80">
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Reference ID</p>
                <p className="font-mono font-bold text-slate-900 text-sm">{result._id}</p>
              </div>
              <span className={`badge ${
                result.priority === 'Critical' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                result.priority === 'High' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                Priority: {result.priority}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 font-semibold">Headline</p>
                <p className="font-bold text-slate-800 truncate text-sm mt-0.5">{result.title || result.rawText.slice(0, 40)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">Auto-Assigned Dept</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{result.department}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">Category &amp; Subcategory</p>
                <p className="font-bold text-slate-800 mt-0.5">{result.category} &gt; {result.subcategory || 'General'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">Detected Language</p>
                <p className="font-bold text-slate-800 capitalize mt-0.5">{result.language || 'English'}</p>
              </div>
            </div>

            {result.aiExplanation?.keywords?.length > 0 && (
              <div className="pt-3 border-t border-slate-200/80">
                <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Key Sentiment Triggers
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
              View Community Feed <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Report a Civic Issue</h1>
          <p className="text-sm text-slate-500">AI automatically categorizes complaints and lists them on the public priority voting feed.</p>
        </div>
      </div>

      <div className="card shadow-md border-slate-200/80 bg-white/95">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Headline */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Issue Headline / Summary Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input-field font-semibold text-slate-900"
              placeholder="e.g. Dangerous Water Pipeline Burst in Sector 12"
              required
            />
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-2.5">
              Describe in English, Hindi (हिंदी), or Hinglish (e.g. "Bijli pichle 3 din se nahi aa rahi hai...").
            </p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:outline-none min-h-[140px] text-slate-800 text-sm leading-relaxed placeholder:text-slate-400"
              placeholder="Provide complete details including location landmark, affected residents count, and severity..."
              required
              minLength={10}
            />
            <div className="flex justify-between items-center mt-1.5 text-xs">
              <span className="text-slate-400 font-medium">{text.length} characters (min 10)</span>
              <span className="text-blue-600 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Auto-NLP Active
              </span>
            </div>
          </div>

          {/* Location Landmark */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Location Landmark / District (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="input-field"
              placeholder="e.g. Sector 12, Dwarka, New Delhi"
            />
          </div>

          {/* Photo Attachment URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              Photo / Image Attachment URL (Optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="input-field"
              placeholder="https://images.unsplash.com/... or photo URL"
            />
            {imageUrl && (
              <div className="mt-3 rounded-2xl overflow-hidden h-36 w-full max-w-sm bg-slate-100 border border-slate-200 shadow-md">
                <img
                  src={imageUrl}
                  alt="Attachment Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || text.length < 10 || !title.trim()}
            className="w-full btn-primary py-3.5 font-bold text-base shadow-lg shadow-blue-500/25 min-h-[48px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {loading ? 'Analyzing with Multilingual AI...' : 'Submit & Publish to Community Feed'}
          </button>
        </form>
      </div>
    </div>
  )
}
