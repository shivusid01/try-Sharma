import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { userAPI } from '../../services/api'

const AdminDashboard = () => {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('register') // 'register' or 'students'
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Registration form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    parentPhone: '',
    class: '',
    address: '',
    enrollmentDate: new Date().toISOString().split('T')[0]
  })

  // Fetch all students on component mount
  useEffect(() => {
    fetchAllStudents()
  }, [])

  const fetchAllStudents = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getAllStudents()
      if (response.data.success) {
        setStudents(response.data.students || [])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleRegisterStudent = async (e) => {
  e.preventDefault()
  
  // Validate form
  if (!formData.name || !formData.email || !formData.phone) {
    alert('Name, email, and phone are required!')
    return
  }

  try {
    setLoading(true)
    
    // Generate enrollment ID
    const enrollmentId = `ENR${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`
    
    // Prepare student data
    const studentData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      parentPhone: formData.parentPhone,
      class: formData.class,
      address: formData.address,
      enrollmentDate: formData.enrollmentDate,
      enrollmentId: enrollmentId,
      // password will be set by backend
      role: 'student',
      status: 'active'
    }

    console.log('📤 Sending student data to backend:', studentData)

    const response = await userAPI.registerStudent(studentData)
    
    console.log('✅ Backend response:', response.data)
    
    if (response.data.success) {
      alert(`✅ Student registered successfully!\n\nEnrollment ID: ${enrollmentId}\nEmail: ${formData.email}\nPassword: welcome123`)
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        parentPhone: '',
        class: '',
        address: '',
        enrollmentDate: new Date().toISOString().split('T')[0]
      })
      
      // Refresh student list
      fetchAllStudents()
      setActiveTab('students')
    } else {
      alert(`❌ Registration failed: ${response.data.message}`)
    }
    
  } catch (error) {
    console.error('❌ Registration error:', error)
    
    // Show actual error message from backend
    if (error.response?.data?.message) {
      alert(`❌ Error: ${error.response.data.message}`)
    } else if (error.response?.data?.error) {
      alert(`❌ Error: ${error.response.data.error}`)
    } else {
      alert('❌ Failed to register student. Please try again.')
    }
    
  } finally {
    setLoading(false)
  }
}

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return
    }

    try {
      const response = await userAPI.deleteStudent(studentId)
      if (response.data.success) {
        alert('Student deleted successfully')
        fetchAllStudents()
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete student')
    }
  }

  const handleSendCredentials = (student) => {
    const credentials = `
Student Credentials:
-------------------
Name: ${student.name}
Enrollment ID: ${student.enrollmentId}
Email: ${student.email}
Password: welcome123
Login URL: http://localhost:5173/login

Instructions:
1. Use Enrollment ID or Email to login
2. First time password: welcome123
3. Change password after first login
    `
    
    // Copy to clipboard
    navigator.clipboard.writeText(credentials)
      .then(() => {
        alert('Credentials copied to clipboard!')
      })
      .catch(err => {
        console.error('Copy failed:', err)
        alert('Please copy manually:\n' + credentials)
      })
  }

  // Available classes
  const classOptions = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11 (Science)', 'Class 12 (Science)',
    'Class 11 (Commerce)', 'Class 12 (Commerce)',
    'JEE Preparation', 'NEET Preparation', 'UPSC Foundation'
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome, {currentUser?.name || 'Admin'}. Manage student registrations and institute operations.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Student Registration & Management */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('register')}
              className={`px-6 py-3 font-medium text-sm ${activeTab === 'register' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              📝 Register New Student
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-6 py-3 font-medium text-sm ${activeTab === 'students' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              👨‍🎓 All Students ({students.length})
            </button>
          </div>

          {/* Registration Form */}
          {activeTab === 'register' && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Register New Student
              </h2>
              
              <form onSubmit={handleRegisterStudent}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter student's full name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="student@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student's Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="9876543210"
                    />
                  </div>

                  {/* Parent Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent's Phone *
                    </label>
                    <input
                      type="tel"
                      name="parentPhone"
                      value={formData.parentPhone}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="9876543210"
                    />
                  </div>

                  {/* Class */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class *
                    </label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Class</option>
                      {classOptions.map((cls, index) => (
                        <option key={index} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  {/* Enrollment Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enrollment Date *
                    </label>
                    <input
                      type="date"
                      name="enrollmentDate"
                      value={formData.enrollmentDate}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Address - Full Width */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Full residential address"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl text-lg transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                        Registering Student...
                      </div>
                    ) : (
                      'Register Student'
                    )}
                  </button>
                </div>

                {/* Note */}
                <div className="mt-4 text-sm text-gray-500">
                  <p>✅ Default password will be: <strong>welcome123</strong></p>
                  <p>✅ Enrollment ID will be automatically generated</p>
                  <p>✅ Student will receive login credentials</p>
                </div>
              </form>
            </div>
          )}

          {/* All Students List */}
          {activeTab === 'students' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  All Students ({students.length})
                </h2>
                <button
                  onClick={() => setActiveTab('register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  + Add New Student
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading students...</p>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">👨‍🎓</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Students Found</h3>
                  <p className="text-gray-600">Register your first student to get started</p>
                  <button
                    onClick={() => setActiveTab('register')}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    Register First Student
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Class
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500 font-mono">
                                ID: {student.enrollmentId || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-400">
                                Joined: {new Date(student.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm text-gray-900">{student.email}</div>
                              <div className="text-sm text-gray-500">{student.phone}</div>
                              <div className="text-xs text-gray-400">
                                Parent: {student.parentPhone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {student.class || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              student.status === 'active' 
                                ? 'bg-green-100 text-green-800'
                                : student.status === 'inactive'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {student.status || 'active'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSendCredentials(student)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                title="Send Credentials"
                              >
                                🔑
                              </button>
                              <Link
                                to={`/admin/students/${student._id}`}
                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                                title="Edit"
                              >
                                ✏️
                              </Link>
                              <button
                                onClick={() => handleDeleteStudent(student._id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Quick Stats */}
              {students.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600">Total Students</div>
                    <div className="text-2xl font-bold">{students.length}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600">Active</div>
                    <div className="text-2xl font-bold">
                      {students.filter(s => s.status === 'active').length}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600">This Month</div>
                    <div className="text-2xl font-bold">
                      {students.filter(s => {
                        const joinDate = new Date(s.createdAt)
                        const now = new Date()
                        return joinDate.getMonth() === now.getMonth() && 
                               joinDate.getFullYear() === now.getFullYear()
                      }).length}
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-yellow-600">Classes</div>
                    <div className="text-2xl font-bold">
                      {new Set(students.map(s => s.class)).size}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Quick Actions */}
        <div>
         // AdminDashboard.js में Quick Actions section update करें:

{/* Quick Actions */}
<div className="bg-white rounded-xl shadow-md p-6 mb-8">
  <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
  <div className="grid grid-cols-2 gap-4">
    <Link to="/admin/courses" className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors">
      <span className="text-3xl mb-2">🎥</span>
      <span className="font-medium text-center">Class Control</span>
    </Link>
    <Link to="/admin/students" className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors">
      <span className="text-3xl mb-2">👨‍🎓</span>
      <span className="font-medium text-center">Manage Students</span>
    </Link>
    {/* <Link to="/admin/classes" className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors">
      <span className="text-3xl mb-2">🎥</span>
      <span className="font-medium text-center">Class Control</span>
    </Link> */}
    <Link to="/admin/payments" className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors">
      <span className="text-3xl mb-2">💰</span>
      <span className="font-medium text-center">Payment Records</span>
    </Link>
   <Link to="/admin/notices" className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors">
  <span className="text-3xl mb-2">📢</span>
  <span className="font-medium text-center">Notices</span>
</Link>
   {/* <button 
      onClick={() => window.location.href = "/admin/courses?showModal=true"}
      className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors cursor-pointer"
    >
      <span className="text-3xl mb-2">📅</span>
      <span className="font-medium text-center">Schedule Class</span>
    </button> */}
  </div>
</div>

          {/* Registration Stats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Registration Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-600">👥</span>
                  </div>
                  <div>
                    <div className="font-medium">Total Students</div>
                    <div className="text-sm text-gray-500">All time registrations</div>
                  </div>
                </div>
                <div className="text-2xl font-bold">{students.length}</div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <span className="text-green-600">📈</span>
                  </div>
                  <div>
                    <div className="font-medium">This Month</div>
                    <div className="text-sm text-gray-500">New registrations</div>
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {students.filter(s => {
                    const joinDate = new Date(s.createdAt)
                    const now = new Date()
                    return joinDate.getMonth() === now.getMonth() && 
                           joinDate.getFullYear() === now.getFullYear()
                  }).length}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <span className="text-purple-600">🎓</span>
                  </div>
                  <div>
                    <div className="font-medium">Active Classes</div>
                    <div className="text-sm text-gray-500">Different classes</div>
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {new Set(students.map(s => s.class)).size}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                {/* <button
                  onClick={() => setActiveTab('register')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition-all"
                >
                  + Register New Student
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard