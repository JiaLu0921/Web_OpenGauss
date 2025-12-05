async function fetchBooks() {
  const list = document.getElementById('books')
  list.innerHTML = ''
  const q = document.getElementById('q').value
  const cat = document.getElementById('cat').value
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (cat) params.set('category', cat)
  try {
    const res = await fetch('/api/books?' + params.toString())
    const data = await res.json()
    if (!Array.isArray(data)) {
      const li = document.createElement('li')
      li.textContent = '数据库未就绪或不可用，请稍后重试'
      list.appendChild(li)
      return
    }
    for (const b of data) {
      const li = document.createElement('li')
      li.innerHTML = `<div><strong>${b.title}</strong> — <span class="meta">${b.author || ''}</span> / <span class="meta">${b.category || ''}</span><br/><span class="meta">${b.isbn || ''} ${b.year || ''}</span></div>`
      const borrow = document.createElement('button')
      borrow.textContent = '借阅'
      borrow.onclick = async () => {
        const who = prompt('借阅者姓名')
        if (!who) return
        await fetch('/api/loans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ book_id: b.id, borrower: who })
        })
        fetchLoans()
      }
      li.appendChild(borrow)
      list.appendChild(li)
    }
  } catch {
    const li = document.createElement('li')
    li.textContent = '无法加载书籍列表'
    list.appendChild(li)
  }
}

async function fetchLoans() {
  const list = document.getElementById('loans')
  list.innerHTML = ''
  try {
    const res = await fetch('/api/loans')
    const data = await res.json()
    if (!Array.isArray(data)) {
      const li = document.createElement('li')
      li.textContent = '数据库未就绪或不可用，请稍后重试'
      list.appendChild(li)
      return
    }
    for (const l of data) {
      const li = document.createElement('li')
      li.innerHTML = `<div><strong>${l.title}</strong> — <span class="meta">${l.borrower}</span> <span class="meta">${new Date(l.loan_date).toLocaleString()}</span> ${l.return_date ? '已归还' : '未归还'}</div>`
      if (!l.return_date) {
        const ret = document.createElement('button')
        ret.textContent = '归还'
        ret.onclick = async () => { await fetch(`/api/loans/${l.id}/return`, { method: 'POST' }); fetchLoans() }
        li.appendChild(ret)
      }
      list.appendChild(li)
    }
  } catch {
    const li = document.createElement('li')
    li.textContent = '无法加载借阅记录'
    list.appendChild(li)
  }
}

document.getElementById('search').addEventListener('click', () => fetchBooks())

fetchBooks()
fetchLoans()
