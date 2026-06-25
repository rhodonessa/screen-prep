const PREFIX = 'jdp:'
const DRAFT_PREFIX = 'jdp:draft:'

export function getProgress(id) {
  try {
    const raw = localStorage.getItem(PREFIX + id)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function recordAttempt(id, kind, passPct) {
  const prev = getProgress(id) || { attempts: 0, solved: false, bestPct: 0, lastSeen: null }
  const next = {
    attempts: prev.attempts + 1,
    solved: prev.solved || passPct === 100,
    bestPct: Math.max(prev.bestPct, passPct),
    lastSeen: Date.now(),
    kind,
  }
  try {
    localStorage.setItem(PREFIX + id, JSON.stringify(next))
  } catch {}
  return next
}

export function allProgress() {
  const out = {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX) && !k.startsWith(DRAFT_PREFIX)) {
        const id = k.slice(PREFIX.length)
        out[id] = JSON.parse(localStorage.getItem(k))
      }
    }
  } catch {}
  return out
}

export function saveDraft(id, code) {
  try {
    localStorage.setItem(DRAFT_PREFIX + id, code)
  } catch {}
}

export function loadDraft(id) {
  try {
    return localStorage.getItem(DRAFT_PREFIX + id) || null
  } catch { return null }
}

export function resetAll() {
  const toRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(PREFIX)) toRemove.push(k)
  }
  toRemove.forEach(k => localStorage.removeItem(k))
}
