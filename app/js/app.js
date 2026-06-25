import { getProgress, recordAttempt, allProgress, saveDraft, loadDraft, resetAll } from './storage.js'
import { makeEditor } from './editor.js'
import { initPython, runPython } from './runner-python.js'
import { runSql } from './runner-sql.js'

// ---- data ----
let pyBank = [], sqlBank = [], mcqBank = []
let mockTimer = null

async function loadBanks() {
  const [py, sql, mcq] = await Promise.all([
    fetch('data/bank/python.json').then(r => r.json()),
    fetch('data/bank/sql.json').then(r => r.json()),
    fetch('data/bank/mcq.json').then(r => r.json()),
  ])
  pyBank = py
  sqlBank = sql
  mcqBank = mcq
}

// ---- router ----
const main = document.getElementById('main')

function route() {
  if (mockTimer) { clearInterval(mockTimer); mockTimer = null; }
  main.className = ''
  const hash = location.hash || '#/dashboard'
  document.querySelectorAll('nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === hash || (hash === '' && a.getAttribute('href') === '#/dashboard'))
  })
  const [base, sub] = hash.slice(1).split('/').filter(Boolean)
  switch (base || 'dashboard') {
    case 'dashboard': renderDashboard(); break
    case 'py': sub ? renderPySolve(sub) : renderPyList(); break
    case 'sql': sub ? renderSqlSolve(sub) : renderSqlList(); break
    case 'mcq': renderMcq(sub); break
    case 'mock': renderMock(); break
    case 'cram': renderCram(); break
    case 'cheat': renderCheat(); break
    default: renderDashboard()
  }
}

window.addEventListener('hashchange', route)

// ---- helpers ----
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function randomPick(arr) {
  if (!arr || arr.length === 0) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v
    else if (k.startsWith('on')) el[k] = v
    else el.setAttribute(k, v)
  }
  for (const c of children) {
    if (c == null) continue
    el.append(typeof c === 'string' ? document.createTextNode(c) : c)
  }
  return el
}

function difficultyBadge(d) {
  const cls = { 'very easy': 'badge-veryeasy', 'easy': 'badge-easy', 'easy-medium': 'badge-easymedium', 'medium': 'badge-medium', 'hard': 'badge-hard' }
  return h('span', { class: `badge ${cls[d] || 'badge-easy'}` }, d)
}

function renderMd(md) {
  const div = h('div', { class: 'statement' })
  div.innerHTML = marked.parse(md)
  return div
}

function sqlTable(cols, rows) {
  const wrap = h('div', { class: 'sql-table-wrap' })
  const t = h('table', { class: 'sql-table' })
  const thead = h('thead')
  const hr = h('tr')
  cols.forEach(c => hr.append(h('th', {}, c)))
  thead.append(hr)
  t.append(thead)
  const tbody = h('tbody')
  rows.forEach(row => {
    const tr = h('tr')
    row.forEach(cell => tr.append(h('td', {}, cell == null ? 'NULL' : String(cell))))
    tbody.append(tr)
  })
  t.append(tbody)
  wrap.append(t)
  return wrap
}

// ---- Python status bar ----
const pyDot = document.getElementById('py-dot')
const pyStatusEl = document.getElementById('py-status')

function setPyStatus(s) {
  pyDot.className = 'dot ' + s
  pyStatusEl.textContent = s === 'ready' ? 'Python ready' : s === 'loading' ? 'Python loading...' : 'Python error'
}

initPython(setPyStatus).catch(() => setPyStatus('error'))

// ---- DASHBOARD ----
function renderDashboard() {
  const prog = allProgress()
  const counts = {
    py: { solved: 0, attempted: 0 },
    sql: { solved: 0, attempted: 0 },
    mcq: { solved: 0, attempted: 0 },
  }

  for (const [id, p] of Object.entries(prog)) {
    const k = id.startsWith('py-') ? 'py' : id.startsWith('sql-') ? 'sql' : id.startsWith('m') ? 'mcq' : null
    if (!k) continue
    counts[k].attempted++
    if (p.solved) counts[k].solved++
  }

  const tierCounts = { 1: { solved: 0, total: 0 }, 2: { solved: 0, total: 0 }, 3: { solved: 0, total: 0 } }
  const specialCount = { solved: 0, total: 0 }
  for (const item of [...pyBank, ...sqlBank]) {
    const t = item.tier
    if (!tierCounts[t]) continue
    tierCounts[t].total++
    const p = prog[item.id]
    if (p && p.solved) tierCounts[t].solved++
    if (item.special) {
      specialCount.total++
      if (p && p.solved) specialCount.solved++
    }
  }

  main.innerHTML = ''
  main.append(
    h('h2', {}, 'Dashboard'),
    h('div', { class: 'stats-grid' },
      statCard(counts.py.solved + '/' + pyBank.length, 'Python solved'),
      statCard(counts.sql.solved + '/' + sqlBank.length, 'SQL solved'),
      statCard(counts.mcq.solved + '/' + mcqBank.length, 'MCQ correct'),
      statCard(tierCounts[1].solved + '/' + tierCounts[1].total, 'Tier 1 done'),
      statCard(tierCounts[2].solved + '/' + tierCounts[2].total, 'Tier 2 done'),
      statCard(tierCounts[3].solved + '/' + tierCounts[3].total, 'Tier 3 done'),
      statCard(specialCount.solved + '/' + specialCount.total, '★ High-freq'),
    ),
    h('div', { class: 'btn-row' },
      btn('Python Problems', 'btn-primary', () => location.hash = '#/py'),
      btn('SQL Problems', 'btn-primary', () => location.hash = '#/sql'),
      btn('MCQ', 'btn-primary', () => location.hash = '#/mcq'),
      btn('Start Mock', 'btn-yellow', () => location.hash = '#/mock'),
      btn('Cheatsheet', 'btn-ghost', () => location.hash = '#/cheat'),
      btn('🎲 Random Py', 'btn-ghost', () => { const p = randomPick(pyBank); if (p) location.hash = '#/py/' + p.id }),
      btn('🎲 Random SQL', 'btn-ghost', () => { const p = randomPick(sqlBank); if (p) location.hash = '#/sql/' + p.id }),
      btn('Reset All Progress', 'btn-danger', () => { if (confirm('Reset all progress?')) { resetAll(); route() } }),
    )
  )
}

function statCard(num, label) {
  return h('div', { class: 'stat-card' },
    h('div', { class: 'num' }, String(num)),
    h('div', { class: 'label' }, label)
  )
}

function btn(label, cls, onclick) {
  const b = h('button', { class: cls }, label)
  b.onclick = onclick
  return b
}

// ---- PYTHON LIST ----
function renderPyList() {
  main.innerHTML = ''
  const prog = allProgress()

  const filters = { tier: '', difficulty: '', pattern: '', search: '', special: false }

  const tiers = [...new Set(pyBank.map(p => p.tier))].sort()
  const difficulties = [...new Set(pyBank.map(p => p.difficulty))]
  const patterns = [...new Set(pyBank.map(p => p.pattern).filter(Boolean))]

  const filterBar = h('div', { class: 'filter-bar' })

  const tierSel = h('select', {})
  tierSel.append(h('option', { value: '' }, 'All Tiers'))
  tiers.forEach(t => tierSel.append(h('option', { value: t }, 'Tier ' + t)))
  tierSel.onchange = () => { filters.tier = tierSel.value; refresh() }

  const diffSel = h('select', {})
  diffSel.append(h('option', { value: '' }, 'All Difficulty'))
  difficulties.forEach(d => diffSel.append(h('option', { value: d }, d)))
  diffSel.onchange = () => { filters.difficulty = diffSel.value; refresh() }

  const patSel = h('select', {})
  patSel.append(h('option', { value: '' }, 'All Patterns'))
  patterns.forEach(p => patSel.append(h('option', { value: p }, p)))
  patSel.onchange = () => { filters.pattern = patSel.value; refresh() }

  const search = h('input', { type: 'text', placeholder: 'Search...' })
  search.oninput = () => { filters.search = search.value.toLowerCase(); refresh() }

  const specialChk = h('input', { type: 'checkbox', id: 'py-special-filter' })
  specialChk.onchange = () => { filters.special = specialChk.checked; refresh() }
  const specialLbl = h('label', { for: 'py-special-filter', class: 'filter-special-label' },
    h('span', { class: 'badge badge-special' }, '★'), ' High-freq only'
  )

  filterBar.append(tierSel, diffSel, patSel, search, specialChk, specialLbl)

  const listEl = h('div', { class: 'problem-list' })

  function refresh() {
    listEl.innerHTML = ''
    const items = pyBank.filter(p => {
      if (filters.tier && String(p.tier) !== filters.tier) return false
      if (filters.difficulty && p.difficulty !== filters.difficulty) return false
      if (filters.pattern && p.pattern !== filters.pattern) return false
      if (filters.search && !p.title.toLowerCase().includes(filters.search)) return false
      if (filters.special && !p.special) return false
      return true
    })
    items.forEach(p => {
      const pr = prog[p.id]
      const row = h('div', { class: 'problem-row' },
        pr && pr.solved ? h('span', { class: 'badge badge-solved' }, '✓') : h('span', {}, ''),
        p.special ? h('span', { class: 'badge badge-special', title: p.special_tag }, '★') : null,
        h('span', { class: 'title' }, p.num + '. ' + p.title),
        difficultyBadge(p.difficulty),
        h('span', { class: 'badge' }, 'T' + p.tier),
        h('span', { class: 'meta' }, p.pattern || ''),
      )
      row.onclick = () => location.hash = '#/py/' + p.id
      listEl.append(row)
    })
    if (items.length === 0) listEl.append(h('p', { class: 'muted' }, 'No problems match filters.'))
  }

  const pyRandomBtn = btn('🎲 Random', 'btn-ghost', () => {
    const items = pyBank.filter(p => {
      if (filters.tier && String(p.tier) !== filters.tier) return false
      if (filters.difficulty && p.difficulty !== filters.difficulty) return false
      if (filters.pattern && p.pattern !== filters.pattern) return false
      if (filters.search && !p.title.toLowerCase().includes(filters.search)) return false
      if (filters.special && !p.special) return false
      return true
    })
    const p = randomPick(items)
    if (p) location.hash = '#/py/' + p.id
  })
  filterBar.append(pyRandomBtn)

  refresh()
  main.append(h('h2', {}, 'Python Problems'), filterBar, listEl)
}

// ---- PYTHON SOLVE ----
function renderPySolve(id) {
  const prob = pyBank.find(p => p.id === id)
  if (!prob) { location.hash = '#/py'; return }

  main.innerHTML = ''
  let hintIdx = 0
  let editorInst = null

  const backBtn = h('button', { class: 'back-btn' }, '← Back')
  backBtn.onclick = () => location.hash = '#/py'

  const header = h('div', { class: 'section-header' },
    backBtn,
    h('span', { class: 'muted' }, prob.section),
  )

  const title = h('h2', {}, prob.num + '. ' + prob.title)
  const meta = h('div', { class: 'btn-row' },
    difficultyBadge(prob.difficulty),
    h('span', { class: 'badge' }, 'Tier ' + prob.tier),
    prob.pattern ? h('span', { class: 'badge badge-easy' }, prob.pattern) : null,
    prob.special ? h('span', { class: 'badge badge-special' }, '★ ' + prob.special_tag) : null,
    prob.source_label ? h('a', { href: prob.source_url, target: '_blank', class: 'muted', style: 'font-size:12px' }, prob.source_label) : null,
  )

  const statement = renderMd(prob.statement)

  const editorWrap = h('div', { class: 'editor-wrap', style: 'height:340px;margin:12px 0' })

  const draft = loadDraft(id)
  const initialCode = draft || prob.starter || ''

  const resultsPanel = h('div', { class: 'results-panel', style: 'display:none' })
  const hintsArea = h('div', {})

  const runBtnEl = btn('Run', 'btn-primary', runTests)
  const submitBtnEl = btn('Submit', 'btn-yellow', submitCode)
  const resetBtnEl = btn('Reset', 'btn-ghost', resetCode)
  const hintBtnEl = btn('Hint', 'btn-ghost', showHint)
  const solutionBtnEl = btn('Show Solution', 'btn-danger', showSolution)

  if (!prob.hints || prob.hints.length === 0) hintBtnEl.disabled = true

  const btnRow = h('div', { class: 'btn-row' }, runBtnEl, submitBtnEl, resetBtnEl, hintBtnEl, solutionBtnEl)

  main.append(header, title, meta, statement, editorWrap, btnRow, hintsArea, resultsPanel)

  makeEditor(editorWrap, 'python', initialCode).then(ed => {
    editorInst = ed
    ed.onDidChangeModelContent(() => {
      saveDraft(id, ed.getValue())
    })
  })

  async function runTests() {
    if (!editorInst) return
    const code = editorInst.getValue()
    runBtnEl.disabled = true
    runBtnEl.textContent = 'Running...'
    resultsPanel.style.display = 'block'
    resultsPanel.innerHTML = '<span class="muted">Running tests...</span>'
    try {
      await initPython(setPyStatus)
      const out = await runPython(code, prob)
      showResults(out, false)
    } catch (e) {
      resultsPanel.innerHTML = '<span style="color:var(--fail)">Error: ' + e.message + '</span>'
    }
    runBtnEl.disabled = false
    runBtnEl.textContent = 'Run'
  }

  async function submitCode() {
    if (!editorInst) return
    const code = editorInst.getValue()
    submitBtnEl.disabled = true
    submitBtnEl.textContent = 'Running...'
    resultsPanel.style.display = 'block'
    resultsPanel.innerHTML = '<span class="muted">Running tests...</span>'
    try {
      await initPython(setPyStatus)
      const out = await runPython(code, prob)
      const passed = out.tle ? 0 : (out.results || []).filter(r => r.pass).length
      const total = (out.results || []).length
      const pct = total > 0 ? Math.round(passed / total * 100) : 0
      recordAttempt(id, 'py', out.tle ? 0 : pct)
      showResults(out, true)
    } catch (e) {
      resultsPanel.innerHTML = '<span style="color:var(--fail)">Error: ' + e.message + '</span>'
    }
    submitBtnEl.disabled = false
    submitBtnEl.textContent = 'Submit'
  }

  function showResults(out, isSubmit) {
    resultsPanel.innerHTML = ''
    if (out.tle) {
      resultsPanel.append(h('div', { class: 'test-result tle' }, 'Time Limit Exceeded — infinite loop or too slow'))
      return
    }
    if (out.compile_error) {
      const box = h('div', { class: 'test-result fail' }, 'Error:')
      box.append(h('pre', {}, out.compile_error))
      resultsPanel.append(box)
    }
    const results = out.results || []
    const passed = results.filter(r => r.pass).length
    const pct = results.length > 0 ? Math.round(passed / results.length * 100) : 0

    if (results.length > 0) {
      const score = h('div', { class: 'score-bar' })
      score.innerHTML = `<span class="${passed === results.length ? 'pass' : 'fail'}">${passed}/${results.length} passed (${pct}%)</span>`
      resultsPanel.append(score)
    }

    results.forEach((r, i) => {
      const cls = r.pass ? 'pass' : 'fail'
      const div = h('div', { class: 'test-result ' + cls },
        h('strong', {}, `Test ${i + 1}: ${r.pass ? 'PASS' : 'FAIL'}`)
      )
      if (!r.pass) {
        const details = [`Args: ${JSON.stringify(r.args)}`, `Expected: ${JSON.stringify(r.expected)}`, `Got: ${JSON.stringify(r.got)}`]
        if (r.error) details.push('Error: ' + r.error)
        div.append(h('pre', {}, details.join('\n')))
      }
      resultsPanel.append(div)
    })

    if (out.stdout) {
      resultsPanel.append(h('div', { class: 'muted', style: 'margin-top:8px;font-size:12px' }, 'stdout:'))
      resultsPanel.append(h('div', { class: 'stdout-box' }, out.stdout))
    }
  }

  function resetCode() {
    if (editorInst) {
      editorInst.setValue(prob.starter || '')
      saveDraft(id, prob.starter || '')
    }
  }

  function showHint() {
    if (!prob.hints || prob.hints.length === 0) return
    if (hintIdx >= prob.hints.length) return
    hintsArea.append(h('div', { class: 'hint-box' }, `Hint ${hintIdx + 1}: ${prob.hints[hintIdx]}`))
    hintIdx++
    if (hintIdx >= prob.hints.length) hintBtnEl.disabled = true
  }

  function showSolution() {
    if (!confirm('Show solution? This will replace your current code.')) return
    if (editorInst && prob.solution) {
      editorInst.setValue(prob.solution)
      saveDraft(id, prob.solution)
    }
  }
}

// ---- SQL LIST ----
function renderSqlList() {
  main.innerHTML = ''
  const prog = allProgress()

  const filters = { tier: '', difficulty: '', search: '', special: false }
  const tiers = [...new Set(sqlBank.map(p => p.tier))].sort()
  const difficulties = [...new Set(sqlBank.map(p => p.difficulty))]

  const filterBar = h('div', { class: 'filter-bar' })
  const tierSel = h('select', {})
  tierSel.append(h('option', { value: '' }, 'All Tiers'))
  tiers.forEach(t => tierSel.append(h('option', { value: t }, 'Tier ' + t)))
  tierSel.onchange = () => { filters.tier = tierSel.value; refresh() }

  const diffSel = h('select', {})
  diffSel.append(h('option', { value: '' }, 'All Difficulty'))
  difficulties.forEach(d => diffSel.append(h('option', { value: d }, d)))
  diffSel.onchange = () => { filters.difficulty = diffSel.value; refresh() }

  const search = h('input', { type: 'text', placeholder: 'Search...' })
  search.oninput = () => { filters.search = search.value.toLowerCase(); refresh() }

  const specialChk = h('input', { type: 'checkbox', id: 'sql-special-filter' })
  specialChk.onchange = () => { filters.special = specialChk.checked; refresh() }
  const specialLbl = h('label', { for: 'sql-special-filter', class: 'filter-special-label' },
    h('span', { class: 'badge badge-special' }, '★'), ' High-freq only'
  )

  filterBar.append(tierSel, diffSel, search, specialChk, specialLbl)

  const listEl = h('div', { class: 'problem-list' })

  function refresh() {
    listEl.innerHTML = ''
    const items = sqlBank.filter(p => {
      if (filters.tier && String(p.tier) !== filters.tier) return false
      if (filters.difficulty && p.difficulty !== filters.difficulty) return false
      if (filters.search && !p.title.toLowerCase().includes(filters.search)) return false
      if (filters.special && !p.special) return false
      return true
    })
    items.forEach(p => {
      const pr = prog[p.id]
      const row = h('div', { class: 'problem-row' },
        pr && pr.solved ? h('span', { class: 'badge badge-solved' }, '✓') : h('span', {}, ''),
        p.special ? h('span', { class: 'badge badge-special', title: p.special_tag }, '★') : null,
        h('span', { class: 'title' }, p.num + '. ' + p.title),
        difficultyBadge(p.difficulty),
        h('span', { class: 'badge' }, 'T' + p.tier),
        h('span', { class: 'meta' }, p.pattern || ''),
      )
      row.onclick = () => location.hash = '#/sql/' + p.id
      listEl.append(row)
    })
    if (items.length === 0) listEl.append(h('p', { class: 'muted' }, 'No problems match filters.'))
  }

  const sqlRandomBtn = btn('🎲 Random', 'btn-ghost', () => {
    const items = sqlBank.filter(p => {
      if (filters.tier && String(p.tier) !== filters.tier) return false
      if (filters.difficulty && p.difficulty !== filters.difficulty) return false
      if (filters.search && !p.title.toLowerCase().includes(filters.search)) return false
      if (filters.special && !p.special) return false
      return true
    })
    const p = randomPick(items)
    if (p) location.hash = '#/sql/' + p.id
  })
  filterBar.append(sqlRandomBtn)

  refresh()
  main.append(h('h2', {}, 'SQL Problems'), filterBar, listEl)
}

// ---- SQL SOLVE ----
function renderSqlSolve(id) {
  const prob = sqlBank.find(p => p.id === id)
  if (!prob) { location.hash = '#/sql'; return }

  main.innerHTML = ''
  let hintIdx = 0
  let editorInst = null

  const backBtn = h('button', { class: 'back-btn' }, '← Back')
  backBtn.onclick = () => location.hash = '#/sql'

  const header = h('div', { class: 'section-header' }, backBtn, h('span', { class: 'muted' }, prob.section))
  const title = h('h2', {}, prob.num + '. ' + prob.title)
  const meta = h('div', { class: 'btn-row' },
    difficultyBadge(prob.difficulty),
    h('span', { class: 'badge' }, 'Tier ' + prob.tier),
    prob.pattern ? h('span', { class: 'badge badge-easy' }, prob.pattern) : null,
    prob.special ? h('span', { class: 'badge badge-special' }, '★ ' + prob.special_tag) : null,
    prob.source_label ? h('a', { href: prob.source_url, target: '_blank', class: 'muted', style: 'font-size:12px' }, prob.source_label) : null,
  )

  const statement = renderMd(prob.statement)

  // Schema collapsible
  const schemaBtn = h('button', { class: 'collapsible-btn' }, 'Show Schema / Seed SQL')
  const schemaContent = h('div', { class: 'collapsible-content' },
    h('pre', { style: 'background:var(--bg3);padding:10px;border-radius:5px;font-size:12px;overflow-x:auto' }, prob.schema_sql + '\n\n' + prob.seed_sql)
  )
  schemaBtn.onclick = () => {
    schemaContent.classList.toggle('open')
    schemaBtn.textContent = schemaContent.classList.contains('open') ? 'Hide Schema / Seed SQL' : 'Show Schema / Seed SQL'
  }

  if (prob.mysql_note) {
    statement.append(h('div', { class: 'hint-box', style: 'margin-top:8px' }, 'MySQL note: ' + prob.mysql_note))
  }

  const editorWrap = h('div', { class: 'editor-wrap', style: 'height:200px;margin:12px 0' })
  const draft = loadDraft(id)
  const initialSql = draft || (prob.solution_sql ? '-- Write your SQL here\n' : '')

  const resultsPanel = h('div', { class: 'results-panel', style: 'display:none' })
  const hintsArea = h('div', {})

  const runBtnEl = btn('Run', 'btn-primary', runQuery)
  const submitBtnEl = btn('Submit', 'btn-yellow', submitQuery)
  const resetBtnEl = btn('Reset', 'btn-ghost', resetCode)
  const hintBtnEl = btn('Hint', 'btn-ghost', showHint)
  const solutionBtnEl = btn('Show Solution', 'btn-danger', showSolution)

  if (!prob.hints || prob.hints.length === 0) hintBtnEl.disabled = true

  const btnRow = h('div', { class: 'btn-row' }, runBtnEl, submitBtnEl, resetBtnEl, hintBtnEl, solutionBtnEl)

  main.append(header, title, meta, statement, schemaBtn, schemaContent, editorWrap, btnRow, hintsArea, resultsPanel)

  makeEditor(editorWrap, 'sql', initialSql).then(ed => {
    editorInst = ed
    ed.onDidChangeModelContent(() => saveDraft(id, ed.getValue()))
  })

  async function runQuery() {
    if (!editorInst) return
    const sql = editorInst.getValue()
    runBtnEl.disabled = true
    runBtnEl.textContent = 'Running...'
    resultsPanel.style.display = 'block'
    resultsPanel.innerHTML = '<span class="muted">Running...</span>'
    try {
      const result = await runSql(prob, sql)
      showSqlResult(result)
    } catch (e) {
      resultsPanel.innerHTML = '<span style="color:var(--fail)">Error: ' + e.message + '</span>'
    }
    runBtnEl.disabled = false
    runBtnEl.textContent = 'Run'
  }

  async function submitQuery() {
    if (!editorInst) return
    const sql = editorInst.getValue()
    submitBtnEl.disabled = true
    submitBtnEl.textContent = 'Running...'
    resultsPanel.style.display = 'block'
    resultsPanel.innerHTML = '<span class="muted">Running...</span>'
    try {
      const result = await runSql(prob, sql)
      recordAttempt(id, 'sql', result.ok ? 100 : 0)
      showSqlResult(result)
    } catch (e) {
      resultsPanel.innerHTML = '<span style="color:var(--fail)">Error: ' + e.message + '</span>'
    }
    submitBtnEl.disabled = false
    submitBtnEl.textContent = 'Submit'
  }

  function showSqlResult(result) {
    resultsPanel.innerHTML = ''
    if (result.error) {
      const box = h('div', { class: 'test-result fail' }, 'SQL Error:')
      box.append(h('pre', {}, result.error))
      resultsPanel.append(box)
      return
    }

    const cls = result.ok ? 'pass' : 'fail'
    const label = result.ok ? 'Correct' : 'Wrong Answer'
    resultsPanel.append(h('div', { class: 'score-bar' },
      h('span', { class: cls }, label)
    ))

    const cols2 = h('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px' })

    const gotBox = h('div', {})
    gotBox.append(h('div', { class: 'muted', style: 'font-size:12px;margin-bottom:4px' }, 'Your output'))
    gotBox.append(sqlTable(result.cols, result.got))

    const expBox = h('div', {})
    expBox.append(h('div', { class: 'muted', style: 'font-size:12px;margin-bottom:4px' }, 'Expected'))
    expBox.append(sqlTable(result.cols.length ? result.cols : (prob.expected_columns || []), result.expected))

    cols2.append(gotBox, expBox)
    resultsPanel.append(cols2)
  }

  function resetCode() {
    if (editorInst) {
      editorInst.setValue('-- Write your SQL here\n')
      saveDraft(id, '-- Write your SQL here\n')
    }
  }

  function showHint() {
    if (!prob.hints || prob.hints.length === 0) return
    if (hintIdx >= prob.hints.length) return
    hintsArea.append(h('div', { class: 'hint-box' }, `Hint ${hintIdx + 1}: ${prob.hints[hintIdx]}`))
    hintIdx++
    if (hintIdx >= prob.hints.length) hintBtnEl.disabled = true
  }

  function showSolution() {
    if (!confirm('Show solution? This will replace your current SQL.')) return
    if (editorInst && prob.solution_sql) {
      editorInst.setValue(prob.solution_sql)
      saveDraft(id, prob.solution_sql)
    }
  }
}

// ---- MCQ ----
function renderMcq(topicFilter) {
  main.innerHTML = ''
  const prog = allProgress()

  const topics = [...new Set(mcqBank.map(q => q.topic))].sort()
  let activeTopic = topicFilter || ''
  let currentIdx = 0
  let shuffledList = shuffle(mcqBank.filter(q => !activeTopic || q.topic === activeTopic))

  const topicBar = h('div', { class: 'filter-bar' })
  const topicSel = h('select', {})
  topicSel.append(h('option', { value: '' }, 'All Topics'))
  topics.forEach(t => topicSel.append(h('option', { value: t }, t)))
  if (activeTopic) topicSel.value = activeTopic
  topicSel.onchange = () => {
    activeTopic = topicSel.value
    shuffledList = shuffle(mcqBank.filter(q => !activeTopic || q.topic === activeTopic))
    currentIdx = 0
    showQuestion()
  }
  const shuffleBtn = btn('Shuffle', 'btn-ghost', () => {
    shuffledList = shuffle(mcqBank.filter(q => !activeTopic || q.topic === activeTopic))
    currentIdx = 0
    showQuestion()
  })
  topicBar.append(topicSel, shuffleBtn)

  const questionArea = h('div', { class: 'card', style: 'margin-top:12px' })
  const progress = h('div', { class: 'muted', style: 'font-size:12px;margin-bottom:8px' })

  main.append(h('h2', {}, 'MCQ Practice'), topicBar, progress, questionArea)

  function filtered() {
    return shuffledList
  }

  function showQuestion() {
    const items = filtered()
    if (items.length === 0) {
      questionArea.innerHTML = '<span class="muted">No questions for this topic.</span>'
      return
    }
    if (currentIdx >= items.length) currentIdx = 0
    const q = items[currentIdx]
    const pr = prog[q.id]

    progress.textContent = `Question ${currentIdx + 1} of ${items.length}`
    questionArea.innerHTML = ''

    const qText = h('p', { style: 'font-size:15px;font-weight:500;margin-bottom:14px' }, q.question)
    if (q.subtopic) {
      qText.prepend(h('span', { class: 'muted', style: 'font-size:12px;display:block;margin-bottom:4px' }, q.topic + ' / ' + q.subtopic))
    }
    questionArea.append(qText)

    let answered = false

    q.options.forEach((opt, i) => {
      const btn = h('button', { class: 'mcq-option' }, opt)
      btn.onclick = () => {
        if (answered) return
        answered = true
        const correct = i === q.answer_index
        btn.classList.add(correct ? 'correct' : 'wrong')
        if (!correct) {
          optBtns[q.answer_index].classList.add('correct')
        }
        optBtns.forEach(b => b.disabled = true)
        recordAttempt(q.id, 'mcq', correct ? 100 : 0)
        prog[q.id] = { solved: correct, attempts: (prog[q.id]?.attempts || 0) + 1 }
        questionArea.append(h('div', { class: 'explanation' }, q.explanation || ''))
        questionArea.append(nextBtn)
      }
      questionArea.append(btn)
    })

    const optBtns = questionArea.querySelectorAll('.mcq-option')

    if (pr && pr.solved) {
      const mark = h('div', { class: 'muted', style: 'font-size:12px;margin-bottom:8px' }, 'Previously answered correctly')
      questionArea.prepend(mark)
    }

    const nextBtn = btn('Next →', 'btn-primary', () => { currentIdx++; showQuestion() })
  }

  showQuestion()
}

// ---- MOCK EXAM ----
function renderMock() {
  main.innerHTML = ''

  // Pick items
  const easy = pyBank.filter(p => p.difficulty === 'easy' || p.difficulty === 'very easy')
  const medium = pyBank.filter(p => p.difficulty === 'medium')
  const easySQL = sqlBank.filter(p => p.difficulty === 'easy' || p.difficulty === 'very easy')
  const mediumSQL = sqlBank.filter(p => p.difficulty === 'medium')

  function pick(arr, n) {
    const s = [...arr].sort(() => Math.random() - 0.5)
    return s.slice(0, n)
  }

  const codingItems = [
    ...pick([...easy, ...easySQL], 2),
    ...pick([...medium, ...mediumSQL], 2),
  ].slice(0, 4)

  const mcqItems = pick(mcqBank, 10)
  const allItems = [...codingItems, ...mcqItems]

  let currentItem = 0
  const answers = {} // id -> { code?, sqlCode?, mcqChoice? }
  const DURATION = 75 * 60 // 75 min in seconds
  let remaining = DURATION
  let timerInterval = null
  let finished = false

  const timerEl = h('div', { class: 'timer' }, formatTime(remaining))
  const itemNav = h('div', { class: 'mock-nav' })
  const itemArea = h('div', {})
  const finishBtn = btn('Finish Exam', 'btn-yellow', finishExam)

  function formatTime(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0')
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      remaining--
      timerEl.textContent = formatTime(remaining)
      timerEl.className = 'timer' + (remaining < 300 ? ' danger' : remaining < 600 ? ' warn' : '')
      if (remaining <= 0) {
        clearInterval(timerInterval)
        mockTimer = null
        finishExam()
      }
    }, 1000)
    mockTimer = timerInterval
  }

  function buildNav() {
    itemNav.innerHTML = ''
    allItems.forEach((item, i) => {
      const answered = answers[item.id] != null
      const el = h('div', { class: 'mock-nav-item' + (i === currentItem ? ' active' : '') + (answered ? ' answered' : '') }, String(i + 1))
      el.onclick = () => {
        saveCurrentAnswer()
        currentItem = i
        buildNav()
        showItem()
      }
      itemNav.append(el)
    })
  }

  let currentEditor = null
  function saveCurrentAnswer() {
    const item = allItems[currentItem]
    if (!item) return
    if (currentEditor) {
      answers[item.id] = { code: currentEditor.getValue() }
    }
  }

  function showItem() {
    currentEditor = null
    itemArea.innerHTML = ''
    const item = allItems[currentItem]
    if (!item) return

    const isMcq = item.question != null
    if (isMcq) {
      showMcqItem(item)
    } else if (item.id.startsWith('py-')) {
      showCodingItem(item, 'python')
    } else {
      showCodingItem(item, 'sql')
    }
  }

  function showMcqItem(q) {
    const qText = h('p', { style: 'font-size:15px;font-weight:500;margin-bottom:14px' }, q.question)
    itemArea.append(h('h3', {}, 'MCQ ' + (allItems.indexOf(q) - codingItems.length + 1) + ' of ' + mcqItems.length), qText)

    const saved = answers[q.id]
    let answered = saved != null

    q.options.forEach((opt, i) => {
      const b = h('button', { class: 'mcq-option' }, opt)
      if (answered) {
        b.disabled = true
        if (i === q.answer_index) b.classList.add('correct')
        if (saved.choice === i && i !== q.answer_index) b.classList.add('wrong')
      }
      b.onclick = () => {
        if (answered) return
        answered = true
        answers[q.id] = { choice: i }
        buildNav()
        const correct = i === q.answer_index
        b.classList.add(correct ? 'correct' : 'wrong')
        itemArea.querySelectorAll('.mcq-option').forEach((ob, oi) => {
          ob.disabled = true
          if (oi === q.answer_index) ob.classList.add('correct')
        })
      }
      itemArea.append(b)
    })
  }

  function showCodingItem(prob, lang) {
    const isSql = lang === 'sql'
    const num = codingItems.indexOf(prob) + 1
    itemArea.append(
      h('h3', {}, `Coding ${num} of ${codingItems.length}: ${prob.title}`),
      h('div', { class: 'muted', style: 'font-size:12px;margin-bottom:8px' }, difficultyBadge(prob.difficulty)),
      renderMd(prob.statement),
    )

    const editorWrap = h('div', { class: 'editor-wrap', style: 'height:280px;margin:12px 0' })
    itemArea.append(editorWrap)

    const saved = answers[prob.id]
    const initVal = saved?.code || (isSql ? '-- Write your SQL here\n' : (prob.starter || ''))

    makeEditor(editorWrap, lang, initVal).then(ed => {
      currentEditor = ed
    })
  }

  async function finishExam() {
    if (finished) return
    finished = true
    clearInterval(timerInterval)
    mockTimer = null
    saveCurrentAnswer()

    main.innerHTML = ''
    main.append(h('h2', {}, 'Mock Exam Results'))
    main.append(h('div', { class: 'muted' }, 'Grading...'))

    let pyScore = 0, sqlScore = 0, mcqScore = 0
    const resultLines = []

    // Grade MCQ
    for (const q of mcqItems) {
      const ans = answers[q.id]
      const correct = ans && ans.choice === q.answer_index
      if (correct) mcqScore++
      resultLines.push({ label: q.question.slice(0, 60) + '...', pass: correct, type: 'mcq' })
    }

    // Grade coding
    for (const prob of codingItems) {
      const ans = answers[prob.id]
      const code = ans?.code || ''
      if (!code.trim()) {
        resultLines.push({ label: prob.title, pass: false, pct: 0, type: prob.id.startsWith('py-') ? 'py' : 'sql' })
        continue
      }

      if (prob.id.startsWith('py-')) {
        try {
          await initPython(setPyStatus)
          const out = await runPython(code, prob)
          const passed = out.tle ? 0 : (out.results || []).filter(r => r.pass).length
          const total = (out.results || []).length
          const pct = total > 0 ? Math.round(passed / total * 100) : 0
          if (pct === 100) pyScore++
          resultLines.push({ label: prob.title, pass: pct === 100, pct, type: 'py' })
        } catch {
          resultLines.push({ label: prob.title, pass: false, pct: 0, type: 'py' })
        }
      } else {
        try {
          const result = await runSql(prob, code)
          if (result.ok) sqlScore++
          resultLines.push({ label: prob.title, pass: result.ok, type: 'sql' })
        } catch {
          resultLines.push({ label: prob.title, pass: false, type: 'sql' })
        }
      }
    }

    main.innerHTML = ''
    main.append(h('h2', {}, 'Mock Exam Results'))

    const summary = h('div', { class: 'stats-grid' },
      statCard(mcqScore + '/' + mcqItems.length, 'MCQ'),
      statCard((pyScore + sqlScore) + '/' + codingItems.length, 'Coding'),
    )
    main.append(summary)

    const list = h('div', { class: 'problem-list' })
    resultLines.forEach(r => {
      const row = h('div', { class: 'problem-row', style: `border-left:3px solid ${r.pass ? 'var(--pass)' : 'var(--fail)'}` },
        h('span', { class: r.pass ? 'badge badge-solved' : 'badge' }, r.pass ? '✓' : '✗'),
        h('span', { class: 'title' }, r.label),
        h('span', { class: 'muted' }, r.type.toUpperCase()),
        r.pct != null ? h('span', { class: 'muted' }, r.pct + '%') : null,
      )
      list.append(row)
    })
    main.append(list)
    main.append(h('div', { class: 'btn-row', style: 'margin-top:16px' },
      btn('Back to Dashboard', 'btn-primary', () => location.hash = '#/dashboard'),
      btn('New Mock', 'btn-ghost', () => { location.hash = '#/mock'; route() }),
    ))
  }

  main.append(
    h('div', { class: 'section-header' },
      h('h2', {}, 'Mock Exam'),
      timerEl,
    ),
    itemNav,
    itemArea,
    h('div', { class: 'btn-row', style: 'margin-top:16px' }, finishBtn)
  )

  buildNav()
  showItem()
  startTimer()
}

// ---- CRAM ----
async function renderCram() {
  main.innerHTML = '<div class="muted">Cram module loading...</div>'
  try {
    const m = await import('./cram.js')
    m.render(main)
  } catch (e) {
    main.innerHTML = '<div class="muted">Cram module loading... (module not found)</div>'
    console.error('Cram module error:', e)
  }
}

// ---- CHEATSHEET ----
function renderCheat() {
  main.innerHTML = ''
  main.append(h('h2', {}, 'Cheatsheet'))

  const md = `
## SQL Dialect Comparison

| Feature | SQLite / PostgreSQL | MySQL | SQL Server |
|---------|---------------------|-------|------------|
| Row limiting | \`LIMIT n OFFSET m\` | \`LIMIT n OFFSET m\` | \`SELECT TOP n\` / \`FETCH FIRST n ROWS ONLY\` |
| Date diff | \`julianday(a) - julianday(b)\` | \`DATEDIFF(a, b)\` | \`DATEDIFF(unit, a, b)\` |
| Date format | \`strftime('%Y-%m', d)\` | \`DATE_FORMAT(d, '%Y-%m')\` | \`FORMAT(d, 'yyyy-MM')\` |
| NULL substitution | \`COALESCE(x, y)\` | \`COALESCE(x, y)\` / \`IFNULL(x, y)\` | \`COALESCE(x, y)\` / \`ISNULL(x, y)\` |
| String concat | \`\|\|\` | \`CONCAT(a, b)\` (not \`\|\|\`) | \`+\` or \`CONCAT(a, b)\` |
| Window functions | Yes (PG) / limited SQLite | MySQL 8.0+ only | Yes |

## Sleeper Gotchas

- **Integer division**: Python \`//\` floors toward negative infinity (e.g. \`-7 // 2 = -4\`). Reverse integer truncates toward zero.
- **SQL output format**: \`.00\` vs \`0.00\` — HackerRank has filtered submissions on this. Check your decimal format.
- **Off-by-one**: binary search bounds, two-pointer write index, range endpoints.
- **Empty input**: always test \`[]\`, \`""\`, single element, all-duplicates.
- **Mutable default argument**: \`def f(x, acc=[])\` — the list is shared across all calls. Use \`None\` as default.
- **k % n before rotate**: rotating by \`k\` where \`k >= len(arr)\` — reduce first.
- **NULL != NULL**: \`NULL = NULL\` is false in SQL. Use \`IS NULL\` / \`IS NOT NULL\`.
- **Integer overflow**: Python ints are arbitrary precision, but conceptually relevant for atoi/reverse integer problems.

## Tier 1 — Drill First (near-certain coverage)

**Python:** Two Sum (hashmap), Valid Parentheses (stack), reverse/merge linked list, Valid Palindrome/Anagram, Best Time to Buy/Sell Stock, Binary Search, FizzBuzz, Climbing Stairs, Maximum Subarray.

**SQL:** JOIN types (inner/left/self), GROUP BY + HAVING (Duplicate Emails, Classes >5), Second Highest Salary, Rising Temperature, Employees > Managers, Customers Who Never Order.

**MCQ:** Python output prediction (mutable default, is vs ==, slicing, list/tuple/set), Big-O of operations, WHERE vs HAVING, JOIN types.

## Tier 2 — High-Value (analytics role)

**Python:** Sliding window (longest substring without repeating), Pandas data manipulation, group anagrams, top-K frequent, subarray sum = K.

**SQL:** Window functions (DENSE_RANK, LAG/LEAD, running totals), top-N-per-group (Department Top 3 Salaries), CTEs, conditional aggregation, date functions (Monthly Transactions).

**MCQ:** Stats (p-value, Type I/II, CLT, mean/median), ML (overfitting, precision/recall/F1, L1/L2 reg), normalization, ACID, index types.

## Tier 3 — Round Out Coverage

**Python:** Trees (max depth, invert, BFS level order), backtracking (subsets, permutations, generate parentheses), DP (house robber, coin change), intervals (merge intervals).

**SQL:** Recursive CTEs, pivot/conditional aggregation, set operations (UNION/INTERSECT), hard problems (Trips and Users, Human Traffic of Stadium).

**MCQ:** Bitwise/binary-hex conversion, OOP pillars (encapsulation, inheritance, polymorphism, abstraction), sorting stability/in-place.
`

  const div = h('div', { class: 'statement cheat-section' })
  div.innerHTML = marked.parse(md)
  main.append(div)
}

// ---- INIT ----
async function init() {
  await loadBanks()
  route()
}

init().catch(e => {
  main.innerHTML = '<div style="color:var(--fail);padding:20px">Failed to load data: ' + e.message + '</div>'
})
