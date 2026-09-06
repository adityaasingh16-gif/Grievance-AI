import { useState, useEffect } from 'react'
import axios from 'axios'
import { Phone, Copy, Check, ShieldAlert, HeartPulse, Flame, Lock, Building2, Search, Clock, ExternalLink } from 'lucide-react'
import { API_URL } from '../config'

const CATEGORY_ICONS = {
  'Police & Emergency': ShieldAlert,
  'Healthcare & Hospitals': HeartPulse,
  'Fire & Disaster Response': Flame,
  'Cyber Crime Helpline': Lock,
  'Municipal & Utility Services': Building2
}

export default function DirectoryPortal() {
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDirectory()
  }, [])

  const fetchDirectory = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/directory`)
      setCategories(res.data)
    } catch (err) {
      console.error('Failed to load directory:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (number, id) => {
    navigator.clipboard.writeText(number)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredCategories = categories.map(cat => {
    if (activeCategory !== 'All' && cat.category !== activeCategory) return null

    const matchingContacts = cat.contacts.filter(c => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return c.name.toLowerCase().includes(q) || c.number.includes(q) || c.info.toLowerCase().includes(q)
    })

    if (matchingContacts.length === 0) return null

    return {
      ...cat,
      contacts: matchingContacts
    }
  }).filter(Boolean)

  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-semibold">Loading Government Helplines Directory...</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Emergency Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-red-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl border border-rose-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider">
            <Phone className="w-4 h-4 text-red-400" /> National Emergency Directory
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Emergency &amp; Government Helplines</h1>
          <p className="text-sm text-rose-100 max-w-xl leading-relaxed">
            Verified official contact directory for Police 112, Fire 101, Ambulance 102, Cyber Crime 1930, and Municipal Utilities.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center shrink-0 shadow-lg">
          <p className="text-[10px] text-red-200 uppercase font-extrabold tracking-widest">National Toll-Free Emergency</p>
          <p className="text-4xl font-extrabold text-white mt-1 font-mono tracking-tight">112</p>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="card p-5 space-y-4 shadow-sm bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search helpline (e.g. Police 100, Cyber 1930, Ambulance 102, Water 1916)..."
            className="input-field pl-11"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-4 py-2 rounded-xl font-bold shrink-0 transition-all min-h-[40px] ${
              activeCategory === 'All'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Helplines ({categories.reduce((acc, c) => acc + c.contacts.length, 0)})
          </button>

          {categories.map(cat => {
            const Icon = CATEGORY_ICONS[cat.category] || Phone
            return (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(cat.category)}
                className={`px-4 py-2 rounded-xl font-bold shrink-0 transition-all flex items-center gap-2 min-h-[40px] ${
                  activeCategory === cat.category
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.category}
              </button>
            )
          })}
        </div>
      </div>

      {/* Directory Category Cards Grid */}
      <div className="space-y-8">
        {filteredCategories.length === 0 ? (
          <div className="card text-center py-16 text-slate-500">
            No emergency helplines match your search query.
          </div>
        ) : (
          filteredCategories.map(cat => {
            const CatIcon = CATEGORY_ICONS[cat.category] || Phone
            return (
              <div key={cat.category} className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200/80">
                  <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl shadow-sm">
                    <CatIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">{cat.category}</h2>
                    <p className="text-xs text-slate-500 font-medium">{cat.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {cat.contacts.map(contact => (
                    <div key={contact.id} className="card p-6 hover:shadow-lg transition-all duration-200 border-slate-200/90 flex flex-col justify-between group">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-rose-600 transition-colors">{contact.name}</h3>
                          <span className={`badge ${
                            contact.type === 'Emergency' || contact.type === 'Fire' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                            contact.type === 'Cyber' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                            'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {contact.type}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">{contact.info}</p>
                        
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Availability: {contact.available}</span>
                        </div>
                      </div>

                      {/* Number & Quick Call Action Bar */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                        <span className="font-mono text-2xl font-extrabold text-slate-900 tracking-tight">
                          {contact.number}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopy(contact.number, contact.id)}
                            className="btn-secondary py-2 px-3.5 text-xs flex items-center gap-1.5 font-bold min-h-[40px]"
                            title="Copy number"
                          >
                            {copiedId === contact.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <a
                            href={`tel:${contact.number.replace(/[^0-9+]/g, '')}`}
                            className="btn-primary bg-rose-600 hover:bg-rose-700 text-white py-2 px-4 text-xs flex items-center gap-1.5 font-bold shadow-md shadow-rose-500/20 border-0 min-h-[40px]"
                          >
                            <Phone className="w-3.5 h-3.5" /> Call Now
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
