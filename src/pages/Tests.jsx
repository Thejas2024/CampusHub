import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  LockKeyhole,
  Play,
} from 'lucide-react'
import SectionHeading from '../components/SectionHeading.jsx'
import { courses } from '../data/demoData.js'
import { courseExams } from '../data/courseExams.js'
import {
  COURSE_PROGRESS_EVENT,
  getCourseProgressPercent,
  readCourseProgress,
} from '../utils/courseProgress.js'
import {
  COURSE_ASSESSMENT_RESULTS_EVENT,
  getAssessmentGrade,
  readCourseAssessmentResults,
} from '../utils/courseAssessmentResults.js'

export default function Tests() {
  const navigate = useNavigate()
  const [courseProgress, setCourseProgress] = useState({})
  const [results, setResults] = useState({})
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const refreshData = () => {
      try {
        setCourseProgress(readCourseProgress())
        setResults(readCourseAssessmentResults())
        setLoadError('')
      } catch {
        setLoadError('Unable to load saved course progress or assessment results in this browser.')
      }
    }

    refreshData()
    window.addEventListener('storage', refreshData)
    window.addEventListener(COURSE_PROGRESS_EVENT, refreshData)
    window.addEventListener(COURSE_ASSESSMENT_RESULTS_EVENT, refreshData)
    return () => {
      window.removeEventListener('storage', refreshData)
      window.removeEventListener(COURSE_PROGRESS_EVENT, refreshData)
      window.removeEventListener(COURSE_ASSESSMENT_RESULTS_EVENT, refreshData)
    }
  }, [])

  const assessments = courses.map((course) => {
    const exam = courseExams[course.id]
    const progress = getCourseProgressPercent(courseProgress[String(course.id)] || {})
    const latestResult = results[String(course.id)]?.latest

    return { course, exam, progress, latestResult }
  }).filter(({ exam }) => exam)

  const summary = useMemo(() => {
    const completedAttempts = Object.values(results)
      .map((result) => result.latest)
      .filter(Boolean)
    const averageScore = completedAttempts.length
      ? Math.round(
        completedAttempts.reduce((total, result) => total + result.percentage, 0) /
        completedAttempts.length
      )
      : 0

    return {
      completed: completedAttempts.length,
      averageScore,
      available: assessments.filter(({ progress }) => progress >= 50).length,
    }
  }, [assessments, results])

  return (
    <div className="inner-page">
      <SectionHeading
        eyebrow="PRACTICE MAKES PROGRESS"
        title="Tests & Assessments"
        description="Take a course assessment after watching at least half of its video."
      />

      <div className="test-summary">
        <div>
          <span className="test-summary-icon"><FileCheck2 /></span>
          <div><strong>{summary.completed}</strong><small>Courses assessed</small></div>
        </div>
        <div>
          <span className="test-summary-icon green"><CheckCircle2 /></span>
          <div><strong>{summary.averageScore}%</strong><small>Average latest score</small></div>
        </div>
        <div>
          <span className="test-summary-icon blue"><Clock3 /></span>
          <div><strong>{summary.available}</strong><small>Tests unlocked</small></div>
        </div>
      </div>

      {loadError && <p role="alert" className="prototype-caption">{loadError}</p>}

      <div className="test-list">
        {assessments.map(({ course, exam, progress, latestResult }) => {
          const unlocked = progress >= 50 && !loadError
          const grade = latestResult
            ? getAssessmentGrade(latestResult.percentage)
            : null

          return (
            <article className="test-card" key={course.id}>
              <div className="test-card-icon">
                <FileCheck2 size={22} />
              </div>
              <div className="test-card-main">
                <h3>{exam.title}</h3>
                <p>{course.description}</p>
                <div className="test-meta">
                  <span><FileCheck2 size={13} />{exam.questions.length} questions</span>
                  <span><Clock3 size={13} />{exam.durationMinutes} min</span>
                  <span>{progress}% course watched</span>
                </div>
                {latestResult && (
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    Latest score: {latestResult.score}/{latestResult.total} ({latestResult.percentage}%)
                    {' · '}{grade}
                  </p>
                )}
              </div>
              <div className="test-card-action">
                <span className={unlocked ? 'available-tag' : 'coming-tag'}>
                  {latestResult
                    ? `${grade} · ${latestResult.percentage}%`
                    : unlocked
                      ? 'Available now'
                      : `Unlock at 50% · ${progress}%`}
                </span>
                <button
                  disabled={!unlocked}
                  className="orange-small"
                  onClick={() => navigate(`/exam?course=${course.id}`)}
                >
                  {unlocked
                    ? <>{latestResult ? 'Retake test' : 'Start test'} <Play size={13} /></>
                    : <><LockKeyhole size={13} /> Locked</>}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
