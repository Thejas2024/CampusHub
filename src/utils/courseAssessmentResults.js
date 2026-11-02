export const COURSE_ASSESSMENT_RESULTS_KEY = 'campushub-course-assessment-results'
export const COURSE_ASSESSMENT_RESULTS_EVENT = 'campushub-course-assessment-results-updated'

export function getAssessmentGrade(percentage) {
  if (percentage >= 85) return 'Excellent'
  if (percentage >= 70) return 'Good'
  if (percentage >= 50) return 'Average'
  return 'Medium'
}

export function readCourseAssessmentResults() {
  const savedResults = localStorage.getItem(COURSE_ASSESSMENT_RESULTS_KEY)
  if (!savedResults) return {}

  const results = JSON.parse(savedResults)
  if (!results || typeof results !== 'object' || Array.isArray(results)) {
    throw new Error('Saved assessment results have an invalid format.')
  }

  return results
}

export function saveCourseAssessmentResult(courseId, result) {
  const results = readCourseAssessmentResults()
  const previousAttempts = results[String(courseId)]?.attempts || []
  const nextResults = {
    ...results,
    [String(courseId)]: {
      latest: result,
      attempts: [result, ...previousAttempts].slice(0, 20),
    },
  }

  localStorage.setItem(COURSE_ASSESSMENT_RESULTS_KEY, JSON.stringify(nextResults))
  window.dispatchEvent(new Event(COURSE_ASSESSMENT_RESULTS_EVENT))
  return nextResults
}
