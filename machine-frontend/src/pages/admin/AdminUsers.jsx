// frontend/src/pages/admin/AdminUsers.jsx
import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { FiSearch, FiMail, FiPhone, FiCalendar, FiUser, FiShield, FiEdit2, FiEye, FiTrash2 } from 'react-icons/fi'
import { userService } from '../../services/userService'
import toast from 'react-hot-toast'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('All')

  const location = useLocation()

  // ✅ Re-fetch users whenever we navigate to this page
  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      const response = await userService.getAllUsers()
      console.log('Users Response:', response.data)

      let usersData = []

      if (response.data?.data?.users) {
        usersData = response.data.data.users
      } else if (response.data?.users) {
        usersData = response.data.users
      } else if (Array.isArray(response.data?.data)) {
        usersData = response.data.data
      } else if (Array.isArray(response.data)) {
        usersData = response.data
      }

      console.log('📋 Extracted users:', usersData.length)
      setUsers(usersData)

    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs font-medium">
          <FiShield size={12} /> Admin
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">
        <FiUser size={12} /> User
      </span>
    )
  }

  const filteredUsers = users.filter(user => {
    const searchTerm = search.toLowerCase()
    // ✅ Safe string conversion — prevents crash if a field is a number
    const matchesSearch =
      String(user.firstName || '').toLowerCase().includes(searchTerm) ||
      String(user.lastName || '').toLowerCase().includes(searchTerm) ||
      String(user.email || '').toLowerCase().includes(searchTerm) ||
      String(user.phone || '').toLowerCase().includes(searchTerm)

    const matchesRole = filterRole === 'All' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all customer accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
            {filteredUsers.length} users
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
          >
            <option value="All">All Roles</option>
            <option value="user">👤 Users</option>
            <option value="admin">🛡️ Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {user.firstName?.[0] || user.email?.[0] || 'U'}
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {user.firstName} {user.lastName || ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FiMail size={14} className="text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.phone ? (
                        <div className="flex items-center gap-1">
                          <FiPhone size={14} className="text-gray-400" />
                          {user.phone}
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FiCalendar size={14} className="text-gray-400" />
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Orders">
                          <FiEye size={17} />
                        </button>
                        <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit User">
                          <FiEdit2 size={17} />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                          <FiTrash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {user.firstName?.[0] || user.email?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-800">
                        {user.firstName} {user.lastName || ''}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <FiMail size={12} />
                        {user.email}
                      </p>
                    </div>
                  </div>
                  {getRoleBadge(user.role)}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {user.phone ? (
                      <span className="flex items-center gap-1">
                        <FiPhone size={14} />
                        {user.phone}
                      </span>
                    ) : (
                      <span className="text-gray-400">No phone</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    View Orders
                  </button>
                  <button className="flex-1 px-3 py-1.5 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            ))
          ) : null}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No users found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {users.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-gray-500">Total Users</p>
              <p className="text-lg font-bold text-gray-800">{users.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Customers</p>
              <p className="text-lg font-bold text-blue-600">{users.filter(u => u.role === 'user').length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Admins</p>
              <p className="text-lg font-bold text-purple-600">{users.filter(u => u.role === 'admin').length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers