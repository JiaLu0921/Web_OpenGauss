import { Router } from 'express';
import { pool } from '../db';
export const loansRouter = Router();
loansRouter.get('/', async (_req, res) => {
    try {
        const { rows } = await pool.query(`SELECT l.id,l.book_id,l.borrower,l.loan_date,l.return_date,b.title
       FROM loans l LEFT JOIN books b ON l.book_id=b.id ORDER BY l.id DESC`);
        res.json(rows);
    }
    catch (e) {
        console.error('Loans list error', e);
        res.status(503).json({ error: 'database unavailable' });
    }
});
loansRouter.post('/', async (req, res) => {
    const { book_id, borrower } = req.body || {};
    if (!book_id || !borrower)
        return res.status(400).json({ error: 'book_id and borrower required' });
    try {
        const { rows } = await pool.query('INSERT INTO loans(book_id, borrower) VALUES($1,$2) RETURNING *', [book_id, borrower]);
        res.status(201).json(rows[0]);
    }
    catch (e) {
        console.error('Loans create error', e);
        res.status(503).json({ error: 'database unavailable' });
    }
});
loansRouter.post('/:id/return', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id))
        return res.status(400).json({ error: 'invalid id' });
    try {
        const { rows } = await pool.query('UPDATE loans SET return_date = CURRENT_TIMESTAMP WHERE id=$1 AND return_date IS NULL RETURNING *', [id]);
        if (rows.length === 0)
            return res.status(404).json({ error: 'not found or already returned' });
        res.json(rows[0]);
    }
    catch (e) {
        console.error('Loans return error', e);
        res.status(503).json({ error: 'database unavailable' });
    }
});
