import { Router } from 'express'
import { pool } from '../db'

export const tasksRouter = Router()

tasksRouter.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tasks ORDER BY id DESC')
    res.json(rows)
  } catch (e) {
    res.status(503).json({ error: 'database unavailable' })
  }
})

tasksRouter.post('/', async (req, res) => {
  const { title, description, status } = req.body || {}
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title is required' })
  }
  const s = typeof status === 'string' ? status : 'todo'
  try {
    const { rows } = await pool.query(
      'INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *',
      [title, description ?? null, s]
    )
    res.status(201).json(rows[0])
  } catch (e) {
    res.status(503).json({ error: 'database unavailable' })
  }
})

tasksRouter.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  const { title, description, status } = req.body || {}
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid id' })
  try {
    const { rows } = await pool.query(
      'UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), status = COALESCE($3, status) WHERE id = $4 RETURNING *',
      [title ?? null, description ?? null, status ?? null, id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'not found' })
    res.json(rows[0])
  } catch (e) {
    res.status(503).json({ error: 'database unavailable' })
  }
})

tasksRouter.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid id' })
  try {
    const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [id])
    if (rowCount === 0) return res.status(404).json({ error: 'not found' })
    res.status(204).send()
  } catch (e) {
    res.status(503).json({ error: 'database unavailable' })
  }
})
