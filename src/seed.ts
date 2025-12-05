import { ensureSchema, seedIfEmpty } from './db'

async function run() {
  try {
    await ensureSchema()
    await seedIfEmpty()
    console.log('Seed completed')
    process.exit(0)
  } catch (e) {
    console.error('Seed failed', e)
    process.exit(1)
  }
}

run()
