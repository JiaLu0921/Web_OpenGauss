import pg from 'pg'
import fs from 'fs/promises'
import path from 'path'
const { Pool } = pg

const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10)
const DB_USER = process.env.DB_USER || 'gaussdb'
const DB_PASSWORD = process.env.DB_PASSWORD || 'Secretpassword@123'
const DB_DATABASE = process.env.DB_DATABASE || 'postgres'

export const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  max: 10,
  idleTimeoutMillis: 30000,
  ssl: false
})

export async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'todo',
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS authors (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title VARCHAR(300) NOT NULL,
      isbn VARCHAR(40),
      year INT,
      author_id INT REFERENCES authors(id) ON DELETE SET NULL,
      category_id INT REFERENCES categories(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS loans (
      id SERIAL PRIMARY KEY,
      book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      borrower VARCHAR(200) NOT NULL,
      loan_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      return_date TIMESTAMPTZ
    );

    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'tasks_set_updated_at'
      ) THEN
        CREATE TRIGGER tasks_set_updated_at
        BEFORE UPDATE ON tasks
        FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'books_set_updated_at'
      ) THEN
        CREATE TRIGGER books_set_updated_at
        BEFORE UPDATE ON books
        FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
      END IF;
    END
    $$;
  `)
}

export async function seedIfEmpty() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS c FROM books')
  if ((rows[0]?.c ?? 0) > 0) return
  const seedPath = path.join(process.cwd(), 'db', 'seed', 'books.json')
  try {
    const content = await fs.readFile(seedPath, 'utf8')
    const data = JSON.parse(content) as Array<{title:string,author:string,category:string,isbn?:string,year?:number}>
    const authors = new Map<string, number>()
    const categories = new Map<string, number>()
    for (const item of data) {
      let aid = authors.get(item.author)
      if (!aid) {
        try {
          const a = await pool.query('SELECT id FROM authors WHERE name = $1', [item.author])
          if (a.rows.length > 0) {
            aid = Number(a.rows[0].id)
          } else {
            const b = await pool.query('INSERT INTO authors(name) VALUES($1) RETURNING id', [item.author])
            aid = Number(b.rows[0].id)
          }
        } catch {
          const b = await pool.query('INSERT INTO authors(name) VALUES($1) RETURNING id', [item.author])
          aid = Number(b.rows[0].id)
        }
        authors.set(item.author, aid)
      }
      let cid = categories.get(item.category)
      if (!cid) {
        try {
          const c = await pool.query('SELECT id FROM categories WHERE name = $1', [item.category])
          if (c.rows.length > 0) {
            cid = Number(c.rows[0].id)
          } else {
            const d = await pool.query('INSERT INTO categories(name) VALUES($1) RETURNING id', [item.category])
            cid = Number(d.rows[0].id)
          }
        } catch {
          const d = await pool.query('INSERT INTO categories(name) VALUES($1) RETURNING id', [item.category])
          cid = Number(d.rows[0].id)
        }
        categories.set(item.category, cid)
      }
      await pool.query(
        'INSERT INTO books(title,isbn,year,author_id,category_id) VALUES($1,$2,$3,$4,$5)',
        [item.title, item.isbn ?? null, item.year ?? null, aid, cid]
      )
    }
  } catch (e) {
    console.error('Seed error', e)
  }
}

