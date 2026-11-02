import React from 'react'
import { CalendarDays, CheckCircle2, Clock3, FileText } from 'lucide-react'
import SectionHeading from '../components/SectionHeading.jsx'
import StatCard from '../components/StatCard.jsx'
import { initialApplications } from '../data/demoData.js'
export default function Applications(){
 return <div className="inner-page"><SectionHeading eyebrow="YOUR CAREER JOURNEY" title="My Applications" description="Track your progress from application to interview."/><div className="stats-grid dashboard-stats"><StatCard icon={FileText} value="12" label="Total applications" tone="orange"/><StatCard icon={Clock3} value="4" label="Under review" tone="blue"/><StatCard icon={CalendarDays} value="2" label="Interviews scheduled" tone="green"/><StatCard icon={CheckCircle2} value="1" label="Shortlisted" tone="purple"/></div><div className="application-table-wrap"><div className="table-heading"><h3>Application tracker</h3><span>Sample records</span></div><table className="application-table"><thead><tr><th>Company / role</th><th>Date applied</th><th>Status</th><th>Action</th></tr></thead><tbody>{initialApplications.map((a,i)=><tr key={a.id}><td><div className="table-role"><span className={`table-logo tone-${i}`}>{a.company[0]}</span><div><strong>{a.company}</strong><small>{a.role}</small></div></div></td><td>{a.date}</td><td><span className={`status status-${i}`}>{a.status}</span></td><td><button className="table-action" onClick={()=>alert(`Prototype details for ${a.company}`)}>View details →</button></td></tr>)}</tbody></table></div></div>
}
