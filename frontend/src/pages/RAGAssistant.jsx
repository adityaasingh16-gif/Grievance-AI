import { useState } from 'react'
import axios from 'axios'
import { MessageSquare, Send, Sparkles, BookOpen, Loader2, Bot } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function RAGAssistant() {
  const [question, setQuestion] = useState('')
  const [department, setDepartment] = useState('')
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your RAG-powered SOP & Grievance Resolution Assistant. Ask me any question regarding official guidelines, repair SLA protocols, or standard operating procedures.',
      sources: []
    }
  ])
  const [loading, setLoading] = useState(false)

  const handleAsk = async (e) => {
    e.preventDefault()
    if (!question.trim()) return

    const userQ = question
    setQuestion('')
    setMessages(prev => [...prev, { sender: 'user', text: userQ }])
    setLoading(true)

    try {
      const res = await axios.post(`${API_URL}/api/rag/query`, {
        question: userQ,
        department: department || null
      })

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: res.data.answer,
          sources: res.data.sources || [],
          confidence: res.data.confidence
        }
      ])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Error querying RAG assistant. Please make sure the Python ML service is active.',
          sources: []
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-100 rounded-xl text-indigo-700">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">RAG Official SOP Assistant</h1>
          <p className="text-sm text-gray-500">Instant answers grounded in official department Standard Operating Procedures</p>
        </div>
      </div>

      <div className="card shadow-md flex flex-col h-[550px] p-0 overflow-hidden">
        {/* Chat Messages Log */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-primary-600 text-white rounded-br-none shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
              }`}>
                <p className="whitespace-pre-wrap">{m.text}</p>

                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs">
                    <p className="font-semibold text-indigo-700 mb-1 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> Reference Grounded SOP Source:
                    </p>
                    {m.sources.map((src, i) => (
                      <div key={i} className="bg-indigo-50/80 p-2 rounded border border-indigo-100 text-indigo-900 mt-1">
                        <p className="font-bold">{src.title} ({src.department})</p>
                        <p className="text-[11px] text-indigo-800 mt-0.5">{src.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-4 rounded-2xl text-sm flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                Searching SOP vector index &amp; generating grounded answer...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleAsk} className="p-4 bg-white border-t border-gray-200 flex gap-3 items-center">
          <select
            value={department}
            onChange={e => setDepartment(e.target.value)}
            className="border rounded-lg px-3 py-2 text-xs bg-gray-50 text-gray-700 border-gray-300 focus:outline-none"
          >
            <option value="">All SOPs</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Electricity">Electricity</option>
            <option value="Roads & Infrastructure">Roads &amp; Infra</option>
            <option value="Sanitation">Sanitation</option>
          </select>

          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask a question (e.g., 'What is the SOP for water pipeline burst repair?')..."
            className="flex-1 border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="btn-primary py-2.5 px-5 flex items-center gap-2 disabled:opacity-50 font-semibold text-sm"
          >
            <Send className="w-4 h-4" /> Ask RAG
          </button>
        </form>
      </div>
    </div>
  )
}
