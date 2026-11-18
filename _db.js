import { neon } from '@neondatabase/serverless'

export const sql = neon(process.env.DATABASE_URL)

export function fail(res, status, error) {
  res.status(status).json({ error })
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
