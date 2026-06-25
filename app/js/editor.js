let loadPromise = null

function ensureMonaco() {
  if (loadPromise) return loadPromise
  loadPromise = new Promise((resolve, reject) => {
    if (typeof window.require === 'undefined') {
      reject(new Error('Monaco loader not found'))
      return
    }
    window.require.config({
      paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' }
    })
    window.require(['vs/editor/editor.main'], () => resolve(window.monaco), reject)
  })
  return loadPromise
}

export async function makeEditor(el, language, value = '') {
  const monaco = await ensureMonaco()
  const editor = monaco.editor.create(el, {
    value,
    language,
    theme: 'vs',
    fontSize: 14,
    automaticLayout: true,
    minimap: { enabled: false },
    tabSize: 4,
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    lineNumbers: 'on',
    renderLineHighlight: 'line',
  })
  return editor
}
