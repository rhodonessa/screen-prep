let SQL = null

async function ensureSql() {
  if (SQL) return SQL
  SQL = await window.initSqlJs({
    locateFile: f => `https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/${f}`
  })
  return SQL
}

function rowsEqual(a, b, tol = 1e-6) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    const ra = a[i], rb = b[i]
    if (ra.length !== rb.length) return false
    for (let j = 0; j < ra.length; j++) {
      const va = ra[j], vb = rb[j]
      if (typeof va === 'number' && typeof vb === 'number') {
        if (Math.abs(va - vb) > tol) return false
      } else if (String(va) !== String(vb)) {
        return false
      }
    }
  }
  return true
}

function sortRows(rows) {
  return [...rows].sort((a, b) => {
    const ja = JSON.stringify(a), jb = JSON.stringify(b)
    return ja < jb ? -1 : ja > jb ? 1 : 0
  })
}

export async function runSql(spec, userSql) {
  try {
    const Sql = await ensureSql()
    const db = new Sql.Database()

    db.run(spec.schema_sql)
    db.run(spec.seed_sql)

    let gotRows = []
    let cols = []
    let error = null

    try {
      if (spec.kind === 'mutation') {
        db.run(userSql)
        const res = db.exec(spec.verify_sql)
        if (res.length > 0) {
          cols = res[0].columns
          gotRows = res[0].values
        }
      } else {
        const res = db.exec(userSql)
        if (res.length > 0) {
          cols = res[0].columns
          gotRows = res[0].values
        }
      }
    } catch (e) {
      error = String(e.message || e)
    }

    db.close()

    if (error) return { ok: false, got: [], cols, expected: spec.expected_rows, error }

    let got = gotRows
    let expected = spec.expected_rows || []

    let ok
    if (!spec.order_matters) {
      ok = rowsEqual(sortRows(got), sortRows(expected))
    } else {
      ok = rowsEqual(got, expected)
    }

    return { ok, got, cols, expected, error: null }
  } catch (e) {
    return { ok: false, got: [], cols: [], expected: spec.expected_rows || [], error: String(e.message || e) }
  }
}
