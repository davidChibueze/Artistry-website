import { config } from 'dotenv'
import { existsSync } from 'fs'
import { resolve } from 'path'

// Mirrors Next.js env-file precedence: .env.<env>.local > .env.local > .env.<env> > .env.
// Each file overrides keys from the ones loaded after it, so we load most-specific first.
const NODE_ENV = process.env.NODE_ENV || 'development'

const candidates = [
  `.env.${NODE_ENV}.local`,
  '.env.local',
  `.env.${NODE_ENV}`,
  '.env',
]

for (const file of candidates) {
  const path = resolve(process.cwd(), file)
  if (existsSync(path)) config({ path, override: false })
}
