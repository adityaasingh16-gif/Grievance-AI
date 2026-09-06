import { useState } from 'react'
import { Phone, Copy, Check, Clock, Shield } from 'lucide-react'

export default function ServiceCard({ service, onEdit, onDelete, isAdmin = false }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(service.number)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const cleanNumber = service.number.replace(/[^0-9+]/g, '')

  return (
    <div className="card p-5 hover:shadow-md transition-all border border-gray-200 bg-white rounded-xl flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-bold text-gray-900 text-base">{service.name}</h3>
          <span className={`badge shrink-0 text-xs px-2 py-0.5 rounded-full font-bold ${
            service.type === 'Emergency' || service.type === 'Fire' ? 'bg-red-100 text-red-700' :
            service.type === 'Cyber' ? 'bg-indigo-100 text-indigo-700' :
            service.type === 'Ambulance' ? 'bg-emerald-100 text-emerald-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {service.type || 'Hotline'}
          </span>
        </div>

        <p className="text-xs text-gray-600 mb-3 leading-relaxed">{service.info || service.description}</p>
        
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{service.available || '24x7'}</span>
          </div>
          {service.city && (
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-gray-400" />
              <span>{service.city}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto gap-2">
        <span className="font-mono text-xl font-extrabold text-gray-900 tracking-tight">
          {service.number}
        </span>

        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
            title="Copy number to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-500" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Call Button */}
          <a
            href={`tel:${cleanNumber}`}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" /> Call Now
          </a>

          {isAdmin && (
            <div className="flex items-center gap-1 ml-1 border-l pl-2 border-gray-200">
              <button
                onClick={() => onEdit(service)}
                className="text-xs font-semibold text-blue-600 hover:underline px-1"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(service.id || service._id)}
                className="text-xs font-semibold text-red-600 hover:underline px-1"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
