import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../api/axios'


export default function EditLesson() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const isNew = !lessonId || lessonId === 'new'
  
  const [lesson, setLesson] = useState({
    title: '',
    introContent: '',
    bodyContent: '',
    summaryContent: '',
    videoUrl: '',
    orderIndex: 0
  })
  const [module, setModule] = useState(null)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('intro')

  useEffect(() => {
    if (!isNew) {
      fetchLesson()
    }
  }, [lessonId])

  const fetchLesson = async () => {
    try {
      const response = await api.get(`/submodules/${lessonId}`)
      setLesson(response.data)
      // Also fetch the parent module for navigation
      if (response.data.moduleId) {
        const moduleRes = await api.get(`/modules/${response.data.moduleId}`)
        setModule(moduleRes.data)
      }
    } catch (error) {
      console.error('Failed to fetch lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await api.put(`/submodules/${lessonId}`, lesson)
      // Show success and go back
      navigate(-1)
    } catch (error) {
      console.error('Failed to save lesson:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setLesson(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="container">
        <div className="edit-form">
          <div className="skeleton" style={{ height: 40, width: '40%', marginBottom: 32 }}></div>
          <div className="skeleton" style={{ height: 500 }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container lesson-editor">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="breadcrumb">
          {module && (
            <>
              <span className="breadcrumb-item">{module.title}</span>
              <span className="breadcrumb-separator">→</span>
            </>
          )}
          <span className="breadcrumb-current">{lesson.title || 'Lesson'}</span>
        </div>
        <h1>Edit Lesson</h1>
        <p>Add content, videos, and resources to your lesson</p>
      </motion.div>

      <motion.form 
        className="edit-form lesson-form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Basic Info Section */}
        <div className="form-section">
          <h3>Lesson Details</h3>
          <div className="form-grid">
            <div className="input-group full">
              <label htmlFor="title">Lesson Title</label>
              <input
                type="text"
                id="title"
                value={lesson.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter lesson title"
                required
              />
            </div>
            <div className="input-group full">
              <label htmlFor="videoUrl">Video URL (optional)</label>
              <input
                type="url"
                id="videoUrl"
                value={lesson.videoUrl || ''}
                onChange={(e) => handleChange('videoUrl', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
              <span className="input-hint">YouTube, Vimeo, or direct video link</span>
            </div>
          </div>
        </div>

        {/* Content Tabs Section */}
        <div className="form-section">
          <h3>Lesson Content</h3>
          
          <div className="content-tabs">
            <button
              type="button"
              className={`content-tab ${activeTab === 'intro' ? 'active' : ''}`}
              onClick={() => setActiveTab('intro')}
            >
              <span className="tab-icon">📖</span>
              Introduction
            </button>
            <button
              type="button"
              className={`content-tab ${activeTab === 'body' ? 'active' : ''}`}
              onClick={() => setActiveTab('body')}
            >
              <span className="tab-icon">📝</span>
              Main Content
            </button>
            <button
              type="button"
              className={`content-tab ${activeTab === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              <span className="tab-icon">✅</span>
              Summary
            </button>
          </div>

          <div className="content-editor-container">
            {activeTab === 'intro' && (
              <motion.div 
                className="content-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="panel-header">
                  <h4>Introduction</h4>
                  <p>Set the context and learning objectives for this lesson</p>
                </div>
                <textarea
                  className="content-textarea"
                  value={lesson.introContent || ''}
                  onChange={(e) => handleChange('introContent', e.target.value)}
                  placeholder="Welcome students to this lesson. Explain what they'll learn and why it matters..."
                  rows={12}
                />
              </motion.div>
            )}

            {activeTab === 'body' && (
              <motion.div 
                className="content-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="panel-header">
                  <h4>Main Content</h4>
                  <p>The core teaching material for this lesson</p>
                </div>
                <textarea
                  className="content-textarea large"
                  value={lesson.bodyContent || ''}
                  onChange={(e) => handleChange('bodyContent', e.target.value)}
                  placeholder="Write your main lesson content here. You can use Markdown for formatting.

## Concepts
Explain the key concepts...

## Examples
Show practical examples...

## Code Snippets
```javascript
// Add code examples
```"
                  rows={20}
                />
              </motion.div>
            )}

            {activeTab === 'summary' && (
              <motion.div 
                className="content-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="panel-header">
                  <h4>Summary</h4>
                  <p>Key takeaways and next steps</p>
                </div>
                <textarea
                  className="content-textarea"
                  value={lesson.summaryContent || ''}
                  onChange={(e) => handleChange('summaryContent', e.target.value)}
                  placeholder="Summarize the key points:

• Key concept 1
• Key concept 2
• Key concept 3

What's next: Preview what's coming in the next lesson..."
                  rows={12}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="form-section">
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Lesson'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </div>
      </motion.form>
    </div>
  )
}
