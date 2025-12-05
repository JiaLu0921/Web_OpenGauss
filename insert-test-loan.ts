import pg from 'pg'

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'gaussdb',
  password: process.env.DB_PASSWORD || 'Secretpassword@123',
  database: process.env.DB_DATABASE || 'postgres',
  ssl: false
})

async function insertTestLoan() {
  try {
    console.log('插入测试借阅记录...')
    
    // 获取第一本书
    const book = await pool.query('SELECT id FROM books LIMIT 1')
    if (book.rows.length === 0) {
      console.log('❌ 没有书籍')
      return
    }

    const bookId = book.rows[0].id
    console.log(`使用书籍 ID: ${bookId}`)

    // 插入借阅记录
    const result = await pool.query(
      'INSERT INTO loans(book_id, borrower) VALUES($1, $2) RETURNING id, book_id, borrower, loan_date',
      [bookId, '张三']
    )

    console.log('✓ 插入成功:')
    console.log(result.rows[0])

    // 验证可以查询
    const verify = await pool.query(`
      SELECT l.id,l.book_id,l.borrower,l.loan_date,l.return_date,b.title
      FROM loans l LEFT JOIN books b ON l.book_id=b.id ORDER BY l.id DESC
    `)
    console.log('\n✓ 验证查询结果:')
    console.log(verify.rows)

  } catch (e: any) {
    console.error('❌ 错误:', e.message)
  } finally {
    await pool.end()
  }
}

insertTestLoan()
