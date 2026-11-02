
import React, { useState } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesColumn,
  ChevronDown,
  ClipboardList,
  Home,
  Menu,
  Moon,
  Sun,
  X,
  FileCheck2,
  Users,
  LogOut,
  Code2,
} from 'lucide-react'

import Logo from '../Logo.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'

const nav = [
  { to: '/portal', label: 'Home', icon: Home, end: true },
  { to: '/portal/careers', label: 'Careers', icon: BriefcaseBusiness },
  { to: '/portal/applications', label: 'Applications', icon: ClipboardList },
  { to: '/portal/performance', label: 'Performance', icon: ChartNoAxesColumn },
  { to: '/portal/code-practice', label: 'Code Practice', icon: Code2 },
  { to: '/portal/tests', label: 'Tests', icon: FileCheck2 },
  { to: '/portal/classes', label: 'Complementary Classes', icon: CalendarDays },
  { to: '/portal/mentorship', label: 'Mentorship', icon: Users },
]

export default function PortalLayout() {
  const [mobile, setMobile] = useState(false)
  const [notice, setNotice] = useState(false)

  const { dark, toggleTheme } = useTheme()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // Get the logged-in username
  const username = localStorage.getItem('campushub-username') || 'Student'

  // Generate avatar initials from username
  const initials = username
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  const current =
    nav.find((item) =>
      item.end
        ? pathname === item.to
        : pathname === item.to || pathname.startsWith(`${item.to}/`)
    )?.label ||
    (pathname.startsWith('/portal/lms')
      ? 'Learning LMS'
      : pathname.startsWith('/portal/profile')
        ? 'Profile'
        : 'Student Portal')

  const closeMobileMenu = () => setMobile(false)

  // Log out the current user
  const handleLogout = () => {
    localStorage.removeItem('campushub-token')
    localStorage.removeItem('campushub-username')
    setNotice(false)
    closeMobileMenu()
    navigate('/login', { replace: true })
  }

  return (
    <div className="portal-shell">
      {/* Header */}
      <header className="portal-topbar">
        <button
          type="button"
          className="portal-mobile-toggle"
          onClick={() => setMobile((prev) => !prev)}
          aria-label={mobile ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobile}
        >
          {mobile ? <X size={22} /> : <Menu size={22} />}
        </button>

       <div className="portal-logo">
         <Logo to="/portal" />
      </div>

        {/* Navigation */}
        <nav
          className={`portal-topnav ${mobile ? 'portal-topnav-open' : ''}`}
        >
          {nav.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `topnav-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}

          <NavLink
            to="/portal/lms"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `topnav-link ${isActive ? 'active' : ''}`
            }
          >
            <BookOpen size={16} />
            <span>Learning LMS</span>
          </NavLink>
        </nav>

        {/* Header actions */}
        <div className="portal-top-actions">
          <button
            type="button"
            className="portal-icon-button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle dark/light theme"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="notice-wrapper">
            <button
              type="button"
              className="portal-icon-button notice-button"
              onClick={() => setNotice((prev) => !prev)}
              aria-label="Notifications"
              aria-expanded={notice}
            >
              <Bell size={18} />
              <i />
            </button>

            {notice && (
              <div className="notice-popover">
                <strong>Notifications</strong>
                <p>Your learning dashboard is up to date.</p>
                <small>No new alerts</small>
              </div>
            )}
          </div>

          {/* Logged-in username */}
          <Link
            to="/portal/profile"
            className="user-mini"
            onClick={closeMobileMenu}
            title="View profile"
          >
            <span className="user-avatar">{initials || 'S'}</span>
            <b>{username}</b>
            <ChevronDown size={14} />
          </Link>

          {/* Logout button */}
          <button
            type="button"
            className="portal-icon-button logout-button"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="portal-main portal-main-full">
        <div className="portal-breadcrumb">
          <Link to="/AdminLogin">CampusHub</Link>
          <b>/</b>
          <span>{current}</span>

          <span className="breadcrumb-spacer" />

          <span className="demo-tag">explore</span>
        </div>

        {/* Child pages render here */}
        <Outlet />
      </main>
    </div>
  )
}
