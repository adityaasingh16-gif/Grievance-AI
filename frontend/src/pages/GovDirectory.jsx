import { useState, useEffect } from 'react'
import axios from 'axios'
import { Phone, Search, ShieldAlert, HeartPulse, Flame, Lock, Building2, ChevronDown, ChevronUp } from 'lucide-react'
import ServiceCard from '../components/ServiceCard'
import { API_URL } from '../config'

const CATEGORY_ICONS = {
  'Police & Emergency': ShieldAlert,
  'Healthcare & Hospitals': HeartPulse,
  'Fire & Disaster Response': Flame,
  'Cyber Crime Helpline': Lock,
  'Municipal & Utility Services': Building2
}

export default function GovDirectory() {
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [collapsedCategories, setCollapsedCategories] = useState({})

  useEffect(() => {
    fetchDirectory()
  }, [])

  const fetchDirectory = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL}/api/gov-services`)
      setCategories(res.data)
    } catch (err) {
      console.error('Failed to load government services directory:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategoryCollapse = (catName) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }))
  }

  // Filter contacts based on search query & active category tab
  const filteredCategories = categories.map(cat => {
    if (activeCategory !== 'All' && cat.category !== activeCategory) return null

    const matchingContacts = cat.contacts.filter(c => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.number.toLowerCase().includes(q) ||
        (c.info && c.info.toLowerCase().includes(q)) ||
        cat.category.toLowerCase().includes(q)
      )
    })

    if (matchingContacts.length === 0) return null

    return {
      ...cat,
      contacts: matchingContacts
    }
  }).filter(Boolean)

  const totalContactsCount = categories.reduce((acc, c) => acc + c.contacts.length, 0)

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-red-900 via-rose-900 to-primary-950 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Phone className="w-5 h-5 text-red-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-300">Public Government Emergency Directory</span>
          </div>
          <h1 className="text-2xl font-extrabold">Emergency &amp; Government Helplines</h1>
          <p className="text-sm text-red-100 mt-1 max-w-xl">
            Instant 1-tap call and copy access to National Police, Ambulance, Fire, Cyber Crime (1930), and Municipal Services.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 text-center shrink-0">
          <p className="text-xs text-red-200 uppercase font-semibold">National Emergency Toll-Free</p>
          <p className="text-3xl font-extrabold text-white mt-0.5 font-mono">112</p>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white p-4 space-y-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search helpline (e.g. Police 100, Cyber 1930, Ambulance 108, Water 1916, Electricity 19123)..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none bg-gray-50"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-3.5 py-2 rounded-xl font-bold shrink-0 transition-colors ${
              activeCategory === 'All'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Helplines ({totalContactsCount})
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

      {/* Directory Accordions / Listings */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-16 text-gray-500 font-medium">Loading official helplines...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-500 border border-gray-200">
            No emergency helplines found matching your search query.
          </div>
        ) : (
          filteredCategories.map(cat => {
            const CatIcon = CATEGORY_ICONS[cat.category] || Phone
            const isCollapsed = collapsedCategories[cat.category]

            return (
              <div key={cat.category} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {/* Category Accordion Header */}
                <div
                  onClick={() => toggleCategoryCollapse(cat.category)}
                  className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                      <CatIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{cat.category}</h2>
                      <p className="text-xs text-gray-500">{cat.contacts.length} official numbers available</p>
                    </div>
                  </div>

                  <button className="text-gray-500 hover:text-gray-700">
                    {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </button>
                </div>

                {/* Category Contacts Grid */}
                {!isCollapsed && (
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cat.contacts.map(contact => (
                      <ServiceCard key={contact.id || contact._id} service={contact} />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
