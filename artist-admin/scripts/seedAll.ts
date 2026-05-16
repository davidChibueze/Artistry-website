import './loadEnv'
import { getPayload } from 'payload'

import config from '../src/payload.config'
import { seed } from './seed'
import { seedEmailTemplates } from './seedEmailTemplates'
import { seedFromPoshbugati } from './seedFromPoshbugati'

async function main() {
  const payload = await getPayload({ config })

  console.log('▶ Step 1/3 — base seed (admin user + demo content)')
  await seed(payload)

  console.log('\n▶ Step 2/3 — pulling content from poshbugati.com')
  await seedFromPoshbugati(payload)

  console.log('\n▶ Step 3/3 — email templates')
  await seedEmailTemplates(payload)

  console.log('\n✅ All seeds complete.')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('seed:all failed:', error)
    process.exit(1)
  })
