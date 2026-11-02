
import React, { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Settings,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  TrendingUp,
  UserPlus,
  PlusCircle,
  FileCheck2,
  RefreshCw,
  ArrowUpRight,
  Clock3,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Students', path: '/admin/students', icon: Users },
  { name: 'Jobs', path: '/admin/jobs', icon: BriefcaseBusiness },
  { name: 'Courses', path: '/admin/courses', icon: BookOpen },
  { name: 'Applications', path: '/admin/applications', icon: ClipboardList },
  { name: 'Tests', path: '/admin/tests', icon: GraduationCap },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
]

const initialStats = [
  {
    label: 'Total Students',
    key: 'totalStudents',
    icon: Users,
    color: 'bg-orange-100 text-orange-600',
    link: '/admin/students',
  },
  {
    label: 'Job Openings',
    key: 'totalJobs',
    icon: BriefcaseBusiness,
    color: 'bg-blue-100 text-blue-600',
    link: '/admin/jobs',
  },
  {
    label: 'Active Courses',
    key: 'totalCourses',
    icon: BookOpen,
    color: 'bg-green-100 text-green-600',
    link: '/admin/courses',
  },
  {
    label: 'Applications',
    key: 'totalApplications',
    icon: ClipboardList,
    color: 'bg-purple-100 text-purple-600',
    link: '/admin/applications',
  },
]

const quickActions = [
  {
    title: 'Manage Students',
    description: 'View and manage student accounts.',
    icon: Users,
    link: '/admin/students',
  },
  {
    title: 'Post a Job',
    description: 'Publish a new career opportunity.',
    icon: PlusCircle,
    link: '/admin/jobs',
  },
  {
    title: 'Add a Course',
    description: 'Create a course for students.',
    icon: BookOpen,
    link: '/admin/courses',
  },
  {
    title: 'Manage Tests',
    description: 'Create assessments and review results.',
    icon: FileCheck2,
    link: '/admin/tests',
  },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [stats, setStats] = useState({})
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isDashboard =
    location.pathname === '/admin' ||
    location.pathname === '/admin/dashboard'

  const currentPage =
    navItems.find((item) => item.path === location.pathname)?.name ||
    'Admin Management'

  useEffect(() => {
    if (!isDashboard) return

    const controller = new AbortController()

    const loadDashboard = async () => {
      const token = localStorage.getItem('campushub-admin-token')

      if (!token) {
        navigate('/admin/login', { replace: true })
        return
      }

      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_URL}/api/admin/dashboard`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          }
        )

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('campushub-admin-token')
          navigate('/admin/login', { replace: true })
          return
        }

        if (!response.ok) {
          throw new Error('Unable to load dashboard data.')
        }

        const result = await response.json()
        setStats(result.stats || {})
        setActivities(
          Array.isArray(result.activities) ? result.activities : []
        )
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Something went wrong.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => controller.abort()
  }, [navigate, isDashboard])

  const handleLogout = () => {
    localStorage.removeItem('campushub-admin-token')
    navigate('/admin/login', { replace: true })
  }

  const formatDate = (value) => {
    if (!value) return 'Recently'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return 'Recently'

    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">

        {/* Mobile overlay */}
        {mobileOpen && (
          <button
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
        >
          <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white">
                <ShieldCheck size={25} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold">
                  Campus<span className="text-orange-500">Hub</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Admin Portal
                </p>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <p className="px-7 pb-2 pt-6 text-xs font-bold tracking-widest text-slate-400">
            ADMINISTRATION
          </p>

          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
            {navItems.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-100'
                      : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon size={19} />
                {name}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-100 p-4 dark:border-slate-800">
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-orange-50 p-3 dark:bg-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                A
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  Administrator
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage CampusHub
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main area */}
        <div className="min-h-screen lg:pl-72">

          {/* Navbar */}
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
              >
                <Menu size={21} />
              </button>

              <div>
                <p className="text-xs text-slate-400">
                  CampusHub / Administration
                </p>
                <h2 className="text-lg font-bold">{currentPage}</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Toggle dark mode"
                className="rounded-xl border border-slate-200 p-2.5 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                {darkMode ? <Sun size={19} /> : <Moon size={19} />}
              </button>

              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">Administrator</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  CampusHub Admin
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                A
              </div>
            </div>
          </header>

          {/* Dashboard or child page */}
          {isDashboard ? (
            <main className="mx-auto max-w-screen-2xl space-y-8 px-4 py-7 sm:px-6 lg:px-8">

              <section className="flex flex-col justify-between gap-5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:p-8">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                    <ShieldCheck size={14} />
                    ADMIN CONTROL CENTER
                  </div>
                  <h2 className="text-2xl font-extrabold sm:text-3xl">
                    Welcome to CampusHub Admin!
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-orange-50 sm:text-base">
                    Manage students, career opportunities, courses, and
                    assessments from one place.
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-white/15 p-4">
                  <TrendingUp size={28} />
                  <div>
                    <p className="text-sm font-semibold">Platform overview</p>
                    <p className="text-xs text-orange-50">
                      Your administration workspace
                    </p>
                  </div>
                </div>
              </section>

              <section className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Dashboard Overview</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Monitor CampusHub activity and manage resources.
                  </p>
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:border-orange-300 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-900"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </section>

              {error && (
                <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle size={20} />
                  <span className="flex-1">{error}</span>
                  <button onClick={() => window.location.reload()} className="font-semibold underline">
                    Retry
                  </button>
                </div>
              )}

              {/* Click Total Students to open Students page */}
              <section>
                <h3 className="mb-4 text-base font-bold">
                  Platform Statistics
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {initialStats.map((item) => {
                    const Icon = item.icon
                    const value = stats[item.key]

                    return (
                      <Link
                        key={item.key}
                        to={item.link}
                        className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex items-start justify-between">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}>
                            <Icon size={23} />
                          </div>
                          <ArrowUpRight size={18} className="text-slate-400 group-hover:text-orange-500" />
                        </div>

                        <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">
                          {item.label}
                        </p>
                        <div className="mt-1 text-3xl font-extrabold">
                          {loading
                            ? '...'
                            : typeof value === 'number'
                              ? value.toLocaleString()
                              : '—'}
                        </div>
                        <p className="mt-2 text-xs text-slate-400">
                          {loading ? 'Loading data...' : 'View details'}
                        </p>
                      </Link>
                    )
                  })}
                </div>
              </section>

              {/* Quick actions */}
              <section>
                <h3 className="mb-4 text-base font-bold">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon

                    return (
                      <Link
                        key={action.title}
                        to={action.link}
                        className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-orange-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                          <Icon size={22} />
                        </div>
                        <div>
                          <h4 className="font-bold">{action.title}</h4>
                          <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                            {action.description}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>

              {/* Recent activity */}
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 p-5 dark:border-slate-800">
                  <h3 className="font-bold">Recent Activity</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Latest events reported by the platform.
                  </p>
                </div>

                {loading ? (
                  <p className="p-8 text-center text-sm text-slate-500">
                    Loading recent activity...
                  </p>
                ) : activities.length === 0 ? (
                  <div className="p-10 text-center">
                    <Clock3 size={28} className="mx-auto text-slate-400" />
                    <h4 className="mt-3 font-semibold">No recent activity</h4>
                    <p className="mt-1 text-sm text-slate-500">
                      Activity will appear here when your backend provides it.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activities.map((activity, index) => (
                      <div key={activity.id ?? index} className="flex items-start gap-3 px-5 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                          {activity.type === 'student' ? (
                            <UserPlus size={19} />
                          ) : activity.type === 'job' ? (
                            <BriefcaseBusiness size={19} />
                          ) : activity.type === 'course' ? (
                            <BookOpen size={19} />
                          ) : (
                            <ClipboardList size={19} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {activity.title || 'Platform activity'}
                          </p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {activity.description || ''}
                          </p>
                          <p className="mt-2 text-xs text-slate-400">
                            {formatDate(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-500 dark:border-slate-800">
                © {new Date().getFullYear()} CampusHub · Administration Portal
              </footer>
            </main>
          ) : (
            <main className="min-h-[calc(100vh-9rem)] p-4 sm:p-6 lg:p-8">
              <Outlet />
            </main>
          )}
        </div>
      </div>
    </div>
  )
}
