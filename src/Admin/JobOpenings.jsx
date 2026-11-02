
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, BriefcaseBusiness, Users, Eye, Edit,
  Trash2, X, MapPin, Clock, DollarSign, Calendar,
  MoreVertical, Copy, Send, Save, Filter, Building2,
  CheckCircle2, FileText, TrendingUp, ChevronDown
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const emptyJob = {
  title: '',
  company: '',
  type: 'Full-time',
  location: '',
  salary: '',
  experience: '',
  vacancies: 1,
  skills: '',
  description: '',
  responsibilities: '',
  qualifications: '',
  deadline: '',
  applications: 0,
  status: 'Draft'
}

function JobField({
  label,
  name,
  type = 'text',
  required = false,
  placeholder = '',
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        type={type}
        value={value ?? ''}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        min={type === 'number' ? 1 : undefined}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
      />
    </div>
  )
}

export default function JobOpenings() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedJob, setSelectedJob] = useState(null)
  const [menuId, setMenuId] = useState(null)
  const [form, setForm] = useState(emptyJob)

  useEffect(() => {
    const controller = new AbortController()
    const token = localStorage.getItem('campushub-admin-token')

    if (!token) {
      navigate('/admin/login', { replace: true })
      return () => controller.abort()
    }

    async function loadJobs() {
      try {
        const response = await fetch(`${API_URL}/api/admin/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })
        const result = await response.json()
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('campushub-admin-token')
          navigate('/admin/login', { replace: true })
          return
        }
        if (!response.ok) {
          throw new Error(result.message || 'Unable to load job openings.')
        }
        setJobs(result)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(
            requestError instanceof TypeError
              ? 'Cannot connect to the jobs service. Check that the backend is running.'
              : requestError.message
          )
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadJobs()
    return () => controller.abort()
  }, [navigate])

  const saveJobRequest = async (job, id) => {
    const token = localStorage.getItem('campushub-admin-token')
    const response = await fetch(
      `${API_URL}/api/admin/jobs${id ? `/${id}` : ''}`,
      {
        method: id ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(job),
      }
    )
    const result = response.status === 204 ? {} : await response.json()
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('campushub-admin-token')
      navigate('/admin/login', { replace: true })
    }
    if (!response.ok) {
      throw new Error(result.message || 'Unable to save the job opening.')
    }
    return result.job
  }

  const published = jobs.filter(j => j.status === 'Published').length
  const drafts = jobs.filter(j => j.status === 'Draft').length
  const applications = jobs.reduce((sum, j) => sum + Number(j.applications || 0), 0)

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = [
        job.title, job.company, job.location, job.skills
      ].join(' ').toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === 'All' || job.status === statusFilter

      const matchesType =
        typeFilter === 'All' || job.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [jobs, search, statusFilter, typeFilter])

  const updateField = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const openAddForm = () => {
    setEditingId(null)
    setForm(emptyJob)
    setShowForm(true)
  }

  const openEditForm = (job) => {
    setEditingId(job.id)
    setForm({ ...job })
    setShowForm(true)
    setMenuId(null)
  }

  const saveJob = async (e) => {
    e.preventDefault()

    if (!form.title.trim() || !form.company.trim() || !form.description.trim()) {
      alert('Please fill in the job title, company and description.')
      return
    }

    try {
      const savedJob = await saveJobRequest(form, editingId)
      setJobs(previous =>
        editingId
          ? previous.map(job => job.id === editingId ? savedJob : job)
          : [savedJob, ...previous]
      )
      setShowForm(false)
      setEditingId(null)
      setForm(emptyJob)
    } catch (requestError) {
      alert(requestError.message)
    }
  }

  const deleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return

    try {
      const token = localStorage.getItem('campushub-admin-token')
      const response = await fetch(`${API_URL}/api/admin/jobs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('campushub-admin-token')
        navigate('/admin/login', { replace: true })
      }
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || 'Unable to delete the job opening.')
      }

      setJobs(previous => previous.filter(job => job.id !== id))
      setMenuId(null)
      if (selectedJob?.id === id) setSelectedJob(null)
    } catch (requestError) {
      alert(requestError.message)
    }
  }

  const togglePublish = async (id) => {
    const job = jobs.find(item => item.id === id)
    if (!job) return

    try {
      const savedJob = await saveJobRequest({
        ...job,
        status: job.status === 'Published' ? 'Draft' : 'Published',
      }, id)
      setJobs(previous => previous.map(item => item.id === id ? savedJob : item))
      setMenuId(null)
    } catch (requestError) {
      alert(requestError.message)
    }
  }

  const duplicateJob = async (job) => {
    try {
      const { id, createdAt, created_at, applications, job_type, ...copy } = job
      const savedJob = await saveJobRequest({
        ...copy,
        title: `${job.title} (Copy)`,
        status: 'Draft',
        type: job.type || job_type,
        vacancies: job.vacancies || 1,
      })
      setJobs(previous => [savedJob, ...previous])
      setMenuId(null)
    } catch (requestError) {
      alert(requestError.message)
    }
  }

  const statCards = [
    {
      label: 'Total Jobs',
      value: jobs.length,
      icon: BriefcaseBusiness,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      label: 'Published',
      value: published,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Draft Jobs',
      value: drafts,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Applications',
      value: applications,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-7">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Job Openings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage, publish and track company job opportunities.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-semibold shadow-sm transition"
        >
          <Plus size={19} />
          Post New Job
        </button>
      </div>

      {error && (
        <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <h2 className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </h2>
                </div>
                <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                  <Icon size={23} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search job title, company or skills..."
              className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-orange-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500"
          >
            <option value="All">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500"
          >
            <option value="All">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-visible">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">All Job Listings</h2>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Loading job openings...' : `${filteredJobs.length} jobs found`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[850px]">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Job / Company</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Job Type</th>
                <th className="px-5 py-4">Applications</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredJobs.map(job => (
                <tr key={job.id} className="hover:bg-orange-50/30 transition">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-900">{job.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{job.company}</div>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {job.location || 'Not specified'}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg">
                      {job.type}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-gray-700">
                    {job.applications || 0}
                  </td>

                  <td className="px-5 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      job.status === 'Published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {job.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedJob(job)}
                        title="View job"
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        onClick={() => openEditForm(job)}
                        title="Edit job"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit size={17} />
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setMenuId(menuId === job.id ? null : job.id)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {menuId === job.id && (
                          <div className="absolute right-0 top-10 z-20 bg-white border border-gray-200 shadow-xl rounded-xl p-2 w-48">
                            <button
                              onClick={() => togglePublish(job.id)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg"
                            >
                              {job.status === 'Published' ? 'Unpublish' : 'Publish Job'}
                            </button>
                            <button
                              onClick={() => duplicateJob(job)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg"
                            >
                              Duplicate Job
                            </button>
                            <button
                              onClick={() => deleteJob(job.id)}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              Delete Job
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-14">
                    <BriefcaseBusiness size={35} className="mx-auto text-gray-300 mb-3" />
                    <p className="font-semibold text-gray-700">No jobs found</p>
                    <p className="text-sm text-gray-400 mt-1">Add a job or change your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 md:p-6">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="sticky top-0 z-10 bg-white border-b px-6 py-5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? 'Edit Job Opening' : 'Create Job Opening'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Enter job details below.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveJob} className="p-6 space-y-6">

              <div>
                <h3 className="font-bold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <JobField label="Job Title" name="title" required placeholder="e.g. Frontend Developer" value={form.title} onChange={updateField} />
                  <JobField label="Company Name" name="company" required placeholder="Company name" value={form.company} onChange={updateField} />

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type</label>
                    <select name="type" value={form.type} onChange={updateField} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Internship</option>
                      <option>Contract</option>
                    </select>
                  </div>

                  <JobField label="Location" name="location" placeholder="Bangalore / Remote" value={form.location} onChange={updateField} />
                  <JobField label="Salary / Stipend" name="salary" placeholder="4 - 6 LPA" value={form.salary} onChange={updateField} />
                  <JobField label="Experience Required" name="experience" placeholder="Fresher / 0-2 years" value={form.experience} onChange={updateField} />
                  <JobField label="Number of Vacancies" name="vacancies" type="number" value={form.vacancies} onChange={updateField} />
                  <JobField label="Application Deadline" name="deadline" type="date" value={form.deadline} onChange={updateField} />
                </div>
              </div>

              <div className="border-t pt-5">
                <h3 className="font-bold text-gray-800 mb-4">Job Description</h3>
                <div className="space-y-4">
                  {[
                    ['Description', 'description', 'Describe the role and opportunity...'],
                    ['Responsibilities', 'responsibilities', 'List the main responsibilities...'],
                    ['Qualifications', 'qualifications', 'Required education and qualifications...'],
                    ['Required Skills', 'skills', 'React, JavaScript, Node.js...']
                  ].map(([label, name, placeholder]) => (
                    <div key={name}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                      <textarea
                        name={name}
                        value={form[name]}
                        onChange={updateField}
                        placeholder={placeholder}
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-5">
                <h3 className="font-bold text-gray-800 mb-3">Publishing Status</h3>
                <select
                  name="status"
                  value={form.status}
                  onChange={updateField}
                  className="w-full md:w-1/2 rounded-xl border border-gray-200 px-4 py-3 text-sm"
                >
                  <option value="Draft">Save as Draft</option>
                  <option value="Published">Publish Immediately</option>
                </select>
              </div>

              <div className="sticky bottom-0 bg-white border-t pt-5 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center justify-center gap-2"
                >
                  <Save size={17} />
                  {editingId ? 'Save Changes' : 'Save Job'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* View Job Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedJob.title}</h2>
                <p className="text-gray-500 text-sm mt-1">{selectedJob.company}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <MapPin size={17} className="text-orange-500 mb-2" />
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-semibold text-sm">{selectedJob.location || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <BriefcaseBusiness size={17} className="text-orange-500 mb-2" />
                  <p className="text-xs text-gray-500">Job Type</p>
                  <p className="font-semibold text-sm">{selectedJob.type}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <DollarSign size={17} className="text-orange-500 mb-2" />
                  <p className="text-xs text-gray-500">Salary</p>
                  <p className="font-semibold text-sm">{selectedJob.salary || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <Users size={17} className="text-orange-500 mb-2" />
                  <p className="text-xs text-gray-500">Applications</p>
                  <p className="font-semibold text-sm">{selectedJob.applications || 0}</p>
                </div>
              </div>

              {[
                ['Job Description', selectedJob.description],
                ['Responsibilities', selectedJob.responsibilities],
                ['Qualifications', selectedJob.qualifications],
                ['Required Skills', selectedJob.skills]
              ].map(([heading, content]) => (
                <div key={heading}>
                  <h3 className="font-bold text-gray-800 mb-2">{heading}</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{content || 'Not specified'}</p>
                </div>
              ))}
            </div>

            <div className="p-5 border-t flex justify-end gap-3">
              <button onClick={() => { openEditForm(selectedJob); setSelectedJob(null) }} className="px-4 py-2.5 bg-orange-500 text-white rounded-xl font-semibold">
                Edit Job
              </button>
              <button onClick={() => setSelectedJob(null)} className="px-4 py-2.5 border rounded-xl font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
