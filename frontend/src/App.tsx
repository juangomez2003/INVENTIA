import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminProtectedRoute from './components/admin/AdminProtectedRoute'
import Layout from './components/Layout'
import AdminLayout from './components/admin/AdminLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import AIInsights from './pages/AIInsights'
import Settings from './pages/Settings'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCompanies from './pages/admin/AdminCompanies'
import AdminProducts from './pages/admin/AdminProducts'
import AdminModules from './pages/admin/AdminModules'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import StaffJoin from './pages/staff/StaffJoin'
import StaffLogin from './pages/staff/StaffLogin'
import StaffHub from './pages/staff/StaffHub'

function AppRoutes() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Iniciando INVENTIA...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Staff routes (acceso por código) */}
        <Route path="/staff/join" element={<StaffJoin />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/staff" element={<StaffHub />} />

        {/* Admin routes */}
        <Route
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/companies" element={<AdminCompanies />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/modules" element={<AdminModules />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* App routes (Firebase auth) */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  )
}
