import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()

  const menuItems = [
    {
      title: 'Manage Courses',
      description: 'Create, edit, and publish courses',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 14l9-5-9-5-9 5 9 5z"/>
          <path d="M12 14v7"/>
          <path d="M5 9v7c0 1.5 3.1 3 7 3s7-1.5 7-3V9"/>
        </svg>
      ),
      link: '/admin/courses',
      color: 'primary'
    },
    {
      title: 'Create New Course',
      description: 'Start building a new course from scratch',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      ),
      link: '/admin/courses/new',
      color: 'success'
    }
  ]

  return (
    <div className="container admin-dashboard">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.name}. Manage your learning platform.</p>
      </motion.div>

      <motion.div 
        className="admin-menu"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {menuItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <Link to={item.link} className={`admin-card ${item.color}`}>
              <div className="admin-card-icon">{item.icon}</div>
              <div className="admin-card-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <svg className="admin-card-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,6 15,12 9,18"/>
              </svg>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
