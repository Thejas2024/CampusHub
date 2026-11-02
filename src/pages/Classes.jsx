import React, { useState } from 'react'
import { CalendarDays, Clock3, ExternalLink, Video } from 'lucide-react'
import SectionHeading from '../components/SectionHeading.jsx'

const events = [
  {
    date: '03',
    month: 'NOV',
    title: 'Technical Interview: Coding Practice',
    type: 'Placement preparation',
    time: '10:30 AM – 11:15 AM',
    mode: 'Online',
    videoId: 'XKu_SEDAykw',
  },
  {
    date: '04',
    month: 'NOV',
    title: 'Behavioral Interview & STAR Method',
    type: 'Interview skills',
    time: '3:00 PM – 3:45 PM',
    mode: 'Online',
    videoId: 'HGOBQPFzWKo',
  },
  {
    date: '05',
    month: 'NOV',
    title: 'Resume Building for Freshers',
    type: 'Career preparation',
    time: '11:00 AM – 11:45 AM',
    mode: 'Online',
    videoId: 'Tt08KmFfIYQ',
  },
  {
    date: '06',
    month: 'NOV',
    title: 'Aptitude & Logical Reasoning',
    type: 'Assessment preparation',
    time: '2:00 PM – 2:45 PM',
    mode: 'Online',
    videoId: '0jKf2C4W7u8',
  },
  {
    date: '09',
    month: 'NOV',
    title: 'Group Discussion Skills',
    type: 'Communication skills',
    time: '10:00 AM – 10:45 AM',
    mode: 'Online',
    videoId: '3X6hnKSBG0Y',
  },
  {
    date: '10',
    month: 'NOV',
    title: 'HR Interview Questions & Answers',
    type: 'Interview skills',
    time: '3:00 PM – 3:45 PM',
    mode: 'Online',
    videoId: '1mHjMNZZvFo',
  },
  {
    date: '11',
    month: 'NOV',
    title: 'LinkedIn & Job Search Strategy',
    type: 'Career preparation',
    time: '11:00 AM – 11:45 AM',
    mode: 'Online',
    videoId: 'zd4ALKv8Das',
  },
  {
    date: '12',
    month: 'NOV',
    title: 'JavaScript Coding Interview',
    type: 'Technical preparation',
    time: '2:30 PM – 3:15 PM',
    mode: 'Online',
    videoId: 'fW8amMCVAJQ',
  },
]

export default function Classes() {
  const [expandedEvent, setExpandedEvent] = useState(null)

  return (
    <div className="inner-page">
      <SectionHeading
        eyebrow="PLAN YOUR WEEK"
        title="Complementary Classes"
        description="Practice interview skills, aptitude, and technical topics with placement-preparation videos."
      />
      <div className="schedule-list">
        {events.map((event) => {
          const isExpanded = expandedEvent === event.title
          const videoUrl = `https://www.youtube.com/watch?v=${event.videoId}`

          return (
            <article className="schedule-card" key={event.title}>
              <div className="schedule-date">
                <strong>{event.date}</strong>
                <span>{event.month}</span>
              </div>
              <div className="schedule-card-info">
                <span className="event-type">{event.type}</span>
                <h3>{event.title}</h3>
                <div className="event-meta">
                  <span><Clock3 size={14} />{event.time}</span>
                  <span><Video size={14} />{event.mode}</span>
                </div>
                {isExpanded && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ aspectRatio: '16 / 9', background: '#0f172a', borderRadius: 12, overflow: 'hidden' }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${event.videoId}`}
                        title={event.title}
                        style={{ width: '100%', height: '100%', border: 0 }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="outline-small"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10 }}
                    >
                      Watch on YouTube <ExternalLink size={13} />
                    </a>
                  </div>
                )}
              </div>
              <button
                className="outline-small"
                aria-expanded={isExpanded}
                onClick={() => setExpandedEvent(isExpanded ? null : event.title)}
              >
                {isExpanded ? 'Hide details' : 'View details'} →
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}
