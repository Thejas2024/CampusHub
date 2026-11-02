import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value !== 'string' || !value.trim()) return []
  return value.split(/[\n;]/).map((item) => item.trim()).filter(Boolean)
}

export default function JobDetails() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isApplicationPage = pathname.endsWith('/apply')
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    education: '',
    graduationYear: '',
    skills: '',
    resume: '',
    coverLetter: ''
  })

  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadJob() {
      try {
        setLoadError('')
        const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
          signal: controller.signal,
        })
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.message || 'Unable to load job details.')
        }
        setJob(result)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setLoadError(
            requestError instanceof TypeError
              ? 'Cannot connect to the jobs service. Check that the backend is running.'
              : requestError.message
          )
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadJob()
    return () => controller.abort()
  }, [jobId])

  const updateField = event => {
    setForm(previous => ({
      ...previous,
      [event.target.name]: event.target.value
    }))
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await fetch(
        `${API_URL}/api/jobs/${job.id}/applications`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      )
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Unable to submit your application.')
      }

      setSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? 'Cannot connect to the application service. Please try again.'
          : requestError.message
      )
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500'

  if (loading) {
    return <p className="p-8 text-center text-slate-500">Loading job details...</p>
  }

  if (!job) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12">
        <p role="alert" className="text-red-600">
          {loadError || 'Job not found.'}
        </p>
        <button onClick={() => navigate('/careers')} className="mt-4 text-orange-600">
          Back to Careers
        </button>
      </main>
    )
  }

  if (!isApplicationPage) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12">
        <button
          onClick={() => navigate('/careers')}
          className="mb-5 text-sm text-orange-600"
        >
          Back to Careers
        </button>

        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <div>
            <p className="text-sm text-orange-600">{job.company}</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              {job.title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {[job.location, job.type, job.experience]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>

          {job.salary && (
            <p className="font-semibold text-slate-800">Salary: {job.salary}</p>
          )}
          {(job.vacancies || job.deadline || job.applications !== undefined) && (
            <p className="text-sm text-slate-500">
              {[
                job.vacancies ? `${job.vacancies} vacancies` : '',
                job.deadline
                  ? `Apply by ${new Date(job.deadline).toLocaleDateString()}`
                  : '',
                `Applications: ${job.applications || 0}`,
              ].filter(Boolean).join(' · ')}
            </p>
          )}

          {job.description && (
            <div>
              <h2 className="font-semibold text-slate-800">About the role</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {job.description}
              </p>
            </div>
          )}

          {[
            ['Responsibilities', job.responsibilities],
            ['Skills', job.skills],
            ['Qualifications', job.qualifications]
          ].map(([heading, value]) => {
            const items = asList(value)
            return items.length > 0 && (
            <div key={heading}>
              <h2 className="font-semibold text-slate-800">{heading}</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600">
                {items.map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>
            )
          })}

          <button
            onClick={() => navigate(`/careers/${job.id}/apply`)}
            className="rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
          >
            Apply for this role
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <button
        onClick={() => navigate(`/careers/${job.id}`)}
        className="mb-5 text-sm text-orange-600"
      >
        ← Back to Job Details
      </button>

      {success ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-green-700">
            Application submitted successfully!
          </h1>

          <p className="mt-3 text-slate-600">
            Your application for {job.title} has been
            submitted successfully.
          </p>

          <button
            onClick={() => navigate('/careers')}
            className="mt-6 rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white"
          >
            Back to Careers
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 md:p-8"
        >
          <h1 className="text-2xl font-bold">
            Apply for {job.title}
          </h1>

          <p className="text-sm text-slate-500">
            {job.company} · {job.location}
          </p>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Full Name *
            </label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={updateField}
              required
              className={inputClass}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              required
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={updateField}
              required
              pattern="[0-9]{10}"
              title="Enter a 10-digit phone number"
              className={inputClass}
              placeholder="10-digit mobile number"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Highest Qualification *
            </label>
            <input
              name="education"
              value={form.education}
              onChange={updateField}
              required
              className={inputClass}
              placeholder="e.g. B.E. Computer Science"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Graduation Year *
            </label>
            <input
              type="number"
              name="graduationYear"
              value={form.graduationYear}
              onChange={updateField}
              min="1980"
              max="2100"
              required
              className={inputClass}
              placeholder="e.g. 2027"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Technical Skills *
            </label>
            <textarea
              name="skills"
              value={form.skills}
              onChange={updateField}
              required
              rows={3}
              className={inputClass}
              placeholder="Java, SQL, Spring Boot..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Resume URL
            </label>
            <input
              type="url"
              name="resume"
              value={form.resume}
              onChange={updateField}
              className={inputClass}
              placeholder="Link to your resume"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Cover Letter
            </label>
            <textarea
              name="coverLetter"
              value={form.coverLetter}
              onChange={updateField}
              rows={4}
              className={inputClass}
              placeholder="Tell us why you're suitable for this role..."
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      )}
    </main>
  )
}