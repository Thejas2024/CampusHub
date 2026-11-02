import React from 'react'
import { ArrowUpRight, Bookmark, MapPin, BriefcaseBusiness } from 'lucide-react'
export default function JobCard({ job, saved = false, onSave, onViewDetails }) {
  const skills = Array.isArray(job.skills) ? job.skills : []

  return <article className="job-card">
    <div className="job-card-top"><div className={`company-logo ${job.tone}`}>❯<b>D</b></div><small>{job.posted}</small></div>
    <h3>{job.title}</h3><div className="company-name">Company <strong>{job.company}</strong></div>
    <div className="salary-line">Salary Package <strong>{job.salary}</strong></div>
    <div className="skills-line">Technology Stacks<div>{skills.map(skill => <span key={skill}>{skill}</span>)}</div></div>
    <div className="job-actions"><button className={`save-job ${saved ? 'saved' : ''}`} onClick={onSave} aria-label="Save job"><Bookmark size={15} fill={saved ? 'currentColor' : 'none'}/></button><button className="mini-orange" onClick={onViewDetails}>View details <ArrowUpRight size={13}/></button></div>
  </article>
}
