import pg from 'pg'

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'gaussdb',
  password: process.env.DB_PASSWORD || 'Secretpassword@123',
  database: process.env.DB_DATABASE || 'postgres',
  ssl: false
})

async function test() {
  try {
    console.log('检查表结构...')
    
    // 检查 loans 表
    const loansCheck = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'loans'
    `)
    console.log('loans 表存在:', loansCheck.rows.length > 0)

    // 检查 loans 记录
    const loans = await pool.query('SELECT COUNT(*) FROM loans')
    console.log('loans 表中的记录数:', loans.rows[0].count)

    // 检查 books 记录
    const books = await pool.query('SELECT COUNT(*) FROM books')
    console.log('books 表中的记录数:', books.rows[0].count)

    // 检查作者
    const authors = await pool.query('SELECT COUNT(*) FROM authors')
    console.log('authors 表中的记录数:', authors.rows[0].count)

    // 获取前 3 本书
    const booksData = await pool.query('SELECT id, title, author_id FROM books LIMIT 3')
    console.log('\n前 3 本书:')
    console.log(booksData.rows)

    // 测试 API 返回的 SQL
    const apiResult = await pool.query(`
      SELECT l.id,l.book_id,l.borrower,l.loan_date,l.return_date,b.title
      FROM loans l LEFT JOIN books b ON l.book_id=b.id ORDER BY l.id DESC
    `)
    console.log('\nAPI SQL 查询结果:', apiResult.rows)

  } catch (e) {
    console.error('错误:', e)
  } finally {
    await pool.end()
  }
}

test()
