import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import About from './pages/About'
import ProjectDetail from './pages/ProjectDetail'
import Contact from './pages/Contact'
import FrameDemo from './pages/FrameDemo'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import ProjectEditor from './pages/admin/ProjectEditor'
import Inquiries from './pages/admin/Inquiries'
import Settings from './pages/admin/Settings'

function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/projects/:id" element={<PublicLayout><ProjectDetail /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/frame-demo" element={<PublicLayout><FrameDemo /></PublicLayout>} />

      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/projects/new" element={<ProtectedRoute><ProjectEditor /></ProtectedRoute>} />
      <Route path="/admin/projects/:id" element={<ProtectedRoute><ProjectEditor /></ProtectedRoute>} />
      <Route path="/admin/inquiries" element={<ProtectedRoute><Inquiries /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      <Route
        path="*"
        element={
          <PublicLayout>
            <div className="px-6 py-24 text-center">
              <p className="label-eyebrow mb-2">404</p>
              <h1 className="font-display text-2xl text-ink">Page not found</h1>
            </div>
          </PublicLayout>
        }
      />
    </Routes>
  )
}