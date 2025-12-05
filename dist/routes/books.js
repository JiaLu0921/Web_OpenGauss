import { Router } from 'express';
import { pool } from '../db';
export const booksRouter = Router();
booksRouter.get('/', async (req, res) => {
    const { q, category, page = '1', pageSize = '20' } = req.query;
    const p = Math.max(parseInt(page, 10) || 1, 1);
    const ps = Math.min(Math.max(parseInt(pageSize, 10) || 20, 1), 100);
    const offset = (p - 1) * ps;
    const params = [];
    const where = [];
    if (q && q.trim()) {
        params.push(`%${q.trim()}%`);
        where.push('(b.title ILIKE $' + params.length + ' OR a.name ILIKE $' + params.length + ')');
    }
    if (category && category.trim()) {
        params.push(category.trim());
        where.push('c.name = $' + params.length);
    }
    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
    try {
        const sql = `
      SELECT b.id,b.title,b.isbn,b.year,a.name AS author,c.name AS category
      FROM books b
      LEFT JOIN authors a ON b.author_id=a.id
      LEFT JOIN categories c ON b.category_id=c.id
      ${whereSql}
      ORDER BY b.id DESC
      LIMIT ${ps} OFFSET ${offset}
    `;
        const { rows } = await pool.query(sql, params);
        res.json(rows);
    }
    catch (e) {
        console.error('Books query error', e);
        res.status(503).json({ error: 'database unavailable' });
    }
});
