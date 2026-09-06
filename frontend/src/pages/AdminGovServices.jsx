import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Edit2, Trash2, Shield, Save, X } from 'lucide-react'
import { API_URL } from '../config'

const CATEGORIES = [
  'Police & Emergency',
  'Healthcare & Hospitals',
  'Fire & Disaster Response',
  'Cyber Crime Helpline',
  'Municipal & Utility Services',
  'Other'
]

export default function AdminGovServices() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  
  const [formData, setFormData] = useState({
    category: 'Police & Emergency',
    name: '',
    number: '',
    description: '',
    type: 'Emergency',
    available: '24x7',
    city: 'All-India',
    order: 1
  })

  useEffect(() => {
    fetchDirectory()
  }, [])

  const fetchDirectory = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL}/api/gov-services`)
      setCategories(res.data)
    } catch (err) {
      console.error('Failed to load directory:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddModal = () => {
    setEditingService(null)
    setFormData({
      category: 'Police & Emergency',
      name: '',
      number: '',
      description: '',
      type: 'Emergency',
      available: '24x7',
      city: 'All-India',
      order: 1
    })
    setShowModal(true)
  }

  const handleOpenEditModal = (service) => {
    setEditingService(service)
    setFormData({
      category: service.category || 'Police & Emergency',
      name: service.name || '',
      number: service.number || '',
      description: service.info || service.description || '',
      type: service.type || 'Emergency',
      available: service.available || '24x7',
      city: service.city || 'All-India',
      order: service.order || 1
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this helpline contact?')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/api/gov-services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchDirectory()
    } catch (err) {
      console.error('Delete failed:', err)
      alert(err.response?.data?.message || 'Failed to delete service')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      if (editingService) {
        await axios.put(`${API_URL}/api/gov-services/${editingService.id || editingService._id}`, formData, { headers })
      } else {
        await axios.post(`${API_URL}/api/gov-services`, formData, { headers })
      }

      setShowModal(false)
      fetchDirectory()
    } catch (err) {
      console.error('Save failed:', err)
      alert(err.response?.data?.message || 'Failed to save directory entry')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-primary-900 font-bold text-lg">
            <Shield className="w-5 h-5 text-amber-500" />
            Government Directory Management Panel
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Add, update, or remove official emergency and municipal helpline entries visible to citizens.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn-primary bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Helpline
        </button>
      </div>

      {/* Directory Listings with Admin Actions */}
      {loading ? (
        <div className="text-center py-16 text-gray-500 font-medium">Loading directory entries...</div>
      ) : (
        <div className="space-y-6">
          {categories.map(cat => (
            <div key={cat.category} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-900 text-base">
                {cat.category} ({cat.contacts.length} items)
              </div>

              <div className="divide-y divide-gray-100">
                {cat.contacts.map(item => (
                  <div key={item.id || item._id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{item.name}</span>
                        <span className="font-mono bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded font-extrabold">
                          {item.number}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.info}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal({ ...item, category: cat.category })}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id || item._id)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900 text-lg">
                {editingService ? 'Edit Helpline Contact' : 'Add New Helpline Contact'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm bg-gray-50"
                  required
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Helpline Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. National Cyber Crime Helpline"
                  className="w-full p-2.5 border rounded-xl text-sm bg-gray-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                    placeholder="e.g. 1930"
                    className="w-full p-2.5 border rounded-xl text-sm font-mono bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Type Tag</label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    placeholder="Emergency / Cyber / Ambulance"
                    className="w-full p-2.5 border rounded-xl text-sm bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Short Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief info about service purpose..."
                  rows={2}
                  className="w-full p-2.5 border rounded-xl text-sm bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Availability</label>
                  <input
                    type="text"
                    value={formData.available}
                    onChange={e => setFormData({ ...formData, available: e.target.value })}
                    placeholder="24x7 / 8 AM - 8 PM"
                    className="w-full p-2.5 border rounded-xl text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="All-India / New Delhi"
                    className="w-full p-2.5 border rounded-xl text-sm bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center gap-1 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" /> Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
