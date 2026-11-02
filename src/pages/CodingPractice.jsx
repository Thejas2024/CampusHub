import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Search,
  Zap,
} from 'lucide-react'
import SectionHeading from '../components/SectionHeading.jsx'
import { codingQuestions } from './coding.jsx'
import './CodingPractice.css'

const difficultyLevels = ['All', 'Easy', 'Medium', 'Hard']

export default function CodingPractice() {
  const [difficulty, setDifficulty] = useState('All')
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const filteredQuestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return codingQuestions.filter((question) => (
      (difficulty === 'All' || question.difficulty === difficulty) &&
      (!normalizedQuery ||
        question.title.toLowerCase().includes(normalizedQuery) ||
        question.topics.some((topic) => topic.toLowerCase().includes(normalizedQuery)))
    ))
  }, [difficulty, query])

  const counts = {
    Easy: codingQuestions.filter((question) => question.difficulty === 'Easy').length,
    Medium: codingQuestions.filter((question) => question.difficulty === 'Medium').length,
    Hard: codingQuestions.filter((question) => question.difficulty === 'Hard').length,
  }

  return (
    <div className="inner-page coding-library-page">
      <SectionHeading
        eyebrow="BUILD YOUR PROBLEM-SOLVING SKILLS"
        title="Code Practice"
        description="Choose a challenge, write a solution in your preferred language, and test it against examples."
      />

      <section className="coding-library-hero">
        <div className="coding-library-hero-icon"><Code2 size={26} /></div>
        <div>
          <span>YOUR NEXT BIG IDEA STARTS HERE</span>
          <h1>Small steps. Serious skills.</h1>
          <p>Explore {codingQuestions.length} challenges in arrays, strings, math, graphs, and more.</p>
        </div>
        <div className="coding-library-stat">
          <strong>{codingQuestions.length}</strong>
          <small>challenges</small>
        </div>
      </section>

      <div className="coding-library-summary">
        <div><span className="coding-count-dot easy-dot" /><strong>{counts.Easy}</strong><small>Easy</small></div>
        <div><span className="coding-count-dot medium-dot" /><strong>{counts.Medium}</strong><small>Medium</small></div>
        <div><span className="coding-count-dot hard-dot" /><strong>{counts.Hard}</strong><small>Hard</small></div>
      </div>

      <div className="coding-library-controls">
        <div className="coding-library-search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search challenges or topics..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="coding-library-filters" aria-label="Filter by difficulty">
          {difficultyLevels.map((level) => (
            <button
              type="button"
              key={level}
              className={difficulty === level ? 'active' : ''}
              aria-pressed={difficulty === level}
              onClick={() => setDifficulty(level)}
            >
              {level}
              {level !== 'All' && <span>{counts[level]}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="coding-question-list">
        {filteredQuestions.map((question, index) => (
          <article className="coding-question-card" key={question.id}>
            <div className="coding-question-number">
              <span>{String(index + 1).padStart(2, '0')}</span>
            </div>
            <div className="coding-question-content">
              <div className="coding-question-heading">
                <h2>{question.title}</h2>
                <span className={`coding-difficulty ${question.difficulty.toLowerCase()}`}>
                  {question.difficulty}
                </span>
              </div>
              <p>{question.description}</p>
              <div className="coding-question-tags">
                {question.topics.map((topic) => <span key={topic}>{topic}</span>)}
              </div>
            </div>
            <div className="coding-question-action">
              <span><CheckCircle2 size={13} /> {question.examples.length} examples</span>
              <button
                type="button"
                onClick={() => navigate(`/code-practice/solve?challenge=${encodeURIComponent(question.id)}`)}
              >
                Solve <ArrowRight size={14} />
              </button>
            </div>
          </article>
        ))}
        {filteredQuestions.length === 0 && (
          <div className="coding-empty-state">
            <Zap size={24} />
            <strong>No matching challenges</strong>
            <span>Try a different title, topic, or difficulty.</span>
          </div>
        )}
      </div>
    </div>
  )
}
