import pg from 'pg'

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'gaussdb',
  password: process.env.DB_PASSWORD || 'Secretpassword@123',
  database: process.env.DB_DATABASE || 'postgres',
  ssl: false
})

async function fixLoansTable() {
  try {
    console.log('创建 loans 表...')
    
    // 先检查是否存在
    const check = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'loans'
      )
    `)
    
    if (check.rows[0].exists) {
      console.log('✓ loans 表已存在')
    } else {
      await pool.query(`
        CREATE TABLE loans (
          id SERIAL PRIMARY KEY,
          book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
          borrower VARCHAR(200) NOT NULL,
          loan_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          return_date TIMESTAMPTZ
        )
      `)
      console.log('✓ loans 表创建成功')
    }

    // 验证
    const verify = await pool.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'loans'
    `)
    console.log('✓ 验证完成，loans 表存在')

  } catch (e) {
    console.error('❌ 错误:', e.message)
  } finally {
    await pool.end()
  }
}

fixLoansTable()
