import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { PlusCircle, Upload, MapPin, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || ''

const CATEGORIES = ['Roads', 'Sanitation', 'Electricity', 'Public Safety', 'Water Supply', 'Healthcare', 'Education', 'Other']

export default function ReportIssue() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Roads')
  const [locationText, setLocationText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setError('Please provide both issue title and detailed description.')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('category', category)
      formData.append('locationText', locationText)
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/api/issues`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })

      navigate('/community')
    } catch (err) {
      console.error('Failed to post issue:', err)
      setError(err.response?.data?.message || 'Failed to submit community issue. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <button
        onClick={() => navigate('/community')}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Community Feed
      </button>

      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1 text-amber-600">
            <PlusCircle className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Citizen Community Reporting</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Post a Local Civic Issue</h1>
          <p className="text-sm text-gray-500 mt-1">
            Report potholes, broken streetlights, water pipeline leaks, or uncollected garbage to gather community votes.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Issue Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Hazardous deep pothole on MG Road crossing near Sector 4"
              className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-gray-50"
              required
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-gray-50 font-medium"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Location / Locality
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={locationText}
                  onChange={e => setLocationText(e.target.value)}
                  placeholder="e.g. Ward 12, Connaught Place"
                  className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the issue clearly, including how long it has been present and any hazards it poses to the public..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-gray-50 leading-relaxed"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Attach Photo (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-amber-500 transition-colors bg-gray-50">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="issue-photo-input"
              />
              <label htmlFor="issue-photo-input" className="cursor-pointer flex flex-col items-center gap-2">
                {imagePreview ? (
                  <div className="relative max-h-48 overflow-hidden rounded-lg">
                    <img src={imagePreview} alt="Preview" className="max-h-48 object-cover rounded-lg" />
                    <span className="mt-2 text-xs font-bold text-amber-600 block">Click to change photo</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700">Click to upload photo evidence</span>
                    <span className="text-[11px] text-gray-400">PNG, JPG, JPEG up to 5MB</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/community')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-gray-950 bg-amber-500 hover:bg-amber-600 flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {submitting ? (
                <span>Publishing...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Publish Community Issue
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
