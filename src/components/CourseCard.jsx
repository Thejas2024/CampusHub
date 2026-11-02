import React from 'react'
import { Award, BookOpen, ChevronRight, Download } from 'lucide-react'
import './CourseCard.css'

export default function CourseCard({ course, onContinue, onDownloadCertificate }) {
  return (
    <article className="course-card">
      <div className={`course-art ${course.color}`}><BookOpen size={22} /></div>
      <span className="course-category">{course.category}</span>
      <h3>{course.title}</h3>
      <div className="course-progress-label">
        <span>{course.progressLabel || course.lessons}</span>
        <strong>{course.progress}%</strong>
      </div>
      <div className="progress-track">
        <span style={{ width: `${course.progress}%` }} />
      </div>
      <button className="course-continue" onClick={onContinue}>
        Continue learning <ChevronRight size={14} />
      </button>
      {onDownloadCertificate && (
        <button
          className="course-certificate-button"
          onClick={onDownloadCertificate}
        >
          <span className="course-certificate-icon"><Award size={17} /></span>
          <span className="course-certificate-copy">
            <strong>Certificate ready</strong>
            <small>Download your achievement</small>
          </span>
          <Download className="course-certificate-download" size={17} />
        </button>
      )}
    </article>
  )
}
