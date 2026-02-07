import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'

// Skeleton Loader
const Skeleton = ({ className }) => (
  <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`} />
)

export default function EditCourse() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'
  
  const [course, setCourse] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'BEGINNER',
    thumbnailUrl: '',
    published: false
  })
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  
  // Modal states
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [selectedModuleId, setSelectedModuleId] = useState(null)
  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [newLessonTitle, setNewLessonTitle] = useState('')
  const [modalSaving, setModalSaving] = useState(false)

  useEffect(() => {
    if (!isNew) {
      fetchCourse()
    }
  }, [id])

  const fetchCourse = async () => {
    try {
      const [courseRes, modulesRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/modules/course/${id}`)
      ])
      setCourse(courseRes.data)
      setModules(modulesRes.data)
    } catch (error) {
      console.error('Failed to fetch course:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (isNew) {
        const response = await api.post('/admin/courses', course)
        navigate(`/admin/courses/${response.data.id}`)
      } else {
        await api.put(`/admin/courses/${id}`, course)
      }
    } catch (error) {
      console.error('Failed to save course:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setCourse(prev => ({ ...prev, [field]: value }))
  }

  const openModuleModal = () => {
    setNewModuleTitle('')
    setShowModuleModal(true)
  }

  const closeModuleModal = () => {
    setShowModuleModal(false)
    setNewModuleTitle('')
  }

  const addModule = async () => {
    if (!newModuleTitle.trim()) return
    setModalSaving(true)

    try {
      const response = await api.post(`/modules/course/${id}`, {
        title: newModuleTitle.trim(),
        orderIndex: modules.length
      })
      setModules([...modules, response.data])
      closeModuleModal()
    } catch (error) {
      console.error('Failed to add module:', error)
    } finally {
      setModalSaving(false)
    }
  }

  const deleteModule = async (moduleId) => {
    if (!window.confirm('Delete this module and all its content?')) return

    try {
      await api.delete(`/modules/${moduleId}`)
      setModules(modules.filter(m => m.id !== moduleId))
    } catch (error) {
      console.error('Failed to delete module:', error)
    }
  }

  const openLessonModal = (moduleId) => {
    setSelectedModuleId(moduleId)
    setNewLessonTitle('')
    setShowLessonModal(true)
  }

  const closeLessonModal = () => {
    setShowLessonModal(false)
    setSelectedModuleId(null)
    setNewLessonTitle('')
  }

  const addSubModule = async () => {
    if (!newLessonTitle.trim() || !selectedModuleId) return
    setModalSaving(true)

    try {
      const module = modules.find(m => m.id === selectedModuleId)
      const response = await api.post(`/submodules/module/${selectedModuleId}`, {
        title: newLessonTitle.trim(),
        orderIndex: module.subModuleCount || 0
      })
      setModules(modules.map(m => 
        m.id === selectedModuleId 
          ? { ...m, subModuleCount: (m.subModuleCount || 0) + 1, subModules: [...(m.subModules || []), response.data] }
          : m
      ))
      closeLessonModal()
    } catch (error) {
      console.error('Failed to add lesson:', error)
    } finally {
      setModalSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-1/3 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {isNew ? 'Create New Course' : 'Edit Course'}
        </h1>
        <p className="text-gray-500">
          {isNew ? 'Set up your course details' : 'Update course information and content'}
        </p>
      </motion.div>

      <motion.form 
        className="space-y-8"
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Course Details Card */}
        <div className="card p-6 md:p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Course Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                className="input"
                value={course.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter course title"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">Description</label>
              <textarea
                id="description"
                className="input min-h-[100px]"
                value={course.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe your course"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                className="input"
                value={course.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="e.g., Web Development"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                className="input"
                value={course.difficulty || 'BEGINNER'}
                onChange={(e) => handleChange('difficulty', e.target.value)}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="thumbnail">Thumbnail URL</label>
              <input
                type="url"
                id="thumbnail"
                className="input"
                value={course.thumbnailUrl || ''}
                onChange={(e) => handleChange('thumbnailUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/admin/courses')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Course'}
            </button>
          </div>
        </div>
      </motion.form>

      {!isNew && (
        <motion.div 
          className="mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Course Content</h3>
            <button 
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/admin/courses/${id}/content`)}
            >
              <span className="mr-2">✏️</span> Open Content Editor
            </button>
          </div>

          <div className="space-y-4">
            {modules.map((module, index) => (
              <div key={module.id} className="card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 text-primary-600 font-semibold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-lg">{module.title}</h4>
                      <div className="text-sm text-gray-500 mt-1">{module.subModuleCount || 0} lessons</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openLessonModal(module.id)}
                      className="btn btn-ghost text-sm px-3 py-1.5"
                    >
                      + Add Lesson
                    </button>
                    <button
                      onClick={() => deleteModule(module.id)}
                      className="btn btn-ghost text-red-500 hover:text-red-600 hover:bg-red-50 text-sm px-3 py-1.5"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {module.subModules && module.subModules.length > 0 && (
                  <div className="pl-12 space-y-2">
                    {module.subModules.map((lesson, lessonIndex) => (
                      <div 
                        key={lesson.id} 
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer group"
                        onClick={() => navigate(`/admin/courses/${id}/content`)}
                      >
                        <span className="text-lg text-gray-400 group-hover:text-primary-500">📄</span>
                        <span className="text-sm text-gray-700 font-medium">{lessonIndex + 1}. {lesson.title}</span>
                        <span className="ml-auto text-gray-400 group-hover:text-primary-500">→</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            <button 
              type="button" 
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-primary-500 hover:text-primary-500 hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
              onClick={openModuleModal}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Module
            </button>
          </div>
        </motion.div>
      )}

      {/* Add Module Modal */}
      <AnimatePresence>
        {showModuleModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModuleModal}
          >
            <motion.div 
              className="modal-content p-6"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Add New Module</h3>
                <button className="text-gray-400 hover:text-gray-600" onClick={closeModuleModal}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="moduleTitle">Module Title</label>
                <input
                  type="text"
                  id="moduleTitle"
                  className="input"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="e.g., Introduction to React"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && addModule()}
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button className="btn btn-secondary" onClick={closeModuleModal}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={addModule}
                  disabled={!newModuleTitle.trim() || modalSaving}
                >
                  {modalSaving ? 'Adding...' : 'Add Module'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Lesson Modal */}
      <AnimatePresence>
        {showLessonModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLessonModal}
          >
            <motion.div 
              className="modal-content p-6"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Add New Lesson</h3>
                <button className="text-gray-400 hover:text-gray-600" onClick={closeLessonModal}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lessonTitle">Lesson Title</label>
                <input
                  type="text"
                  id="lessonTitle"
                  className="input"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="e.g., Setting up your environment"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && addSubModule()}
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button className="btn btn-secondary" onClick={closeLessonModal}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={addSubModule}
                  disabled={!newLessonTitle.trim() || modalSaving}
                >
                  {modalSaving ? 'Adding...' : 'Add Lesson'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
