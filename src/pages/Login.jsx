
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  UserRound,
} from 'lucide-react'

import Logo from '../components/Logo.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Login() {
  const navigate = useNavigate()

  const [registering, setRegistering] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)

    try {
      const response = await fetch(
        `${API_URL}/api/${registering ? 'register' : 'login'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || `Request failed (${response.status}).`
        )
      }

      // Registration successful
      if (registering) {
        setRegistering(false)
        setPassword('')
        setMessage('Account created. Sign in with your username.')
        return
      }

      // Verify login response
      if (!result.token) {
        throw new Error(
          'The server response did not include a sign-in token.'
        )
      }

      // Save authentication token and username
      localStorage.setItem('campushub-token', result.token)
      localStorage.setItem(
        'campushub-username',
        result.user?.username || username.trim()
      )

      // Navigate to student portal
      navigate('/portal')
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? 'Unable to reach the login server. Make sure the backend is running on port 5000.'
          : requestError.message
      )
    } finally {
      setSubmitting(false)
    }
  }

  const changeForm = () => {
    setRegistering((previous) => !previous)
    setError('')
    setMessage('')
    setPassword('')
  }

  return (
    <main className="login-page">
      <section className="login-promo">
        <Logo />

        <div className="login-promo-art" aria-hidden="true">
          <div className="promo-ring" />

          <div className="promo-circle">
            <GraduationCap size={54} />
          </div>

          <span className="promo-float promo-float-one">
            <BriefcaseBusiness size={21} />
          </span>

          <span className="promo-float promo-float-two">
            <ArrowRight size={21} />
          </span>
        </div>

        <div className="login-promo-copy">
          <h1>
            Learn today.
            <br />
            <span>Build your future.</span>
          </h1>

          <div className="orange-rule" />

          <p>
            Access your learning, career opportunities, and student resources
            in one place.
          </p>
        </div>
      </section>

      <section className="login-form-side">
        <div className="login-card">
          <div className="login-card-top" />

          <GraduationCap className="login-rocket" size={32} />

          <h2>{registering ? 'Create your account' : 'Welcome back'}</h2>

          <p>
            {registering
              ? 'Choose a username and password to get started.'
              : 'Sign in with your CampusHub username.'}
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="login-username">
              Username

              <span className="input-wrap">
                <UserRound size={16} aria-hidden="true" />

                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your username"
                  minLength={3}
                  maxLength={30}
                  pattern="[A-Za-z0-9_]+"
                  title="Use 3–30 letters, numbers, or underscores."
                  required
                />
              </span>
            </label>

            <label htmlFor="login-password">
              Password

              <span className="input-wrap">
                <LockKeyhole size={16} aria-hidden="true" />

                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={
                    registering ? 'new-password' : 'current-password'
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    registering
                      ? 'At least 6 characters'
                      : 'Enter your password'
                  }
                  minLength={registering ? 6 : undefined}
                  maxLength={128}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </span>
            </label>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            {message && (
              <p className="form-success" role="status">
                {message}
              </p>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? 'Please wait…'
                : registering
                  ? 'Create account'
                  : 'Sign in'}
            </button>
          </form>

          <div className="register-prompt">
            {registering
              ? 'Already have an account?'
              : 'New to CampusHub?'}

            <button type="button" onClick={changeForm}>
              {registering ? ' Sign in' : ' Create account'}
            </button>
          </div>

          <Link className="back-home" to="/">
            ← Back to home
          </Link>

          <small className="login-prototype-note">
            CampusHub · Student Career Portal
          </small>
        </div>
      </section>
    </main>
  )
}
