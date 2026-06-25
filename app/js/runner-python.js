let worker = null
let bootPromise = null
let msgId = 0
const pending = new Map()

function spawnWorker(judgeSrc) {
  worker = new Worker('app/js/python-worker.js')
  worker.onmessage = (e) => {
    const m = e.data
    if (m.type === 'ready') {
      const res = pending.get('__boot__')
      if (res) {
        pending.delete('__boot__')
        res.resolve()
      }
      return
    }
    if (m.type === 'result') {
      const res = pending.get(m.id)
      if (res) {
        pending.delete(m.id)
        res.resolve(m.out)
      }
    }
  }
  worker.onerror = (e) => {
    for (const [k, v] of pending) {
      v.reject(e)
    }
    pending.clear()
    worker = null
    bootPromise = null
  }
  return new Promise((resolve, reject) => {
    pending.set('__boot__', { resolve, reject })
    worker.postMessage({ type: 'init', judgeSrc })
  })
}

export async function initPython(onStatus) {
  if (bootPromise) return bootPromise
  onStatus && onStatus('loading')
  bootPromise = (async () => {
    const resp = await fetch('engine/judge.py')
    if (!resp.ok) throw new Error('Failed to fetch judge.py')
    const judgeSrc = await resp.text()
    await spawnWorker(judgeSrc)
    onStatus && onStatus('ready')
  })()
  bootPromise.catch(() => {
    bootPromise = null
    onStatus && onStatus('error')
  })
  return bootPromise
}

export async function runPython(code, spec, timeoutMs = 10000) {
  await initPython()
  const id = ++msgId
  return new Promise((resolve) => {
    let timer = setTimeout(() => {
      pending.delete(id)
      if (worker) {
        worker.terminate()
        worker = null
        bootPromise = null
      }
      resolve({ tle: true, results: [] })
    }, timeoutMs)

    pending.set(id, {
      resolve: (out) => {
        clearTimeout(timer)
        try {
          resolve(JSON.parse(out))
        } catch {
          resolve({ compile_error: 'Failed to parse result', results: [], stdout: '' })
        }
      },
      reject: (err) => {
        clearTimeout(timer)
        resolve({ compile_error: String(err), results: [], stdout: '' })
      }
    })

    worker.postMessage({ type: 'run', id, code, spec: JSON.stringify(spec) })
  })
}
