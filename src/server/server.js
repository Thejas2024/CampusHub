
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const db = require('./db')
const codingTestCases = require('./codingTestCases.json')

const app = express()

const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  'http://localhost:5173,http://127.0.0.1:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.includes(origin))
    },
  })
)

app.use(express.json({ limit: '24kb' }))

const judgeLanguageIds = {
  cpp: 54,
  java: 62,
  javascript: 63,
  python: 71,
}
const codeRunLimits = new Map()
const CODE_RUNS_PER_MINUTE = 20
const MAX_SOURCE_CODE_LENGTH = 8000

function allowCodeRun(req, res, next) {
  const now = Date.now()
  const address = req.ip || req.socket.remoteAddress || 'unknown'
  if (codeRunLimits.size > 10_000) {
    for (const [ip, record] of codeRunLimits) {
      if (record.resetAt <= now) codeRunLimits.delete(ip)
    }
  }
  const current = codeRunLimits.get(address)
  const window = current && current.resetAt > now
    ? current
    : { count: 0, resetAt: now + 60_000 }

  if (window.count >= CODE_RUNS_PER_MINUTE) {
    return res.status(429).json({
      message: 'Too many code runs. Try again in a minute.',
    })
  }

  window.count += 1
  codeRunLimits.set(address, window)
  return next()
}

app.get('/api/code/health', (_req, res) => {
  return res.json({
    configured: Boolean(process.env.JUDGE0_API_URL),
  })
})

app.post('/api/code/run', allowCodeRun, async (req, res) => {
  const { challengeId, language, sourceCode, mode } = req.body || {}
  const tests = codingTestCases[challengeId]

  if (!process.env.JUDGE0_API_URL) {
    return res.status(503).json({
      message: 'Code runner is not configured. Set JUDGE0_API_URL in src/server/.env.',
    })
  }

  if (
    typeof challengeId !== 'string' ||
    !Object.prototype.hasOwnProperty.call(codingTestCases, challengeId) ||
    !Object.prototype.hasOwnProperty.call(judgeLanguageIds, language) ||
    typeof sourceCode !== 'string' ||
    !sourceCode.trim() ||
    sourceCode.length > MAX_SOURCE_CODE_LENGTH ||
    !['run', 'submit'].includes(mode)
  ) {
    return res.status(400).json({ message: 'Invalid code execution request.' })
  }

  const selectedTests = mode === 'run' ? tests.slice(0, 2) : tests
  const apiBase = process.env.JUDGE0_API_URL.replace(/\/+$/, '')
  const rapidApiHeaders = {}
  if (process.env.JUDGE0_API_KEY) {
    rapidApiHeaders['X-RapidAPI-Key'] = process.env.JUDGE0_API_KEY
  }
  if (process.env.JUDGE0_API_HOST) {
    rapidApiHeaders['X-RapidAPI-Host'] = process.env.JUDGE0_API_HOST
  }

  const judgeFetch = async (url, options = {}) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20_000)
    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...rapidApiHeaders,
          ...(options.headers || {}),
          'Content-Type': 'application/json',
        },
      })
    } finally {
      clearTimeout(timeout)
    }
  }

  try {
    const submitResponse = await judgeFetch(
      `${apiBase}/submissions/batch?base64_encoded=false&wait=false`,
      {
        method: 'POST',
        body: JSON.stringify({
          submissions: selectedTests.map((test) => ({
            language_id: judgeLanguageIds[language],
            source_code: sourceCode,
            stdin: test.input,
            expected_output: test.expected,
          })),
        }),
      }
    )

    if (!submitResponse.ok) {
      console.error('Judge0 submission failed:', submitResponse.status)
      return res.status(502).json({
        message: 'The code runner could not accept this submission.',
      })
    }

    const submissions = await submitResponse.json()
    const tokens = submissions.map((submission) => submission.token).filter(Boolean)
    if (tokens.length !== selectedTests.length) {
      console.error('Judge0 returned an unexpected batch response.')
      return res.status(502).json({ message: 'The code runner returned an invalid response.' })
    }

    const deadline = Date.now() + 30_000
    let completedSubmissions = []
    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 750))
      const pollResponse = await judgeFetch(
        `${apiBase}/submissions/batch?tokens=${encodeURIComponent(tokens.join(','))}&base64_encoded=false`
      )

      if (!pollResponse.ok) {
        console.error('Judge0 polling failed:', pollResponse.status)
        return res.status(502).json({ message: 'Unable to retrieve code execution results.' })
      }

      const pollData = await pollResponse.json()
      completedSubmissions = pollData.submissions || []
      if (
        completedSubmissions.length === tokens.length &&
        completedSubmissions.every((submission) => submission.status?.id > 2)
      ) {
        break
      }
    }

    if (
      completedSubmissions.length !== tokens.length ||
      completedSubmissions.some((submission) => submission.status?.id <= 2)
    ) {
      return res.status(504).json({ message: 'Code execution timed out. Please try again.' })
    }

    const results = completedSubmissions.map((submission, index) => {
      const status = submission.status?.description || 'Unknown'
      const actualOutput = (submission.stdout || '').trim().replace(/\r\n/g, '\n')
      const expectedOutput = selectedTests[index].expected.trim().replace(/\r\n/g, '\n')
      const passed = status === 'Accepted' && actualOutput === expectedOutput

      return {
        passed,
        status: passed ? 'Accepted' : status,
        output: (submission.stdout || submission.compile_output || submission.stderr || '').slice(0, 2000),
        time: submission.time || null,
        memory: submission.memory || null,
      }
    })

    return res.json({
      results,
      passed: results.filter((result) => result.passed).length,
      total: results.length,
      allPassed: results.every((result) => result.passed),
    })
  } catch (error) {
    console.error('Code execution error:', error.name, error.message)
    return res.status(502).json({
      message: error.name === 'AbortError'
        ? 'The code runner request timed out.'
        : 'Unable to connect to the code runner.',
    })
  }
})

function authenticateAdmin(req, res, next) {
  const authorization = req.headers.authorization || ''
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice(7)
    : ''

  if (!token) {
    return res.status(401).json({ message: 'Admin authentication required.' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    if (payload.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' })
    }

    req.admin = payload
    return next()
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired admin token.' })
  }
}

// Validate username and password
function validateCredentials(username, password, registering = false) {
  if (
    typeof username !== 'string' ||
    !/^[a-zA-Z0-9_]{3,30}$/.test(username.trim()) ||
    typeof password !== 'string' ||
    password.length < (registering ? 6 : 1) ||
    password.length > 128
  ) {
    return false
  }

  return true
}

function normalizeJob(row) {
  return {
    ...row,
    type: row.job_type,
    posted: row.created_at
      ? new Date(row.created_at).toLocaleDateString()
      : 'Recently',
    tone: Number(row.id) % 2 === 0 ? 'red' : 'orange',
    skills: typeof row.skills === 'string'
      ? row.skills.split(/[,\n]/).map((skill) => skill.trim()).filter(Boolean)
      : [],
  }
}

function normalizeAdminJob(row) {
  return {
    ...row,
    type: row.job_type,
    createdAt: row.created_at,
    deadline: row.deadline instanceof Date
      ? [
          row.deadline.getFullYear(),
          String(row.deadline.getMonth() + 1).padStart(2, '0'),
          String(row.deadline.getDate()).padStart(2, '0'),
        ].join('-')
      : row.deadline,
  }
}

function validJob(job) {
  return (
    typeof job.title === 'string' &&
    job.title.trim().length > 0 &&
    job.title.length <= 150 &&
    typeof job.company === 'string' &&
    job.company.trim().length > 0 &&
    job.company.length <= 150 &&
    ['Full-time', 'Part-time', 'Internship', 'Contract'].includes(job.type) &&
    ['Draft', 'Published'].includes(job.status) &&
    Number.isInteger(Number(job.vacancies)) &&
    Number(job.vacancies) >= 1 &&
    (!job.location || (typeof job.location === 'string' && job.location.length <= 150)) &&
    (!job.salary || (typeof job.salary === 'string' && job.salary.length <= 100)) &&
    (!job.experience || (typeof job.experience === 'string' && job.experience.length <= 100)) &&
    ['skills', 'description', 'responsibilities', 'qualifications'].every(
      (field) => !job[field] || typeof job[field] === 'string'
    ) &&
    (!job.deadline || (
      typeof job.deadline === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(job.deadline)
    ))
  )
}

function jobValues(job) {
  return [
    job.title.trim(),
    job.company.trim(),
    job.type,
    job.location || null,
    job.salary || null,
    job.experience || null,
    Number(job.vacancies),
    job.skills || null,
    job.description || null,
    job.responsibilities || null,
    job.qualifications || null,
    job.deadline || null,
    job.status,
  ]
}

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    await db.query('SELECT 1')

    res.json({
      status: 'ok',
      database: 'connected',
    })
  } catch (error) {
    console.error('Health check database error:', error.message)

    res.status(503).json({
      status: 'error',
      database: 'unavailable',
    })
  }
})

app.get('/api/jobs', async (_req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM job_openings
       WHERE status = 'Published'
       ORDER BY created_at DESC`
    )

    return res.json(rows.map(normalizeJob))
  } catch (error) {
    console.error('Job listing error:', error.message)
    return res.status(500).json({ message: 'Unable to load job openings.' })
  }
})

app.get('/api/jobs/:jobId', async (req, res) => {
  const jobId = Number(req.params.jobId)
  if (!Number.isSafeInteger(jobId) || jobId < 1) {
    return res.status(400).json({ message: 'Invalid job id.' })
  }

  try {
    const [rows] = await db.execute(
      `SELECT * FROM job_openings
       WHERE id = ? AND status = 'Published'
       LIMIT 1`,
      [jobId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Job opening not found.' })
    }

    return res.json(normalizeJob(rows[0]))
  } catch (error) {
    console.error('Job details error:', error.message)
    return res.status(500).json({ message: 'Unable to load job details.' })
  }
})

app.post('/api/jobs/:jobId/applications', async (req, res) => {
  const jobId = Number(req.params.jobId)
  const application = req.body || {}

  if (!Number.isSafeInteger(jobId) || jobId < 1) {
    return res.status(400).json({ message: 'Invalid job id.' })
  }

  const requiredFields = ['fullName', 'email', 'phone', 'education', 'skills']
  if (
    requiredFields.some(
      (field) =>
        typeof application[field] !== 'string' ||
        !application[field].trim()
    ) ||
    application.fullName.length > 200 ||
    application.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(application.email) ||
    !/^\d{10}$/.test(application.phone) ||
    application.education.length > 200 ||
    !/^\d{4}$/.test(String(application.graduationYear)) ||
    Number(application.graduationYear) < 1980 ||
    Number(application.graduationYear) > 2100 ||
    (application.resume && (
      typeof application.resume !== 'string' || application.resume.length > 2048
    )) ||
    (application.coverLetter && typeof application.coverLetter !== 'string')
  ) {
    return res.status(400).json({ message: 'Please enter valid application details.' })
  }

  let connection
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        full_name VARCHAR(200) NOT NULL,
        email VARCHAR(254) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        education VARCHAR(200) NOT NULL,
        graduation_year SMALLINT UNSIGNED NOT NULL,
        skills TEXT NOT NULL,
        resume_url VARCHAR(2048),
        cover_letter TEXT,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_job_applications_job_id (job_id),
        CONSTRAINT fk_job_applications_job
          FOREIGN KEY (job_id) REFERENCES job_openings(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB
    `)

    connection = await db.getConnection()
    await connection.beginTransaction()

    const [jobs] = await connection.execute(
      `SELECT id FROM job_openings
       WHERE id = ? AND status = 'Published'
       FOR UPDATE`,
      [jobId]
    )
    if (jobs.length === 0) {
      await connection.rollback()
      return res.status(404).json({ message: 'This job is no longer accepting applications.' })
    }

    await connection.execute(
      `INSERT INTO job_applications
        (job_id, full_name, email, phone, education, graduation_year, skills, resume_url, cover_letter)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        jobId,
        application.fullName.trim(),
        application.email.trim(),
        application.phone.trim(),
        application.education.trim(),
        Number(application.graduationYear),
        application.skills.trim(),
        application.resume?.trim() || null,
        application.coverLetter?.trim() || null,
      ]
    )

    await connection.execute(
      `UPDATE job_openings
       SET applications = applications + 1
       WHERE id = ?`,
      [jobId]
    )

    await connection.commit()
    return res.status(201).json({ message: 'Application submitted successfully.' })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('Application submission error:', error.message)
    return res.status(500).json({ message: 'Unable to submit your application.' })
  } finally {
    if (connection) connection.release()
  }
})

// Register a new user using username and password
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body || {}
  const normalizedUsername =
    typeof username === 'string' ? username.trim().toLowerCase() : ''

  if (!validateCredentials(normalizedUsername, password, true)) {
    return res.status(400).json({
      message:
        'Username must contain 3–30 letters, numbers, or underscores. Password must be 6–128 characters.',
    })
  }

  try {
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE username = ? LIMIT 1',
      [normalizedUsername]
    )

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: 'This username is already taken. Please choose another.',
      })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await db.execute(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [normalizedUsername, passwordHash]
    )

    return res.status(201).json({
      message: 'Account created successfully.',
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'This username is already taken. Please choose another.',
      })
    }

    console.error('Registration error:', error.message)

    return res.status(500).json({
      message: 'Unable to create account. Please try again.',
    })
  }
})

// Login using username and password
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body || {}
    const normalizedUsername =
      typeof username === 'string' ? username.trim().toLowerCase() : ''

    if (!validateCredentials(normalizedUsername, password)) {
      return res.status(400).json({
        message: 'Enter a valid username and password.',
      })
    }

    const [users] = await db.execute(
      `SELECT id, name, username, password_hash
       FROM users
       WHERE username = ?
       LIMIT 1`,
      [normalizedUsername]
    )

    if (users.length === 0) {
      return res.status(401).json({
        message: 'Invalid username or password.',
      })
    }

    const user = users[0]

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    )

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid username or password.',
      })
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured.')
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
      },
    })
  } catch (error) {
    console.error('Login error:', error.message)

    return res.status(500).json({
      message: 'Server error. Please try again.',
    })
  }
})

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body || {}
  const normalizedUsername =
    typeof username === 'string' ? username.trim().toLowerCase() : ''

  if (!validateCredentials(normalizedUsername, password)) {
    return res.status(400).json({
      message: 'Enter a valid admin username and password.',
    })
  }

  try {
    const [admins] = await db.execute(
      `SELECT id, username, password_hash
       FROM admin_users
       WHERE username = ?
       LIMIT 1`,
      [normalizedUsername]
    )

    if (admins.length === 0) {
      return res.status(401).json({ message: 'Invalid admin credentials.' })
    }

    const admin = admins[0]
    const passwordMatches = await bcrypt.compare(password, admin.password_hash)

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid admin credentials.' })
    }

    const token = jwt.sign(
      { id: admin.id, role: 'admin', username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    return res.json({
      message: 'Admin login successful.',
      token,
      admin: { id: admin.id, username: admin.username },
    })
  } catch (error) {
    console.error('Admin login error:', error.message)

    return res.status(500).json({
      message: 'Unable to authenticate admin. Please try again.',
    })
  }
})

app.get('/api/admin/jobs', authenticateAdmin, async (_req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM job_openings ORDER BY created_at DESC'
    )
    return res.json(rows.map(normalizeAdminJob))
  } catch (error) {
    console.error('Admin job listing error:', error.message)
    return res.status(500).json({ message: 'Unable to load job openings.' })
  }
})

app.post('/api/admin/jobs', authenticateAdmin, async (req, res) => {
  const job = req.body || {}
  if (!validJob(job)) {
    return res.status(400).json({ message: 'Enter valid job information.' })
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO job_openings
        (title, company, job_type, location, salary, experience, vacancies,
         skills, description, responsibilities, qualifications, deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      jobValues(job)
    )
    const [rows] = await db.execute(
      'SELECT * FROM job_openings WHERE id = ?',
      [result.insertId]
    )
    return res.status(201).json({ job: normalizeAdminJob(rows[0]) })
  } catch (error) {
    console.error('Admin job creation error:', error.message)
    return res.status(500).json({ message: 'Unable to create the job opening.' })
  }
})

app.put('/api/admin/jobs/:jobId', authenticateAdmin, async (req, res) => {
  const jobId = Number(req.params.jobId)
  const job = req.body || {}
  if (!Number.isSafeInteger(jobId) || jobId < 1 || !validJob(job)) {
    return res.status(400).json({ message: 'Enter valid job information.' })
  }

  try {
    const [result] = await db.execute(
      `UPDATE job_openings
       SET title = ?, company = ?, job_type = ?, location = ?, salary = ?,
           experience = ?, vacancies = ?, skills = ?, description = ?,
           responsibilities = ?, qualifications = ?, deadline = ?, status = ?
       WHERE id = ?`,
      [...jobValues(job), jobId]
    )
    const [rows] = await db.execute(
      'SELECT * FROM job_openings WHERE id = ?',
      [jobId]
    )
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Job opening not found.' })
    }
    return res.json({ job: normalizeAdminJob(rows[0]) })
  } catch (error) {
    console.error('Admin job update error:', error.message)
    return res.status(500).json({ message: 'Unable to update the job opening.' })
  }
})

app.delete('/api/admin/jobs/:jobId', authenticateAdmin, async (req, res) => {
  const jobId = Number(req.params.jobId)
  if (!Number.isSafeInteger(jobId) || jobId < 1) {
    return res.status(400).json({ message: 'Invalid job id.' })
  }

  try {
    const [result] = await db.execute(
      'DELETE FROM job_openings WHERE id = ?',
      [jobId]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Job opening not found.' })
    }
    return res.status(204).end()
  } catch (error) {
    console.error('Admin job deletion error:', error.message)
    return res.status(500).json({ message: 'Unable to delete the job opening.' })
  }
})

app.get('/api/admin/dashboard', authenticateAdmin, (_req, res) => {
  return res.json({
    stats: {
      totalStudents: 0,
      totalJobs: 0,
      totalCourses: 0,
      totalApplications: 0,
    },
    activities: [],
  })
})

const PORT = Number(process.env.PORT) || 5000

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in the backend environment.')
}

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
