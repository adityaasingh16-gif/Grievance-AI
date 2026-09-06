import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Flame, PlusCircle, PhoneCall, BarChart3, MessageSquare, LogOut, User, Shield, FileText, Sparkles, Activity } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  if (!user) return <Outlet />

  const navItems = {
    citizen: [
      { path: '/community', label: 'Community Feed', icon: Flame, badge: 'Popular' },
      { path: '/submit', label: 'Report an Issue', icon: PlusCircle },
      { path: '/directory', label: 'Emergency Directory', icon: PhoneCall },
      { path: '/track', label: 'Track Status', icon: BarChart3 }
    ],
    officer: [
      { path: '/community', label: 'Community Feed', icon: Flame },
      { path: '/officer', label: 'My Assignments', icon: FileText, badge: 'Active' },
      { path: '/directory', label: 'Emergency Directory', icon: PhoneCall },
      { path: '/assistant', label: 'RAG Assistant', icon: MessageSquare }
    ],
    admin: [
      { path: '/analytics', label: 'Analytics Dashboard', icon: Activity, badge: 'Live' },
      { path: '/community', label: 'Community Feed', icon: Flame },
      { path: '/officer', label: 'All Grievances', icon: FileText },
      { path: '/directory', label: 'Emergency Directory', icon: PhoneCall },
      { path: '/assistant', label: 'RAG Assistant', icon: MessageSquare }
    ]
  }

  const items = navItems[user.role] || []

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Sleek Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800 shadow-xl z-20">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                GrievanceAI
                <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded-full font-bold uppercase">v2.0</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">DARPG PS-09 Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Main Navigation</div>
          {items.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] min-h-[44px] ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 font-bold' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive && item.icon === Flame ? 'text-amber-300 fill-amber-300' : ''}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Account Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-bold text-xs text-white truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 capitalize truncate font-medium">
                {user.role} {user.department ? `(${user.department})` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors w-full py-2.5 rounded-xl min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-600">AI Intelligence Core Connected</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="badge bg-blue-50 text-blue-700 border border-blue-200/80 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3 text-blue-500" /> Multilingual E5 Engine Active
            </span>
            <div className="h-4 w-px bg-slate-200"></div>
            <span className="text-xs text-slate-500 font-medium capitalize">
              Role: <strong className="text-slate-800 font-bold">{user.role}</strong>
            </span>
          </div>
        </header>

        {/* Dynamic Page Content View */}
        <main className="flex-1 p-8 overflow-y-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
