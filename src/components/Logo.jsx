import React from 'react'
import { Link } from 'react-router-dom'

export default function Logo({ light = false, to = '/' }) {
  return (
    <Link
      to={to}
      className={`brand ${light ? 'brand-light' : ''}`}
      aria-label="CampusHub home"
    >
      <img src="/tejtech-logo.png" alt="TejTech logo" />
      <span>
        Campus<span>Hub</span>
        <small>STUDENT CAREER PORTAL</small>
      </span>
    </Link>
  )
}
