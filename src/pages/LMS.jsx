import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Search } from 'lucide-react'
import SectionHeading from '../components/SectionHeading.jsx'
import CourseCard from '../components/CourseCard.jsx'
import { courses } from '../data/demoData.js'
import { downloadCourseCertificate, createCourseCertificate } from '../utils/courseCertificate.js'
import {
  COURSE_PROGRESS_EVENT,
  formatVideoTime,
  getCourseProgressPercent,
  getWatchedSeconds,
  readCourseProgress,
} from '../utils/courseProgress.js'

export default function LMS() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All courses')
  const [courseProgress, setCourseProgress] = useState({})
  const [progressError, setProgressError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const refreshProgress = () => {
      try {
        setCourseProgress(readCourseProgress())
        setProgressError('')
      } catch {
        setProgressError('Unable to read saved course progress from this browser.')
      }
    }

    refreshProgress()
    window.addEventListener('storage', refreshProgress)
    window.addEventListener(COURSE_PROGRESS_EVENT, refreshProgress)
    return () => {
      window.removeEventListener('storage', refreshProgress)
      window.removeEventListener(COURSE_PROGRESS_EVENT, refreshProgress)
    }
  }, [])

  const coursesWithProgress = courses.map((course) => {
    const record = courseProgress[String(course.id)] || {}
    const progress = getCourseProgressPercent(record)
    const duration = Number(record.duration) || 0
    const watched = Math.min(duration, getWatchedSeconds(record.watchedRanges))

    return {
      ...course,
      progress,
      progressLabel: duration
        ? `${formatVideoTime(watched)} / ${formatVideoTime(duration)} watched`
        : 'Video progress',
      certificate: record.certificate,
    }
  })

  const filtered = coursesWithProgress.filter((course) =>
    course.title.toLowerCase().includes(query.toLowerCase()) &&
    (filter === 'All courses' ||
      (filter === 'In progress'
        ? course.progress > 0 && course.progress < 100
        : course.progress === 100))
  )

  const downloadCertificate = (course) => {
    try {
      const { certificate } = course
      const pdf = createCourseCertificate({
        learnerName: certificate.learnerName,
        courseTitle: course.title,
        completedAt: certificate.completedAt,
        certificateId: certificate.id,
      })
      downloadCourseCertificate(pdf, course.title)
      setProgressError('')
    } catch {
      setProgressError('Unable to create the course certificate. Please try again.')
    }
  }

  return (
    <div className="inner-page">
      <SectionHeading
        eyebrow="LEARNING MANAGEMENT SYSTEM"
        title="Learning Hub"
        description="Continue your courses, watch classes, and track your progress."
      />
      <div className="lms-welcome">
        <div>
          <span className="eyebrow">YOUR LEARNING SPACE</span>
          <h2>Make today a learning day.</h2>
          <p>Build real skills one focused lesson at a time.</p>
        </div>
        <div className="lms-welcome-art">
          <div><BookOpen size={48} /></div>
        </div>
      </div>
      <div className="lms-toolbar">
        <div className="career-search">
          <Search size={16} />
          <input
            placeholder="Search your courses..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="filter-pills">
          {['All courses', 'In progress', 'Completed'].map((option) => (
            <button
              key={option}
              className={filter === option ? 'selected' : ''}
              onClick={() => setFilter(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      {progressError && <p role="alert" className="prototype-caption">{progressError}</p>}
      <div className="lms-course-grid">
        {filtered.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onContinue={() => navigate(`/LearnLms?course=${course.id}`)}
            onDownloadCertificate={
              course.certificate ? () => downloadCertificate(course) : undefined
            }
          />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">No courses match those filters.</div>
      )}
    </div>
  )
}
