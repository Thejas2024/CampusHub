
import React, { useMemo, useState } from 'react'
import {
  Search,
  Plus,
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Download,
  Filter,
  Mail,
  X,
} from 'lucide-react'

const initialStudents = [
  {
    id: 'CH001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    course: 'Full Stack Development',
    joined: '12 Oct 2026',
    status: 'Active',
  },
  {
    id: 'CH002',
    name: 'Priya Kumar',
    email: 'priya.kumar@example.com',
    course: 'Data Science',
    joined: '10 Oct 2026',
    status: 'Active',
  },
  {
    id: 'CH003',
    name: 'Arjun Reddy',
    email: 'arjun.reddy@example.com',
    course: 'Java Development',
    joined: '08 Oct 2026',
    status: 'Inactive',
  },
  {
    id: 'CH004',
    name: 'Sneha Patil',
    email: 'sneha.patil@example.com',
    course: 'UI/UX Design',
    joined: '05 Oct 2026',
    status: 'Active',
  },
  {
    id: 'CH005',
    name: 'Karthik Rao',
    email: 'karthik.rao@example.com',
    course: 'Full Stack Development',
    joined: '02 Oct 2026',
    status: 'Pending',
  },
  {
    id: 'CH006',
    name: 'Ananya Singh',
    email: 'ananya.singh@example.com',
    course: 'Data Science',
    joined: '28 Sep 2026',
    status: 'Active',
  },
]

const PROFILE_STORAGE_KEY = 'campushub-profile'

const loadStudents = () => {
  let profile

  try {
    profile = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || 'null')
  } catch {
    profile = null
  }

  if (!profile?.fullName || !profile?.email) return initialStudents

  const profileStudent = {
    id: profile.studentId || 'CH007',
    name: profile.fullName,
    email: profile.email,
    course: profile.degree || 'Not specified',
    joined: profile.joined || new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    status: 'Active',
    degree: profile.degree || '',
    graduationYear: profile.graduationYear || '',
    technicalSkills: profile.technicalSkills || '',
    portfolioUrl: profile.portfolioUrl || '',
  }

  return [profileStudent, ...initialStudents.filter((student) => student.id !== profileStudent.id)]
}

const emptyForm = {
  name: '',
  email: '',
  course: 'Full Stack Development',
  status: 'Active',
}

export default function Students() {
  const [students, setStudents] = useState(loadStudents)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [menuId, setMenuId] = useState(null)
  const [message, setMessage] = useState('')

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const query = search.toLowerCase()

      const matchesSearch =
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.id.toLowerCase().includes(query) ||
        student.course.toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === 'All' || student.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [students, search, statusFilter])

  const activeCount = students.filter(
    (student) => student.status === 'Active'
  ).length

  const inactiveCount = students.filter(
    (student) => student.status === 'Inactive'
  ).length

  const pendingCount = students.filter(
    (student) => student.status === 'Pending'
  ).length

  const openAddForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
    setMessage('')
  }

  const openEditForm = (student) => {
    setEditingId(student.id)
    setForm({
      name: student.name,
      email: student.email,
      course: student.course,
      status: student.status,
    })
    setShowForm(true)
    setMenuId(null)
    setMessage('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const emailExists = students.some(
      (student) =>
        student.email.toLowerCase() === form.email.trim().toLowerCase() &&
        student.id !== editingId
    )

    if (emailExists) {
      setMessage('A student with this email already exists.')
      return
    }

    if (editingId) {
      setStudents((current) =>
        current.map((student) =>
          student.id === editingId
            ? { ...student, ...form, name: form.name.trim(), email: form.email.trim() }
            : student
        )
      )
      setMessage('Student updated successfully.')
    } else {
      const newStudent = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        id: `CH${String(Date.now()).slice(-6)}`,
        joined: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      }

      setStudents((current) => [newStudent, ...current])
      setMessage('Student added successfully.')
    }

    setShowForm(false)
    setForm(emptyForm)
  }

  const deleteStudent = (id) => {
    const student = students.find((item) => item.id === id)

    if (!student) return

    if (window.confirm(`Delete ${student.name} from this demo list?`)) {
      setStudents((current) =>
        current.filter((item) => item.id !== id)
      )
      setMenuId(null)
      setSelectedStudent(null)
      setMessage('Student removed from the demo list.')
    }
  }

  const exportCSV = () => {
    const escapeCSV = (value) =>
      `"${String(value).replace(/"/g, '""')}"`

    const headers = [
      'Student ID',
      'Name',
      'Email',
      'Course',
      'Joined Date',
      'Status',
    ]

    const rows = filteredStudents.map((student) => [
      student.id,
      student.name,
      student.email,
      student.course,
      student.joined,
      student.status,
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(','))
      .join('\r\n')

    const blob = new Blob(['\uFEFF', csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'campushub-students.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const statusClass = (status) => {
    if (status === 'Active') {
      return 'bg-green-50 text-green-700 ring-green-200'
    }

    if (status === 'Inactive') {
      return 'bg-red-50 text-red-600 ring-red-200'
    }

    return 'bg-amber-50 text-amber-700 ring-amber-200'
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Students
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage student accounts, courses and enrollment status.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download size={17} />
            Export CSV
          </button>

          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            <Plus size={18} />
            Add Student
          </button>
        </div>
      </div>

      {/* Feedback */}
      {message && (
        <div className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          <span>{message}</span>
          <button
            onClick={() => setMessage('')}
            aria-label="Dismiss message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Total Students',
            value: students.length,
            icon: Users,
            color: 'bg-orange-50 text-orange-600',
          },
          {
            label: 'Active Students',
            value: activeCount,
            icon: UserCheck,
            color: 'bg-green-50 text-green-600',
          },
          {
            label: 'Inactive Students',
            value: inactiveCount,
            icon: UserX,
            color: 'bg-red-50 text-red-500',
          },
          {
            label: 'Pending Students',
            value: pendingCount,
            icon: GraduationCap,
            color: 'bg-amber-50 text-amber-600',
          },
        ].map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {card.value}
                  </p>
                </div>

                <div className={`rounded-xl p-3 ${card.color}`}>
                  <Icon size={23} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Students table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              All Students
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredStudents.length} student
              {filteredStudents.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search students..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:w-64"
              />
            </div>

            <div className="relative">
              <Filter
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-orange-400 sm:w-40"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Student ID</th>
                <th className="px-5 py-4">Course</th>
                <th className="px-5 py-4">Joined Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, index) => (
                <tr
                  key={student.id}
                  className="transition hover:bg-orange-50/30"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          index % 3 === 0
                            ? 'bg-orange-100 text-orange-700'
                            : index % 3 === 1
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {student.name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800">
                          {student.name}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <Mail size={12} />
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-slate-600">
                    {student.id}
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-block max-w-52 text-sm text-slate-600">
                      {student.course}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {student.joined}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(student.status)}`}
                    >
                      {student.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setMenuId(
                            menuId === student.id ? null : student.id
                          )
                        }
                        aria-label={`Actions for ${student.name}`}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        <MoreVertical size={19} />
                      </button>

                      {menuId === student.id && (
                        <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 text-left shadow-xl">
                          <button
                            onClick={() => {
                              setSelectedStudent(student)
                              setMenuId(null)
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                          >
                            <Eye size={16} />
                            View Details
                          </button>

                          <button
                            onClick={() => openEditForm(student)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                          >
                            <Pencil size={16} />
                            Edit Student
                          </button>

                          <button
                            onClick={() => deleteStudent(student.id)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                            Delete Student
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-14 text-center">
                    <Users
                      size={36}
                      className="mx-auto text-slate-300"
                    />
                    <p className="mt-3 font-semibold text-slate-700">
                      No students found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search or status filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {/* Add / Edit student modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false)
            }
          }}
        >
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingId ? 'Edit Student' : 'Add New Student'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the student's account details.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  maxLength={254}
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="student@example.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Course
                </label>
                <select
                  value={form.course}
                  onChange={(event) =>
                    setForm({ ...form, course: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                >
                  <option>Full Stack Development</option>
                  <option>Data Science</option>
                  <option>Java Development</option>
                  <option>UI/UX Design</option>
                  <option>Python Programming</option>
                  <option>Cloud Computing</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Pending</option>
                </select>
              </div>

              {message && (
                <p className="text-sm text-red-600">{message}</p>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
                >
                  {editingId ? 'Save Changes' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student details modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Student Details
              </h2>
              <button
                onClick={() => setSelectedStudent(null)}
                aria-label="Close details"
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-lg font-bold text-orange-600">
                {selectedStudent.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  {selectedStudent.name}
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedStudent.id}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                ['Email', selectedStudent.email],
                ['Course', selectedStudent.course],
                ['Joined Date', selectedStudent.joined],
                ['Status', selectedStudent.status],
                ...(selectedStudent.degree ? [['Degree', selectedStudent.degree]] : []),
                ...(selectedStudent.graduationYear ? [['Graduation Year', selectedStudent.graduationYear]] : []),
                ...(selectedStudent.technicalSkills ? [['Technical Skills', selectedStudent.technicalSkills]] : []),
                ...(selectedStudent.portfolioUrl ? [['Portfolio', selectedStudent.portfolioUrl]] : []),
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 border-b border-slate-100 pb-3"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {label}
                  </p>
                  <p className="break-words text-sm font-medium text-slate-700">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedStudent(null)}
              className="mt-6 w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
