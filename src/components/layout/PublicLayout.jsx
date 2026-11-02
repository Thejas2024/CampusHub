import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import {
  GraduationCap,
  Menu,
  X,
} from 'lucide-react';

import Logo from '../Logo.jsx';

export default function PublicLayout() {
  const [open, setOpen] = useState(false);

  const { pathname } = useLocation();

  if (pathname === '/login') {
    return <Outlet />;
  }

  return (
    <>
      <header className="public-nav">
        <Logo />

        <button
          className="mobile-menu"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>

        <nav className={open ? 'nav-open' : ''}>
          <a
            href="#home"
            onClick={() => setOpen(false)}
          >
            Home
          </a>

          <a
            href="#about"
            onClick={() => setOpen(false)}
          >
            About
          </a>

          <a
            href="#courses"
            onClick={() => setOpen(false)}
          >
            Courses
          </a>

          <a
            href="#placements"
            onClick={() => setOpen(false)}
          >
            Placements
          </a>

          <a
            href="#contact"
            onClick={() => setOpen(false)}
          >
            Contact
          </a>

          <Link
            className="nav-outline"
            to="/AdminLogin"
            onClick={() => setOpen(false)}
          >
            <GraduationCap size={15} />
            Admin Login
          </Link>

          <Link
            className="nav-solid"
            to="/login"
            onClick={() => setOpen(false)}
          >
            <GraduationCap size={15} />
            Campus Login
          </Link>
        </nav>
      </header>

      <Outlet />
    </>
  );
}