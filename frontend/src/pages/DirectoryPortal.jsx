import { useState, useEffect } from 'react'
import axios from 'axios'
import { Phone, Copy, Check, ShieldAlert, HeartPulse, Flame, Lock, Building2, Search, Clock, ExternalLink } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || ''

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

  // Filter contacts based on search and category tab
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
    return <div className="text-center py-16 text-gray-500 font-medium">Loading Government Helplines Directory...</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Portal Header */}
      <div className="bg-gradient-to-r from-red-900 via-rose-900 to-primary-950 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Phone className="w-5 h-5 text-red-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-300">Official Government Emergency Directory</span>
          </div>
          <h1 className="text-2xl font-extrabold">Emergency &amp; Essential Services Portal</h1>
          <p className="text-sm text-red-100 mt-1 max-w-xl">
            Quick-action contact numbers for Police, Fire, Ambulance, Cyber Crime 1930, and Municipal Utilities across India.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 text-center shrink-0">
          <p className="text-xs text-red-200 uppercase font-semibold">National Emergency Toll-Free</p>
          <p className="text-3xl font-extrabold text-white mt-0.5 font-mono">112</p>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="card p-4 space-y-4 shadow-sm bg-white">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search helpline by department (e.g. Police 100, Cyber 1930, Ambulance 102, Water 1916)..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none bg-gray-50"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-3.5 py-2 rounded-xl font-bold shrink-0 transition-colors ${
              activeCategory === 'All'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                className={`px-3.5 py-2 rounded-xl font-bold shrink-0 transition-colors flex items-center gap-1.5 ${
                  activeCategory === cat.category
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.category}
              </button>
            )
          })}
        </div>
      </div>

      {/* Category Listings */}
      <div className="space-y-8">
        {filteredCategories.length === 0 ? (
          <div className="card text-center py-16 text-gray-500">
            No emergency helplines match your search query.
          </div>
        ) : (
          filteredCategories.map(cat => {
            const CatIcon = CATEGORY_ICONS[cat.category] || Phone
            return (
              <div key={cat.category} className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-gray-200">
                  <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                    <CatIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{cat.category}</h2>
                    <p className="text-xs text-gray-500">{cat.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cat.contacts.map(contact => (
                    <div key={contact.id} className="card p-5 hover:shadow-md transition-shadow border-gray-200 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-900 text-base">{contact.name}</h3>
                          <span className={`badge ${
                            contact.type === 'Emergency' || contact.type === 'Fire' ? 'bg-red-100 text-red-700 font-bold' :
                            contact.type === 'Cyber' ? 'bg-indigo-100 text-indigo-700 font-bold' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {contact.type}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 mb-3 leading-relaxed">{contact.info}</p>
                        
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>Availability: {contact.available}</span>
                        </div>
                      </div>

                      {/* Number & Quick Action Buttons */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
                        <span className="font-mono text-xl font-extrabold text-gray-900 tracking-tight">
                          {contact.number}
                        </span>

                        <div className="flex gap-2">
                          {/* Copy Button */}
                          <button
                            onClick={() => handleCopy(contact.number, contact.id)}
                            className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 font-semibold"
                            title="Copy phone number to clipboard"
                          >
                            {copiedId === contact.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-green-600" />
                                <span className="text-green-700">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-gray-600" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          {/* Direct Call Button */}
                          <a
                            href={`tel:${contact.number.replace(/[^0-9+]/g, '')}`}
                            className="btn-primary bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 text-xs flex items-center gap-1 font-semibold border-0 shadow-sm"
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
