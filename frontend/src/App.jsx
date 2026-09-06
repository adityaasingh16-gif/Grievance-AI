import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import CitizenSubmit from './pages/CitizenSubmit'
import CitizenTrack from './pages/CitizenTrack'
import OfficerDashboard from './pages/OfficerDashboard'
import GrievanceDetail from './pages/GrievanceDetail'
import AdminAnalytics from './pages/AdminAnalytics'
import RAGAssistant from './pages/RAGAssistant'
import CommunityFeed from './pages/CommunityFeed'
import GovDirectory from './pages/GovDirectory'
import AdminGovServices from './pages/AdminGovServices'
import ReportIssue from './pages/ReportIssue'
import IssueDetail from './pages/IssueDetail'
import ProtectedRoute from './components/ProtectedRoute'

function RoleBasedDashboard() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/directory" replace />
  if (user.role === 'citizen') return <CommunityFeed />
  if (user.role === 'officer') return <OfficerDashboard />
  return <AdminAnalytics />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/community" replace />} />
          <Route path="/dashboard" element={<RoleBasedDashboard />} />
          
          {/* Public No-Login Required Routes */}
          <Route path="/directory" element={<GovDirectory />} />
          <Route path="/community" element={<CommunityFeed />} />
          <Route path="/issue/:id" element={<IssueDetail />} />

          {/* Protected Routes */}
          <Route 
            path="/report-issue" 
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <ReportIssue />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/submit" 
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenSubmit />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/track/:id?" 
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenTrack />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/officer" 
            element={
              <ProtectedRoute allowedRoles={['officer', 'admin']}>
                <OfficerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/grievance/:id" 
            element={
              <ProtectedRoute>
                <GrievanceDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/directory" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminGovServices />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assistant" 
            element={
              <ProtectedRoute allowedRoles={['officer', 'admin']}>
                <RAGAssistant />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
