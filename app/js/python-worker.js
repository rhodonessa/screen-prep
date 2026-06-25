// Classic Web Worker: runs Pyodide off the main thread so infinite loops in
// practice code can be killed (TLE) without freezing the UI. Uses the SAME
// engine/judge.py the content was verified against, so green here == green there.
const PYODIDE_VERSION = 'v0.26.4'
importScripts(`https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/pyodide.js`)

let pyodide = null

// Driver runs in Pyodide globals where judge.py has defined make_namespace /
// run_problem / ListNode / TreeNode. Captures stdout and full tracebacks.
const DRIVER = `
import json, io, contextlib, traceback
_spec = json.loads(SPEC_JSON)
_ns = make_namespace()
_err = None
_results = []
_buf = io.StringIO()
with contextlib.redirect_stdout(_buf):
    try:
        exec(USER_CODE, _ns)
    except Exception:
        _err = traceback.format_exc()
    if _err is None:
        try:
            _results = run_problem(_spec, _ns)
        except Exception:
            _err = traceback.format_exc()
json.dumps({"compile_error": _err, "results": _results, "stdout": _buf.getvalue()}, default=str)
`

self.onmessage = async (e) => {
  const m = e.data
  try {
    if (m.type === 'init') {
      pyodide = await loadPyodide({ indexURL: `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/` })
      pyodide.runPython(m.judgeSrc)
      self.postMessage({ type: 'ready' })
      return
    }
    if (m.type === 'run') {
      pyodide.globals.set('USER_CODE', m.code)
      pyodide.globals.set('SPEC_JSON', m.spec)
      const out = pyodide.runPython(DRIVER)
      self.postMessage({ type: 'result', id: m.id, out })
    }
  } catch (err) {
    self.postMessage({
      type: 'result', id: m.id,
      out: JSON.stringify({ compile_error: String((err && err.stack) || err), results: [], stdout: '' }),
    })
  }
}
