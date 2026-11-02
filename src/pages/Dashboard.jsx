
import React, { useState } from 'react'
import {
  Activity,
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  Clock3,
  FileCheck2,
  GraduationCap,
  Rocket,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading.jsx'
import StatCard from '../components/StatCard.jsx'
import JobCard from '../components/JobCard.jsx'
import CourseCard from '../components/CourseCard.jsx'
import { jobs, courses } from '../data/demoData.js'

export default function Dashboard() {
  const navigate = useNavigate()
  const [saved, setSaved] = useState([])

  const username = localStorage.getItem('campushub-username')

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <div>
          <div className="eyebrow">STUDENT DASHBOARD</div>

          <h1>Welcome back, {username || 'Student'}!</h1>

          <p>
            Here's what's happening with your learning and career journey.
          </p>
        </div>

        <div className="learning-hours">
          <Clock3 size={19} />
          <div>
            <small>HOURS IN DCL</small>
            <strong>123h 13m</strong>
          </div>
        </div>
      </div>

      <section className="dashboard-section">
        <SectionHeading
          title="Your overview"
          description="A quick look at your progress so far."
        />
        <div className="stats-grid dashboard-stats">
          <StatCard icon={Rocket} value="12" label="Applications" tone="orange" />
          <StatCard icon={FileCheck2} value="8" label="Tests completed" tone="blue" />
          <StatCard icon={BookOpen} value="5" label="Courses enrolled" tone="green" />
          <StatCard icon={Award} value="2" label="Certificates" tone="purple" />
        </div>
      </section>

      <section className="dashboard-section">
        <SectionHeading
          title="Latest Career Opportunities"
          description="Explore roles that match your learning path."
          action="View all"
          onAction={() => (location.href = '/portal/careers')}
        />

        <div className="dashboard-job-grid">
          {jobs.slice(0, 4).map((job) => (
            <JobCard
              key={job.id}
              job={job}
              saved={saved.includes(job.id)}
              onSave={() =>
                setSaved((previous) =>
                  previous.includes(job.id)
                    ? previous.filter((id) => id !== job.id)
                    : [...previous, job.id]
                )
              }
              onViewDetails={() => navigate(`/careers/${job.id}`)}
            />
          ))}
        </div>
      </section>

      <section className="lms-banner">
        <div className="lms-banner-head">
          <div className="lms-emblem">
            <GraduationCap size={25} />
          </div>
          <span className="lms-label">
            <i /> LEARNING PORTAL
          </span>
        </div>

        <div className="lms-banner-content">
          <div>
            <h2>
              Learning Management System <span>(LMS)</span>
            </h2>
            <p>
              Continue your courses, watch classes, and track your progress.
            </p>
            <div className="lms-mini-stats">
              <span>
                <BookOpen size={14} /> 3 enrolled courses
              </span>
              <span>
                <TrendingUp size={14} /> 75% top progress
              </span>
            </div>
          </div>

          <Link to="/portal/lms" className="launch-lms">
            <Rocket size={16} /> Launch LMS <span>↗</span>
          </Link>
        </div>
      </section>

      <div className="dashboard-lower">
        <section className="dashboard-section">
          <SectionHeading
            title="Continue Learning"
            description="Pick up where you left off."
            action="All courses"
            onAction={() => (location.href = '/portal/lms')}
          />

          <div className="dashboard-course-grid">
            {courses.slice(0, 2).map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onContinue={() => (location.href = '/portal/lms')}
              />
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <SectionHeading
            title="Upcoming"
            description="Keep your schedule on track."
          />

          <div className="upcoming-card">
            <div className="upcoming-date">
              <strong>28</strong>
              <small>OCT</small>
            </div>
            <div>
              <strong>JavaScript Skill Test</strong>
              <p>
                <Clock3 size={13} /> 10:30 AM · Online
              </p>
              <small>Assessment · 45 minutes</small>
            </div>
            <Bell size={16} className="upcoming-bell" />
          </div>

          <div className="upcoming-card">
            <div className="upcoming-date pale-orange">
              <strong>30</strong>
              <small>OCT</small>
            </div>
            <div>
              <strong>Resume Review Session</strong>
              <p>
                <CalendarDays size={13} /> 3:00 PM · Online
              </p>
              <small>Mentorship · 30 minutes</small>
            </div>
            <Bell size={16} className="upcoming-bell" />
          </div>

          <Link className="all-schedule" to="/portal/classes">
            View full schedule →
          </Link>
        </section>
      </div>

      <footer className="portal-footer">
        <span>© 2026 CampusHub · Student Portal</span>
        <span>
          Learn. Build. Get placed. <span className="footer-orange">✦</span>
        </span>
      </footer>
    </div>
  )
}
