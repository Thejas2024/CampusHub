
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  AlertCircle,
  LoaderCircle,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function AdminLogin() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Admin login failed.')
      }

      if (!result.token) {
        throw new Error('The server did not return an authentication token.')
      }

      // Never reuse the student token for admin access.
      localStorage.removeItem('campushub-admin-token')
      localStorage.setItem('campushub-admin-token', result.token)

      navigate('/admin', { replace: true })
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? 'Cannot connect to the server. Please check that your backend is running.'
          : requestError.message
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
        {/* Left panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 p-10 text-white lg:flex">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/20" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full border border-white/20" />

          <Link to="/" className="relative z-10 inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
              <ShieldCheck size={28} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold">
                Campus<span className="text-orange-100">Hub</span>
              </h1>
              <p className="text-xs tracking-wider text-orange-100">
                ADMINISTRATION PORTAL
              </p>
            </div>
          </Link>

          <div className="relative z-10 py-10">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <ShieldCheck size={44} />
            </div>

            <h2 className="text-4xl font-extrabold leading-tight">
              Manage your
              <br />
              campus. Build
              <br />
              the future.
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-7 text-orange-50">
              Manage students, career opportunities, courses, and assessments
              through your CampusHub administration workspace.
            </p>
          </div>

          <p className="relative z-10 text-xs text-orange-100">
            © 2026 CampusHub · Secure Administration
          </p>
        </section>

        {/* Login form */}
        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-orange-600"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>

            <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <ShieldCheck size={30} />
            </div>

            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-orange-600">
              ADMINISTRATOR ACCESS
            </p>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Admin login
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Sign in with your authorized administrator credentials.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="admin-username"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Admin username
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100">
                  <UserRound size={18} className="shrink-0 text-slate-400" />

                  <input
                    id="admin-username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Enter admin username"
                    className="w-full bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    required
                    maxLength={30}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100">
                  <LockKeyhole
                    size={18}
                    className="shrink-0 text-slate-400"
                  />

                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    required
                    maxLength={128}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="shrink-0 text-slate-400 transition hover:text-orange-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Sign in to Admin
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <LockKeyhole
                size={18}
                className="mt-0.5 shrink-0 text-orange-600"
              />
              <p className="text-xs leading-5 text-slate-500">
                Restricted access. Only authorized administrators can access
                the management portal.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
