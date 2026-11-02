
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  SlidersHorizontal,
  Filter,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react'

import SectionHeading from '../components/SectionHeading.jsx'
import JobCard from '../components/JobCard.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const filterOptions = {
  Qualification: [
    'B.E.', 'B.Tech', 'BCA', 'MCA', 'M.E.',
    'M.Tech', 'B.Sc.', 'M.Sc.', 'Diploma', 'Any Degree'
  ],
  Stream: [
    'Computer Science Engineering',
    'Information Science Engineering',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Artificial Intelligence and Machine Learning',
    'Data Science',
    'Other'
  ],
  Stacks: [
    'Java', 'Spring Boot', 'React.js', 'JavaScript',
    'Python', 'Node.js', 'SQL', 'HTML and CSS',
    'Full Stack Development', '.NET', 'Cloud Computing',
    'Data Analytics'
  ],
  Percentage: [
    '60% and above', '65% and above', '70% and above',
    '75% and above', '80% and above', '85% and above',
    '90% and above'
  ],
  'Year Of Passing': [
    '2024', '2025', '2026', '2027', '2028', 'Other'
  ],
  'Academic Gap': [
    'No gap', '1 year', '2 years', '3 years', 'More than 3 years'
  ],
  Backlogs: [
    'No active backlogs',
    '1 active backlog',
    '2 active backlogs',
    '3 or more active backlogs',
    'No backlogs ever'
  ]
}

const createEmptyFilters = () =>
  Object.fromEntries(
    Object.keys(filterOptions).map(key => [key, []])
  )

function AdvancedFilter({
  draftFilters,
  setDraftFilters,
  onApply,
  onReset
}) {
  const [expanded, setExpanded] = useState({})

  const toggleOption = (category, option) => {
    setDraftFilters(previous => {
      const selected = previous[category] || []

      if (category === 'Percentage') {
        return {
          ...previous,
          [category]: selected.includes(option) ? [] : [option]
        }
      }

      return {
        ...previous,
        [category]: selected.includes(option)
          ? selected.filter(item => item !== option)
          : [...selected, option]
      }
    })
  }

  return (
    <aside className="w-full rounded-2xl border border-slate-100 bg-white p-4 shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-orange-600">
          Advance Filter
        </h3>
        <Filter size={19} className="text-orange-500" />
      </div>

      <div>
        {Object.entries(filterOptions).map(([category, options]) => {
          const isOpen = Boolean(expanded[category])
          const selected = draftFilters[category] || []

          return (
            <div key={category} className="border-b border-slate-200">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() =>
                  setExpanded(previous => ({
                    ...previous,
                    [category]: !previous[category]
                  }))
                }
                className="flex min-h-11 w-full items-center justify-between gap-3 py-3 text-left text-[13px] text-slate-800 transition hover:text-orange-600"
              >
                <span>{category}</span>
                {isOpen
                  ? <ChevronUp size={17} />
                  : <ChevronDown size={17} />}
              </button>

              {isOpen && (
                <div className="flex max-h-56 flex-col gap-3 overflow-y-auto pb-4 pt-1">
                  {options.map(option => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-slate-600 hover:text-orange-600"
                    >
                      <input
                        type={category === 'Percentage' ? 'radio' : 'checkbox'}
                        name={`filter-${category}`}
                        checked={selected.includes(option)}
                        onChange={() => toggleOption(category, option)}
                        className="mt-1 h-3.5 w-3.5 shrink-0 accent-orange-500"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition hover:text-orange-600"
        >
          Reset
        </button>

      </div>
    </aside>
  )
}

export default function Careers() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')
  const [saved, setSaved] = useState([])

  const [draftFilters, setDraftFilters] = useState(createEmptyFilters)
  const [activeFilters, setActiveFilters] = useState(createEmptyFilters)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadJobs() {
      try {
        setLoadError('')
        const response = await fetch(`${API_URL}/api/jobs`, {
          signal: controller.signal,
        })
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.message || 'Unable to load job openings.')
        }
        setJobs(result)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setLoadError(
            error instanceof TypeError
              ? 'Cannot connect to the jobs service. Check that the backend is running.'
              : error.message
          )
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadJobs()
    return () => controller.abort()
  }, [])

  const resetFilters = () => {
    setDraftFilters(createEmptyFilters())
    setActiveFilters(createEmptyFilters())
  }

  const filtered = useMemo(() => {
    return jobs.filter(job => {
      const searchableText = [
        job.title,
        job.company,
        ...(job.skills || [])
      ].filter(Boolean).join(' ').toLowerCase()

      if (!searchableText.includes(query.toLowerCase())) return false
      if (type !== 'All' && job.type !== type) return false

      const data = job.eligibility || job

      const aliases = {
        Qualification: ['qualifications', 'qualification'],
        Stream: ['streams', 'stream'],
        Stacks: ['stacks', 'skills'],
        Percentage: ['minimumPercentage', 'percentage', 'minPercentage'],
        'Year Of Passing': ['passingYears', 'yearOfPassing', 'graduationYear'],
        'Academic Gap': ['academicGaps', 'academicGap'],
        Backlogs: ['backlogs', 'backlogStatus']
      }

      return Object.entries(activeFilters).every(([category, selected]) => {
        if (!selected.length) return true

        const values = aliases[category]
          .flatMap(key => {
            const value = data[key]
            return Array.isArray(value)
              ? value
              : value !== undefined && value !== null
                ? [value]
                : []
          })
          .map(String)

        // Missing eligibility data should not exclude demo listings.
        if (!values.length) return true

        if (category === 'Percentage') {
          const threshold = Number(selected[0].match(/\d+/)?.[0] || 0)
          const actual = values
            .map(value => value.match(/\d+(\.\d+)?/)?.[0])
            .find(value => value !== undefined)

          return actual !== undefined && Number(actual) >= threshold
        }

        if (category === 'Stacks') {
          return selected.some(option =>
            values.some(value =>
              value.toLowerCase().includes(option.toLowerCase())
            )
          )
        }

        return selected.some(option =>
          values.some(value =>
            value.toLowerCase() === option.toLowerCase()
          )
        )
      })
    })
  }, [query, type, activeFilters])

  const filterPanel = (
    <AdvancedFilter
      draftFilters={draftFilters}
      setDraftFilters={setDraftFilters}
      onApply={() => {
        setActiveFilters(
          Object.fromEntries(
            Object.entries(draftFilters).map(([key, values]) => [
              key,
              [...values]
            ])
          )
        )
        setMobileFilterOpen(false)
      }}
      onReset={resetFilters}
    />
  )

  return (
    <div className="inner-page">
      <SectionHeading
        eyebrow="YOUR NEXT OPPORTUNITY"
        title="Career Opportunities"
        description="Browse opportunities and find a role that matches your skills."
      />

      {/* Mobile filter button */}
      <div className="mb-4 mt-5 md:hidden">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-orange-500 px-4 py-2.5 text-sm font-medium text-orange-600 transition hover:bg-orange-50"
        >
          <SlidersHorizontal size={17} />
          Advanced Filters
        </button>
      </div>

      {/* Responsive mobile filter drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileFilterOpen(false)}
            className="absolute inset-0 h-full w-full bg-slate-900/50"
          />

          <div className="absolute inset-y-0 left-0 w-[min(88%,340px)] overflow-y-auto bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">
                Advanced Filters
              </h3>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setMobileFilterOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            {filterPanel}
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 items-start gap-6 md:grid-cols-[250px_minmax(0,1fr)] lg:grid-cols-[285px_minmax(0,1fr)] lg:gap-7">
        {/* Desktop advanced filters */}
        <div className="hidden md:block">
          {filterPanel}
        </div>

        {/* Job listings */}
        <main className="min-w-0">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-slate-400 focus-within:border-orange-400">
              <Search size={17} className="shrink-0" />
              <input
                type="search"
                placeholder="Search job titles, skills or companies..."
                value={query}
                onChange={event => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {['All', 'Full-time', 'Internship'].map(option => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setType(option)}
                  className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition ${
                    type === option
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="my-5 flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="font-semibold text-slate-800">
              {filtered.length} opportunities
            </p>
            <span className="text-xs text-slate-400">
              Published job openings
            </span>
          </div>

          {loadError && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {loadError}
            </p>
          )}

          {loading ? (
            <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Loading job openings...
            </p>
          ) : !loadError && <div className="dashboard-job-grid careers-list">
            {filtered.map(job => (
              <JobCard
                key={job.id}
                job={job}
                saved={saved.includes(job.id)}
                onSave={() =>
                  setSaved(previous =>
                    previous.includes(job.id)
                      ? previous.filter(id => id !== job.id)
                      : [...previous, job.id]
                  )
                }
                onViewDetails={() =>
                  navigate(`/careers/${job.id}`)
                }
              />
            ))}
          </div>}

          {!loading && !loadError && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 px-5 py-12 text-center">
              <Search size={30} className="text-slate-400" />
              <h3 className="font-semibold text-slate-800">
                No opportunities found
              </h3>
              <p className="text-sm text-slate-500">
                Try changing your search or adjusting your filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setType('All')
                  resetFilters()
                }}
                className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-700"
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
