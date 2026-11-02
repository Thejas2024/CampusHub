const path = require('path')
const bcrypt = require('bcryptjs')

require('dotenv').config({ path: path.join(__dirname, '.env') })

const db = require('./db')

async function createAdmin() {
  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  const placeholderPasswords = new Set([
    'replace-with-a-strong-unique-password',
    'yourstrongadminpassword123!',
  ])

  if (
    !username ||
    !/^[a-z0-9_]{3,30}$/.test(username) ||
    !password ||
    password.length < 12 ||
    password.length > 128 ||
    placeholderPasswords.has(password.toLowerCase())
  ) {
    throw new Error(
      'Set a valid ADMIN_USERNAME and a 12–128 character ADMIN_PASSWORD in src/server/.env.'
    )
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(30) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `)

  const passwordHash = await bcrypt.hash(password, 12)

  await db.execute(
    `INSERT INTO admin_users (username, password_hash)
     VALUES (?, ?)`,
    [username, passwordHash]
  )

  console.log(`Admin account created: ${username}`)
}

createAdmin()
  .catch((error) => {
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('That admin username already exists.')
    } else {
      console.error('Unable to create admin:', error.message)
    }

    process.exitCode = 1
  })
  .finally(async () => {
    await db.end()
  })