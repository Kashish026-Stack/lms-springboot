import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DOMPurify from 'dompurify'
import api from '../../api/axios'
import RichTextEditor from '../../components/RichTextEditor'

// Loading Spinner Component
const Spinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-3'
  }
  return (
    <div className={`${sizes[size]} border-gray-200 border-t-primary-500 rounded-full animate-spin`} />
  )
}

// Skeleton Loader Component
const Skeleton = ({ className }) => (
  <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`} />
)

export default function CourseContentEditor() {
  const { id: courseId } = useParams()
  const navigate = useNavigate()
  
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [expandedModules, setExpandedModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Modal and edit states
  const [showAddModuleModal, setShowAddModuleModal] = useState(false)
  const [showAddLessonModal, setShowAddLessonModal] = useState(false)
  const [selectedModuleId, setSelectedModuleId] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [editingModuleId, setEditingModuleId] = useState(null)
  const [editingModuleTitle, setEditingModuleTitle] = useState('')
  
  // Preview mode
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    fetchData()
  }, [courseId])

  const fetchData = async () => {
    try {
      const [courseRes, modulesRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/modules/course/${courseId}`)
      ])
      setCourse(courseRes.data)
      setModules(modulesRes.data)
      setExpandedModules(modulesRes.data.map(m => m.id))
      
      if (modulesRes.data.length > 0 && modulesRes.data[0].subModules?.length > 0) {
        const firstLesson = modulesRes.data[0].subModules[0]
        const lessonRes = await api.get(`/submodules/${firstLesson.id}`)
        setSelectedLesson(lessonRes.data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectLesson = async (lessonId) => {
    try {
      const response = await api.get(`/submodules/${lessonId}`)
      setSelectedLesson(response.data)
    } catch (error) {
      console.error('Failed to fetch lesson:', error)
    }
  }

  const toggleModule = (moduleId) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  // Module CRUD
  const addModule = async () => {
    if (!newTitle.trim()) return
    try {
      const response = await api.post(`/modules/course/${courseId}`, {
        title: newTitle.trim(),
        orderIndex: modules.length
      })
      setModules([...modules, { ...response.data, subModules: [] }])
      setExpandedModules([...expandedModules, response.data.id])
      setNewTitle('')
      setShowAddModuleModal(false)
    } catch (error) {
      console.error('Failed to add module:', error)
    }
  }

  const updateModuleTitle = async (moduleId) => {
    if (!editingModuleTitle.trim()) {
      setEditingModuleId(null)
      return
    }
    try {
      const module = modules.find(m => m.id === moduleId)
      await api.put(`/modules/${moduleId}`, {
        title: editingModuleTitle.trim(),
        orderIndex: module.orderIndex
      })
      setModules(modules.map(m => 
        m.id === moduleId ? { ...m, title: editingModuleTitle.trim() } : m
      ))
    } catch (error) {
      console.error('Failed to update module:', error)
    } finally {
      setEditingModuleId(null)
    }
  }

  const deleteModule = async (moduleId) => {
    if (!confirm('Delete this module and all its lessons?')) return
    try {
      await api.delete(`/modules/${moduleId}`)
      setModules(modules.filter(m => m.id !== moduleId))
      if (selectedLesson?.moduleId === moduleId) {
        setSelectedLesson(null)
      }
    } catch (error) {
      console.error('Failed to delete module:', error)
    }
  }

  // Lesson CRUD
  const openAddLessonModal = (moduleId) => {
    setSelectedModuleId(moduleId)
    setNewTitle('')
    setShowAddLessonModal(true)
  }

  const addLesson = async () => {
    if (!newTitle.trim() || !selectedModuleId) return
    try {
      const module = modules.find(m => m.id === selectedModuleId)
      const response = await api.post(`/submodules/module/${selectedModuleId}`, {
        title: newTitle.trim(),
        orderIndex: module.subModules?.length || 0
      })
      setModules(modules.map(m => 
        m.id === selectedModuleId 
          ? { ...m, subModules: [...(m.subModules || []), response.data], subModuleCount: (m.subModuleCount || 0) + 1 }
          : m
      ))
      setNewTitle('')
      setShowAddLessonModal(false)
      
      const lessonRes = await api.get(`/submodules/${response.data.id}`)
      setSelectedLesson(lessonRes.data)
    } catch (error) {
      console.error('Failed to add lesson:', error)
    }
  }

  const deleteLesson = async (lessonId, moduleId) => {
    if (!confirm('Delete this lesson?')) return
    try {
      await api.delete(`/submodules/${lessonId}`)
      setModules(modules.map(m => 
        m.id === moduleId 
          ? { ...m, subModules: m.subModules.filter(l => l.id !== lessonId), subModuleCount: (m.subModuleCount || 1) - 1 }
          : m
      ))
      if (selectedLesson?.id === lessonId) {
        setSelectedLesson(null)
      }
    } catch (error) {
      console.error('Failed to delete lesson:', error)
    }
  }

  // Lesson content
  const updateLessonField = (field, value) => {
    setSelectedLesson(prev => ({ ...prev, [field]: value }))
  }

  const saveLesson = async () => {
    if (!selectedLesson) return
    setSaving(true)
    try {
      await api.put(`/submodules/${selectedLesson.id}`, {
        title: selectedLesson.title,
        introContent: selectedLesson.introContent,
        bodyContent: selectedLesson.bodyContent,
        summaryContent: selectedLesson.summaryContent,
        videoUrl: selectedLesson.videoUrl,
        orderIndex: selectedLesson.orderIndex
      })
      setModules(modules.map(m => ({
        ...m,
        subModules: m.subModules?.map(l => 
          l.id === selectedLesson.id ? { ...l, title: selectedLesson.title } : l
        )
      })))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to save lesson:', error)
    } finally {
      setSaving(false)
    }
  }

  // Render HTML content safely
  const renderHTML = (html) => {
    if (!html) return null
    return (
      <div 
        className="prose-content"
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
      <div className="flex h-[calc(100vh-64px)]">
        <aside className="w-80 border-r border-gray-200 p-6 bg-gray-50">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-full" />
        </aside>
        <main className="flex-1 p-8">
          <Skeleton className="h-12 w-96 mb-8" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-white">
          <Link 
            to={`/admin/courses/${courseId}`} 
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Course
          </Link>
          <h2 className="font-semibold text-gray-800 text-lg leading-tight line-clamp-2">
            {course?.title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {modules.length} modules · {modules.reduce((acc, m) => acc + (m.subModuleCount || 0), 0)} lessons
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          {modules.map((module, moduleIndex) => (
            <div key={module.id} className="mb-3">
              <div className="flex items-center gap-2">
                <button
                  className={`flex-1 flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all text-left ${expandedModules.includes(module.id) ? 'border-primary-200 bg-primary-50' : ''}`}
                  onClick={() => toggleModule(module.id)}
                >
                  <span className="w-6 h-6 flex items-center justify-center bg-primary-500 text-white text-xs font-semibold rounded">
                    {moduleIndex + 1}
                  </span>
                  {editingModuleId === module.id ? (
                    <input
                      type="text"
                      className="flex-1 px-2 py-1 text-sm border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-100"
                      value={editingModuleTitle}
                      onChange={(e) => setEditingModuleTitle(e.target.value)}
                      onBlur={() => updateModuleTitle(module.id)}
                      onKeyDown={(e) => e.key === 'Enter' && updateModuleTitle(module.id)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span 
                      className="flex-1 text-sm font-medium text-gray-700 truncate"
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        setEditingModuleId(module.id)
                        setEditingModuleTitle(module.title)
                      }}
                    >
                      {module.title}
                    </span>
                  )}
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform ${expandedModules.includes(module.id) ? 'rotate-180' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                  onClick={() => openAddLessonModal(module.id)}
                  title="Add lesson"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  onClick={() => deleteModule(module.id)}
                  title="Delete module"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <AnimatePresence>
                {expandedModules.includes(module.id) && module.subModules && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden ml-9 mt-2"
                  >
                    {module.subModules.map((lesson) => (
                      <div 
                        key={lesson.id}
                        className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${selectedLesson?.id === lesson.id ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100 text-gray-600'}`}
                      >
                        <button 
                          className="flex-1 flex items-center gap-2 text-left"
                          onClick={() => selectLesson(lesson.id)}
                        >
                          <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm truncate">{lesson.title}</span>
                        </button>
                        <button 
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-all"
                          onClick={(e) => { e.stopPropagation(); deleteLesson(lesson.id, module.id) }}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {module.subModules.length === 0 && (
                      <p className="text-xs text-gray-400 italic py-2">No lessons yet</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          
          <button 
            className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
            onClick={() => setShowAddModuleModal(true)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Module
          </button>
        </nav>
      </aside>

      {/* Main Editor */}
      <main className="flex-1 overflow-y-auto bg-white">
        {selectedLesson ? (
          <motion.div
            key={selectedLesson.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-4xl mx-auto p-8"
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <input
                type="text"
                className="flex-1 px-4 py-3 text-2xl font-semibold text-gray-800 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                value={selectedLesson.title}
                onChange={(e) => updateLessonField('title', e.target.value)}
                placeholder="Lesson title"
              />
              <button
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview
                  </>
                )}
              </button>
              <button 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  saveSuccess 
                    ? 'bg-green-500 text-white' 
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                } disabled:opacity-50`}
                onClick={saveLesson}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Spinner size="sm" />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>

            {/* Video URL */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
              <input
                type="url"
                className="input"
                value={selectedLesson.videoUrl || ''}
                onChange={(e) => updateLessonField('videoUrl', e.target.value)}
                placeholder="https://youtube.com/embed/... or any video URL"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Tip: Use embed URLs for YouTube (youtube.com/embed/ID) or Vimeo (player.vimeo.com/video/ID)
              </p>
            </div>

              {/* Introduction */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl">📖</span>
                  <h3 className="font-semibold text-gray-800">Introduction</h3>
                </div>
                {previewMode ? (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 min-h-[150px] prose prose-sm max-w-none">
                    {renderHTML(selectedLesson.introContent) || <em className="text-gray-400">No content</em>}
                  </div>
                ) : (
                  <RichTextEditor
                    content={selectedLesson.introContent || ''}
                    onChange={(content) => updateLessonField('introContent', content)}
                  />
                )}
              </div>

              {/* Main Content */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl">📝</span>
                  <h3 className="font-semibold text-gray-800">Main Content</h3>
                </div>
                {previewMode ? (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 min-h-[300px] prose prose-sm max-w-none">
                    {renderHTML(selectedLesson.bodyContent) || <em className="text-gray-400">No content</em>}
                  </div>
                ) : (
                  <RichTextEditor
                    content={selectedLesson.bodyContent || ''}
                    onChange={(content) => updateLessonField('bodyContent', content)}
                  />
                )}
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl">✅</span>
                  <h3 className="font-semibold text-gray-800">Summary</h3>
                </div>
                {previewMode ? (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 min-h-[150px] prose prose-sm max-w-none">
                    {renderHTML(selectedLesson.summaryContent) || <em className="text-gray-400">No content</em>}
                  </div>
                ) : (
                  <RichTextEditor
                    content={selectedLesson.summaryContent || ''}
                    onChange={(content) => updateLessonField('summaryContent', content)}
                  />
                )}
              </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-6xl mb-6 opacity-50">📚</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Lesson</h3>
            <p className="text-sm">Choose a lesson from the sidebar to start editing</p>
          </div>
        )}
      </main>

      {/* Add Module Modal */}
      <AnimatePresence>
        {showAddModuleModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModuleModal(false)}
          >
            <motion.div 
              className="modal-content p-6"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Module</h3>
              <input
                type="text"
                className="input mb-4"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Module title"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && addModule()}
              />
              <div className="flex gap-3 justify-end">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowAddModuleModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={addModule}
                >
                  Add Module
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Lesson Modal */}
      <AnimatePresence>
        {showAddLessonModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddLessonModal(false)}
          >
            <motion.div 
              className="modal-content p-6"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Lesson</h3>
              <input
                type="text"
                className="input mb-4"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Lesson title"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && addLesson()}
              />
              <div className="flex gap-3 justify-end">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowAddLessonModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={addLesson}
                >
                  Add Lesson
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
