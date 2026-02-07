import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../api/axios'

export default function ManageCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await api.get('/admin/courses')
      setCourses(response.data)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return
    
    try {
      await api.delete(`/admin/courses/${id}`)
      setCourses(courses.filter(c => c.id !== id))
    } catch (error) {
      console.error('Failed to delete course:', error)
    }
  }

  const togglePublish = async (course) => {
    try {
      const endpoint = course.published ? 'unpublish' : 'publish'
      await api.put(`/admin/courses/${course.id}/${endpoint}`)
      setCourses(courses.map(c => 
        c.id === course.id ? { ...c, published: !c.published } : c
      ))
    } catch (error) {
      console.error('Failed to toggle publish:', error)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="page-header">
          <h1>Manage Courses</h1>
        </div>
        <div className="courses-table">
          <div className="skeleton" style={{ height: 200 }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Manage Courses</h1>
        <p>Create, edit, and publish your courses</p>
      </motion.div>

      <motion.div 
        className="courses-table"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="table-header">
          <h2>{courses.length} Courses</h2>
          <Link to="/admin/courses/new" className="btn btn-primary">
            + New Course
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="empty-state" style={{ padding: 48 }}>
            <h3>No courses yet</h3>
            <p>Create your first course to get started</p>
          </div>
        ) : (
          <div className="courses-list">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                className="course-row"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="course-row-info">
                  <div className="course-row-title">{course.title}</div>
                  <div className="course-row-meta">
                    {course.moduleCount} modules • {course.totalSubModules} lessons
                    {course.category && ` • ${course.category}`}
                  </div>
                </div>
                <span className={`badge ${course.published ? 'badge-success' : 'badge-warning'}`}>
                  {course.published ? 'Published' : 'Draft'}
                </span>
                <div className="course-row-actions">
                  <button
                    onClick={() => togglePublish(course)}
                    className="btn btn-ghost btn-small"
                  >
                    {course.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <Link to={`/admin/courses/${course.id}`} className="btn btn-secondary btn-small">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="btn btn-ghost btn-small"
                    style={{ color: 'var(--error)' }}
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
