import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { Layout } from './components/layout/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Clients } from './pages/Clients'
import { ClientDetail } from './pages/ClientDetail'
import { ClientNew } from './pages/ClientNew'
import { ClientEdit } from './pages/ClientEdit'
import { Morosos } from './pages/Morosos'
import { Ingresos } from './pages/Ingresos'
import { Settings } from './pages/Settings'

function ProtectedApp() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-dvh bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes" element={<Clients />} />
        <Route path="/clientes/nuevo" element={<ClientNew />} />
        <Route path="/clientes/:id" element={<ClientDetail />} />
        <Route path="/clientes/:id/editar" element={<ClientEdit />} />
        <Route path="/morosos" element={<Morosos />} />
        <Route path="/ingresos" element={<Ingresos />} />
        <Route path="/configuracion" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ProtectedApp />
    </BrowserRouter>
  )
}
