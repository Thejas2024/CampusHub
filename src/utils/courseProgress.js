export const COURSE_PROGRESS_STORAGE_KEY = 'campushub-course-progress'
export const COURSE_PROGRESS_EVENT = 'campushub-course-progress-updated'

export function readCourseProgress() {
  const savedProgress = localStorage.getItem(COURSE_PROGRESS_STORAGE_KEY)
  if (!savedProgress) return {}

  const records = JSON.parse(savedProgress)
  if (!records || typeof records !== 'object' || Array.isArray(records)) {
    throw new Error('Saved course progress has an invalid format.')
  }

  return records
}

export function saveCourseProgress(courseId, updates) {
  const records = readCourseProgress()
  const key = String(courseId)
  const nextRecord = { ...(records[key] || {}), ...updates }
  const nextRecords = { ...records, [key]: nextRecord }

  localStorage.setItem(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(nextRecords))
  window.dispatchEvent(new Event(COURSE_PROGRESS_EVENT))

  return nextRecords
}

export function mergeWatchedRanges(ranges, nextRange) {
  const validRanges = [...(Array.isArray(ranges) ? ranges : []), nextRange]
    .filter((range) =>
      Array.isArray(range) &&
      Number.isFinite(range[0]) &&
      Number.isFinite(range[1]) &&
      range[1] > range[0]
    )
    .map(([start, end]) => [Math.max(0, start), Math.max(0, end)])
    .sort((left, right) => left[0] - right[0])

  return validRanges.reduce((merged, range) => {
    const previous = merged[merged.length - 1]
    if (previous && range[0] <= previous[1] + 0.25) {
      previous[1] = Math.max(previous[1], range[1])
    } else {
      merged.push([...range])
    }
    return merged
  }, [])
}

export function getWatchedSeconds(ranges = []) {
  return ranges.reduce((total, [start, end]) => total + Math.max(0, end - start), 0)
}

export function getCourseProgressPercent(record = {}) {
  if (record.completed) return 100
  if (!record.duration || record.duration <= 0) return 0

  return Math.min(99, Math.floor(
    (getWatchedSeconds(record.watchedRanges) / record.duration) * 100
  ))
}

export function formatVideoTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0))
  const minutes = Math.floor(safeSeconds / 60)
  const remainingSeconds = safeSeconds % 60
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}
