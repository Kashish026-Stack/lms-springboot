import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Dashboard from './pages/Dashboard'
import Learning from './pages/Learning'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageCourses from './pages/admin/ManageCourses'
import EditCourse from './pages/admin/EditCourse'
import EditLesson from './pages/admin/EditLesson'
import CourseContentEditor from './pages/admin/CourseContentEditor'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading-screen">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="learning/:courseId"
          element={
            <ProtectedRoute>
              <Learning />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/courses"
          element={
            <ProtectedRoute adminOnly>
              <ManageCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/courses/:id"
          element={
            <ProtectedRoute adminOnly>
              <EditCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/courses/new"
          element={
            <ProtectedRoute adminOnly>
              <EditCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/lessons/:lessonId"
          element={
            <ProtectedRoute adminOnly>
              <EditLesson />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/courses/:id/content"
          element={
            <ProtectedRoute adminOnly>
              <CourseContentEditor />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
