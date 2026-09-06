import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Flame, PlusCircle, PhoneCall, BarChart3, MessageSquare, LogOut, User, Shield, FileText, Settings, LogIn } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  // Guest Top Navbar for unauthenticated users viewing Directory or Community Feed
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Top Header */}
        <header className="bg-primary-950 text-white shadow-md border-b border-primary-800">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/directory" className="flex items-center gap-2 font-bold text-lg">
              <Shield className="w-6 h-6 text-amber-400" />
              <span>GrievanceAI</span>
              <span className="text-xs bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-md uppercase ml-2">Public Portal</span>
            </Link>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <Link
                to="/directory"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  location.pathname === '/directory' ? 'bg-primary-800 text-white' : 'text-primary-200 hover:text-white'
                }`}
              >
                <PhoneCall className="w-4 h-4 text-red-400" /> Emergency Directory
              </Link>
              <Link
                to="/community"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  location.pathname === '/community' ? 'bg-primary-800 text-white' : 'text-primary-200 hover:text-white'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-400" /> Community Feed
              </Link>
              <Link
                to="/login"
                className="bg-amber-500 hover:bg-amber-600 text-gray-950 px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" /> Citizen Sign In
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    )
  }

  const navItems = {
    citizen: [
      { path: '/community', label: 'Community Feed', icon: Flame },
      { path: '/report-issue', label: 'Report Local Issue', icon: PlusCircle },
      { path: '/directory', label: 'Gov Directory', icon: PhoneCall },
      { path: '/submit', label: 'File AI Grievance', icon: PlusCircle },
      { path: '/track', label: 'My Grievances', icon: BarChart3 }
    ],
    officer: [
      { path: '/community', label: 'Community Feed', icon: Flame },
      { path: '/officer', label: 'My Assignments', icon: FileText },
      { path: '/directory', label: 'Gov Directory', icon: PhoneCall },
      { path: '/assistant', label: 'RAG Assistant', icon: MessageSquare }
    ],
    admin: [
      { path: '/analytics', label: 'Analytics Dashboard', icon: BarChart3 },
      { path: '/community', label: 'Community Feed', icon: Flame },
      { path: '/officer', label: 'All Grievances', icon: FileText },
      { path: '/directory', label: 'Gov Directory', icon: PhoneCall },
      { path: '/admin/directory', label: 'Manage Directory', icon: Settings },
      { path: '/assistant', label: 'RAG Assistant', icon: MessageSquare }
    ]
  }

  const items = navItems[user.role] || []

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-primary-950 text-white flex flex-col shrink-0 shadow-lg border-r border-primary-900">
        <div className="p-6 border-b border-primary-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" />
            GrievanceAI
          </h1>
          <p className="text-xs text-primary-300 mt-1 font-medium">DARPG PS-09 Platform</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {items.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-800 text-white shadow-sm font-bold border-l-4 border-amber-400' : 'text-primary-200 hover:bg-primary-900 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive && item.icon === Flame ? 'text-amber-400 fill-amber-400' : ''}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-primary-900 bg-primary-950">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary-800 flex items-center justify-center font-bold text-amber-400 border border-primary-700">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <p className="text-xs text-primary-300 capitalize">{user.role} {user.department ? `(${user.department})` : ''}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors w-full font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
