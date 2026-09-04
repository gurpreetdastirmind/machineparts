import React, { createContext, useContext, useState } from 'react'

const NotificationContext = createContext()

export const useNotification = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const addNotification = (message, type = 'info') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      removeNotification(id)
    }, 3000)
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Toast notification component
  const NotificationToast = () => {
    if (notifications.length === 0) return null
    
    return (
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg text-white transform transition-all duration-300 ${
              notification.type === 'success' ? 'bg-green-600' :
              notification.type === 'error' ? 'bg-red-600' :
              notification.type === 'warning' ? 'bg-yellow-600' :
              'bg-blue-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{notification.message}</span>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-4 text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <NotificationToast />
    </NotificationContext.Provider>
  )
}