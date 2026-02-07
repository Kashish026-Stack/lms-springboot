import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

// Skeleton Loader
const Skeleton = ({ className }) => (
  <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`} />
)

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [expandedModule, setExpandedModule] = useState(null)

  useEffect(() => {
    fetchCourse()
    if (user) {
      checkEnrollment()
    }
  }, [id, user])

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/courses/${id}`)
      setCourse(response.data)
    } catch (error) {
      console.error('Failed to fetch course:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkEnrollment = async () => {
    try {
      const response = await api.get(`/enrollments/check/${id}`)
      setEnrolled(response.data.enrolled)
    } catch (error) {
      console.error('Failed to check enrollment:', error)
    }
  }

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setEnrolling(true)
    try {
      await api.post(`/enrollments/course/${id}`)
      setEnrolled(true)
      navigate(`/learning/${id}`) 
    } catch (error) {
      console.error('Failed to enroll:', error)
    } finally {
      setEnrolling(false)
    }
  }

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-50 text-green-700'
      case 'INTERMEDIATE': return 'bg-yellow-50 text-yellow-700'
      case 'ADVANCED': return 'bg-primary-50 text-primary-700'
      default: return 'bg-gray-50 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-10 w-2/3 mb-4" />
        <Skeleton className="h-6 w-1/3 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Course not found</h3>
          <Link to="/courses" className="btn btn-primary">Back to Courses</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  {course.category && (
                    <span className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
                      {course.category}
                    </span>
                  )}
                  {course.difficulty && (
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getDifficultyStyle(course.difficulty)}`}>
                      {course.difficulty}
                    </span>
                  )}
                </div>
                
                <h1 className="text-4xl font-bold text-gray-900 mb-6">{course.title}</h1>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">{course.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    {course.moduleCount} modules
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {course.totalSubModules} lessons
                  </span>
                  {course.createdByName && (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      by {course.createdByName}
                    </span>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                  <div className="aspect-video bg-gray-100 rounded-xl mb-6 overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                          <path d="M12 14v7"/>
                          <path d="M5 9v7c0 1.5 3.1 3 7 3s7-1.5 7-3V9"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {enrolled ? (
                    <Link 
                      to={`/learning/${id}`} 
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm hover:shadow"
                    >
                      Continue Learning
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={enrolling}
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Now - Free'}
                    </button>
                  )}
                  
                  <p className="mt-4 text-xs text-center text-gray-500">
                    Full lifetime access • Certificate of completion
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Course Content</h2>
          <div className="border border-gray-200 rounded-xl divide-y divide-gray-200 bg-white shadow-sm overflow-hidden">
            {course.modules && course.modules.length > 0 ? (
              course.modules.map((module, index) => (
                <div key={module.id} className="group">
                  <button
                    className={`w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-gray-50 ${expandedModule === module.id ? 'bg-gray-50' : ''}`}
                    onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-500 font-medium text-sm">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-gray-800">{module.title}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{module.subModuleCount || 0} lessons</span>
                      <svg
                        className={`w-5 h-5 transition-transform duration-200 ${expandedModule === module.id ? 'rotate-180 text-gray-800' : 'text-gray-400'}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedModule === module.id && module.subModules && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-gray-50 border-t border-gray-200"
                      >
                        <div className="py-2">
                          {module.subModules.map((sub, subIndex) => (
                            <div key={sub.id} className="px-5 py-3 pl-16 flex items-center gap-3 text-sm text-gray-600">
                              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polygon points="10,8 16,12 10,16 10,8"/>
                              </svg>
                              <span>{sub.title}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                Course content coming soon
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
