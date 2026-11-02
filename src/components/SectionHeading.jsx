import React from 'react'
export default function SectionHeading({ eyebrow, title, description, action, onAction }) {
  return <div className="section-heading">
    <div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{description && <p>{description}</p>}</div>
    {action && <button className="text-link" onClick={onAction}>{action} <span>→</span></button>}
  </div>
}
