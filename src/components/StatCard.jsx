import React from 'react'
export default function StatCard({ icon: Icon, value, label, tone = 'orange', note }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={20}/></div><div><strong>{value}</strong><span>{label}</span>{note && <small>{note}</small>}</div></article>
}
