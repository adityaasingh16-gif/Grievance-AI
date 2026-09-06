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
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">RAG Official SOP Assistant</h1>
          <p className="text-sm text-slate-500">Retrieval-Augmented Generation chatbot grounded in official department Standard Operating Procedures.</p>
        </div>
      </div>

      <div className="card shadow-lg p-0 border-slate-200/80 rounded-3xl overflow-hidden flex flex-col h-[580px] bg-white">
        {/* Chat History Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[82%] rounded-2xl p-4 text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md shadow-blue-500/20'
                  : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-none shadow-sm font-medium'
              }`}>
                <p className="whitespace-pre-wrap">{m.text}</p>

                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-2">
                    <p className="font-extrabold text-indigo-700 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Grounded SOP Source Reference:
                    </p>
                    {m.sources.map((src, i) => (
                      <div key={i} className="bg-indigo-50/90 p-3 rounded-xl border border-indigo-200/80 text-indigo-950">
                        <p className="font-bold">{src.title} ({src.department})</p>
                        <p className="text-xs text-indigo-800 mt-1 font-medium leading-relaxed">{src.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 text-slate-500 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                Searching SOP vector index &amp; generating grounded response...
              </div>
            </div>
          )}
        </div>

        {/* Input Controls Bar */}
        <form onSubmit={handleAsk} className="p-4 bg-white border-t border-slate-200/80 flex gap-3 items-center">
          <select
            value={department}
            onChange={e => setDepartment(e.target.value)}
            className="input-field py-2 text-xs w-auto min-h-[44px] shrink-0"
          >
            <option value="">All SOP Manuals</option>
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
            className="input-field flex-1 min-h-[44px]"
          />

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="btn-primary py-2.5 px-6 font-bold text-sm min-h-[44px]"
          >
            <Send className="w-4 h-4" /> Ask RAG
          </button>
        </form>
      </div>
    </div>
  )
}
