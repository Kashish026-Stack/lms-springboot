import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DOMPurify from 'dompurify'
import { Menu, X, ChevronDown, CheckCircle, Circle, Play, ArrowLeft, BookOpen } from 'lucide-react'
import api from '../api/axios'

// Loading Spinner Component
const Spinner = ({ className = '' }) => (
  <div className={`w-5 h-5 border-2 border-gray-200 border-t-primary-500 rounded-full animate-spin ${className}`} />
)

// Skeleton Loader
const Skeleton = ({ className }) => (
  <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`} />
)

export default function Learning() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [currentSubModule, setCurrentSubModule] = useState(null)
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState([])
  const [marking, setMarking] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [courseId])

  const fetchData = async () => {
    try {
      const [courseRes, modulesRes, progressRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/modules/course/${courseId}`),
        api.get(`/progress/course/${courseId}`)
      ])
      
      setCourse(courseRes.data)
      setModules(modulesRes.data || [])
      setProgress(progressRes.data || [])
      
      if (modulesRes.data.length > 0) {
        setExpandedModules([modulesRes.data[0].id])
        const firstModule = modulesRes.data[0]
        if (firstModule.subModules && firstModule.subModules.length > 0) {
          const subModuleRes = await api.get(`/submodules/${firstModule.subModules[0].id}`)
          setCurrentSubModule(subModuleRes.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch course data:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectSubModule = async (subModuleId) => {
    try {
      const response = await api.get(`/submodules/${subModuleId}`)
      setCurrentSubModule(response.data)
      setMobileMenuOpen(false) // Close mobile menu on selection
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Failed to fetch submodule:', error)
    }
  }

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const markComplete = async () => {
    if (!currentSubModule) return
    setMarking(true)
    try {
      await api.post(`/progress/complete/${currentSubModule.id}`)
      setProgress(prev => [...prev, { subModuleId: currentSubModule.id, completed: true }])
    } catch (error) {
      console.error('Failed to mark complete:', error)
    } finally {
      setMarking(false)
    }
  }

  const isCompleted = (subModuleId) => {
    return progress.some(p => p.subModuleId === subModuleId && p.completed)
  }

  const calculateProgress = () => {
    const total = modules?.reduce((acc, m) => acc + (m.subModules?.length || 0), 0) || 0
    const completed = progress?.filter(p => p.completed).length || 0
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  // Render HTML content safely
  const renderHTML = (html) => {
    if (!html) return null
    return (
      <div 
        className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary-600 prose-img:rounded-xl prose-img:shadow-md"
        dangerouslySetInnerHTML={{ 
          __html: DOMPurify.sanitize(html, {
            ADD_TAGS: ['iframe'],
            ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
          }) 
        }}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] bg-gray-50">
        <aside className="hidden lg:block w-80 border-r border-gray-200 bg-white p-6">
          <Skeleton className="h-6 w-16 mb-6" />
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-2 w-full mb-8" />
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full mb-4" />
          ))}
        </aside>
        <main className="flex-1 p-8">
          <Skeleton className="h-10 w-3/4 mb-8" />
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 w-full z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
             <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-semibold text-gray-800 truncate max-w-[200px]">{course?.title}</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 z-20 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-100">
          <Link 
            to="/dashboard" 
            className="hidden lg:inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <h2 className="font-bold text-gray-900 text-xl leading-tight mb-4">
            {course?.title}
          </h2>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-500">
              <span>Course Progress</span>
              <span>{Math.round(calculateProgress())}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${calculateProgress()}%` }}
                transition={{ duration: 0.8, ease: "circOut" }}
              />
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
          {modules?.map((module, moduleIndex) => (
            <div key={module.id} className="rounded-xl overflow-hidden border border-transparent has-[button[aria-expanded='true']]:border-gray-100 has-[button[aria-expanded='true']]:bg-gray-50/50 transition-colors">
              <button
                className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-all ${
                  expandedModules.includes(module.id) ? 'text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => toggleModule(module.id)}
                aria-expanded={expandedModules.includes(module.id)}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                  expandedModules.includes(module.id) ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                }`}>
                  {moduleIndex + 1}
                </div>
                <span className="flex-1 font-semibold text-sm">{module.title}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expandedModules.includes(module.id) ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {expandedModules.includes(module.id) && module.subModules && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-2 pt-1 px-3 space-y-0.5">
                      {module.subModules.map((sub) => {
                        const active = currentSubModule?.id === sub.id
                        const completed = isCompleted(sub.id)
                        
                        return (
                          <button
                            key={sub.id}
                            onClick={() => selectSubModule(sub.id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all group relative ${
                              active 
                                ? 'bg-white text-primary-700 shadow-sm ring-1 ring-gray-200 font-medium' 
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            {/* Active Indicator Line */}
                            {active && (
                              <motion.div 
                                layoutId="activeInd"
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary-500 rounded-r-full"
                              />
                            )}

                            {completed ? (
                              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                            ) : (
                              active ? (
                                <Play className="w-4 h-4 text-primary-500 shrink-0 fill-current" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-300 shrink-0 group-hover:text-gray-400" />
                              )
                            )}
                            <span className="truncate">{sub.title}</span>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-white lg:pt-0 pt-16">
        {currentSubModule ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            
            {/* Sticky Video Header for Mobile/Desktop */}
            <div className="mb-8">
              {currentSubModule.videoUrl && (
                <div className="aspect-video bg-black rounded-2xl shadow-xl overflow-hidden ring-1 ring-black/5">
                  <iframe
                    className="w-full h-full"
                    src={currentSubModule.videoUrl}
                    title={currentSubModule.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                {currentSubModule.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  Lesson {modules.findIndex(m => m.subModules.some(s => s.id === currentSubModule.id)) + 1}.
                  {modules.find(m => m.subModules.some(s => s.id === currentSubModule.id))?.subModules.findIndex(s => s.id === currentSubModule.id) + 1}
                </span>
                <span>•</span>
                <span>{currentSubModule.readTime || '10 min'} read</span>
              </div>
            </div>

            {/* Content Tabs/Sections */}
            <div className="space-y-12">
              {currentSubModule.introContent && (
                <section>
                  <div className="prose prose-lg max-w-none">
                    {renderHTML(currentSubModule.introContent)}
                  </div>
                </section>
              )}

              {currentSubModule.bodyContent && (
                <section>
                   <div className="prose prose-lg max-w-none">
                    {renderHTML(currentSubModule.bodyContent)}
                  </div>
                </section>
              )}

              {currentSubModule.summaryContent && (
                <section className="bg-primary-50 rounded-2xl p-8 border border-primary-100">
                  <h3 className="text-xl font-bold text-primary-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-primary-600" />
                    Key Takeaways
                  </h3>
                  <div className="prose prose-lg max-w-none prose-p:text-primary-800 prose-li:text-primary-800">
                    {renderHTML(currentSubModule.summaryContent)}
                  </div>
                </section>
              )}

              {/* Quiz Section Improvements */}
              {currentSubModule.mcqQuestions && currentSubModule.mcqQuestions.length > 0 && (
                <section className="mt-12 border-t border-gray-100 pt-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Knowledge Check</h2>
                  <div className="space-y-8">
                    {currentSubModule.mcqQuestions.map((q, i) => (
                      <div key={q.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">
                           {i + 1}. {q.question}
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {['A', 'B', 'C', 'D'].map(opt => 
                            q[`option${opt}`] && (
                              <label key={opt} className="group relative flex items-start gap-3 p-4 rounded-xl border-2 border-gray-100 cursor-pointer hover:border-primary-500 hover:bg-primary-50/30 transition-all">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 bg-white group-hover:border-primary-500 group-hover:text-primary-500 transition-colors shrink-0 mt-0.5 text-xs font-bold text-gray-500">
                                  {opt}
                                </span>
                                <input 
                                  type="radio" 
                                  name={`q-${q.id}`}
                                  className="sr-only"
                                />
                                <span className="text-gray-700 font-medium group-hover:text-gray-900">
                                  {q[`option${opt}`]}
                                </span>
                              </label>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Completion Footer */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-80 p-4 bg-white border-t border-gray-200 z-10 flex justify-end items-center gap-4">
              {!isCompleted(currentSubModule.id) ? (
                <button 
                  onClick={markComplete} 
                  disabled={marking}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 focus:ring-4 focus:ring-primary-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20 active:scale-95 transform"
                >
                  {marking ? (
                    <>
                      <Spinner className="w-5 h-5 border-white border-t-transparent" />
                      Marking...
                    </>
                  ) : (
                    <>
                      Mark as Complete
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              ) : (
                <div className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-green-50 text-green-700 font-semibold rounded-xl border border-green-100">
                  <CheckCircle className="w-5 h-5 fill-current" />
                  Completed
                </div>
              )}
            </div>
            {/* Spacer for fixed footer */}
            <div className="h-24" />
            
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Start Learning?</h3>
            <p className="text-gray-500 max-w-md">
              Select a lesson from the sidebar to begin your journey. Track your progress and master new skills!
            </p>
          </div>
        )}
      </main>

      {/* Overlay for mobile sidebar */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-10 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
