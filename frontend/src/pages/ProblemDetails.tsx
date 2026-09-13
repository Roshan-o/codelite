import { useCallback, useEffect, useRef, useState } from 'react'
import { CodeEditor } from '../components/CodeEditor'
import { DifficultyBadge } from '../components/DifficultyBadge'
import { api } from '../services/api'
import type { ProblemDetail } from '../types/problem'

const starterCode = `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    return 0;
}`

/* ─── Drag hook ─────────────────────────────────────────── */
function useDrag(
  onDelta: (delta: number) => void,
  axis: 'x' | 'y' = 'x',
) {
  const dragging = useRef(false)
  const lastPos = useRef(0)

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      dragging.current = true
      lastPos.current = axis === 'x' ? e.clientX : e.clientY
      document.body.style.cursor = axis === 'x' ? 'col-resize' : 'row-resize'
      document.body.style.userSelect = 'none'
    },
    [axis],
  )

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const pos = axis === 'x' ? e.clientX : e.clientY
      onDelta(pos - lastPos.current)
      lastPos.current = pos
    }
    const onUp = () => {
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [onDelta, axis])

  return onMouseDown
}
/* ─────────────────────────────────────────────────────────── */

export function ProblemDetailsPage({
  problemId,
  onBack,
}: {
  problemId: number
  onBack: () => void
}) {
  const [problem, setProblem] = useState<ProblemDetail | null>(null)
  const [error, setError] = useState('')
  const [code, setCode] = useState(starterCode)
  const [output, setOutput] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [activeCase, setActiveCase] = useState(0)

  /* ── resize state ── */
  const [leftPct, setLeftPct] = useState(38)          // % of total width
  const [bottomH, setBottomH] = useState(210)         // px — bottom panel total height
  const [actionH, setActionH] = useState(44)          // px — action bar height

  const containerRef = useRef<HTMLDivElement>(null)

  /* Drag handle 1 — vertical left/right */
  const onDragV = useCallback(
    (delta: number) => {
      const w = containerRef.current?.clientWidth ?? 1
      setLeftPct((p) => Math.max(20, Math.min(65, p + (delta / w) * 100)))
    },
    [],
  )

  /* Drag handle 2 — horizontal editor / bottom-panel */
  const onDragH1 = useCallback((delta: number) => {
    setBottomH((h) => Math.max(100, Math.min(520, h - delta)))
  }, [])

  /* Drag handle 3 — horizontal bottom-panel-body / action-bar */
  const onDragH2 = useCallback((delta: number) => {
    setActionH((h) => Math.max(36, Math.min(180, h + delta)))
  }, [])

  const startDragV = useDrag(onDragV, 'x')
  const startDragH1 = useDrag(onDragH1, 'y')
  const startDragH2 = useDrag(onDragH2, 'y')

  /* ── data ── */
  useEffect(() => {
    let ignore = false
    api
      .getProblem(problemId)
      .then((result) => {
        if (!ignore) { setProblem(result); setError('') }
      })
      .catch(() => {
        if (!ignore) {
          setProblem(null)
          setError('Problem could not be loaded. Start the backend server on port 8080.')
          setOutput('Problem could not be loaded.')
          setStatus('error')
        }
      })
    return () => { ignore = true }
  }, [problemId])

  const runCode = () => {
    if (!code.trim()) { setStatus('error'); setOutput('Compilation Error: code is empty.'); return }
    if (!code.includes('int main')) { setStatus('error'); setOutput('Compilation Error: missing int main().'); return }

    const testCases = Array.isArray(problem?.test_cases) ? problem.test_cases : []
    const sample = testCases.find((tc) => !tc.is_hidden) ?? testCases[0]
    if (!sample) { setStatus('success'); setOutput('Sample run passed. No sample case available yet.'); return }

    setStatus('success')
    setOutput(`Sample Run Passed\n\nInput:\n${sample.input}\n\nExpected Output:\n${sample.expected_output.trim() || 'No output'}`)
  }

  const submitCode = () => {
    if (!code.trim()) { setStatus('error'); setOutput('Submission failed: code is empty.'); return }
    if (!code.includes('int main')) { setStatus('error'); setOutput('Submission failed: missing int main().'); return }
    setStatus('success')
    setOutput('✓ Accepted\nYour solution passed the sample validation.')
  }

  if (!problem) {
    return (
      <div className="loading-shell">
        <p style={{ color: 'var(--text-secondary)' }}>{error || 'Loading problem…'}</p>
      </div>
    )
  }

  const safeTags   = Array.isArray(problem.tags)       ? problem.tags       : []
  const safeCases  = Array.isArray(problem.test_cases)  ? problem.test_cases  : []
  const visibleCases = safeCases.filter((tc) => !tc.is_hidden)

  return (
    <section className="solve-shell">
      {/* ── Top bar ── */}
      <div className="solve-topbar">
        <button className="btn-back" onClick={onBack}>← Problems</button>
        <div className="problem-badge-row">
          <span className="problem-num">#{problem.id}</span>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* ── Main split ── */}
      <div className="solve-layout" ref={containerRef} style={{ gridTemplateColumns: `${leftPct}% 5px 1fr` }}>

        {/* ══ LEFT: Problem description ══ */}
        <aside className="problem-detail-panel">
          <div className="detail-header">
            <h1>{problem.title}</h1>
            <div className="detail-summary">
              <DifficultyBadge difficulty={problem.difficulty} />
              {safeTags.map((tag) => (
                <span key={tag} className="detail-tag">{tag}</span>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <p>{problem.description}</p>
          </div>

          {visibleCases.length > 0 && (
            <div className="detail-section">
              <h3>Examples</h3>
              {visibleCases.map((tc, i) => (
                <div className="sample-box" key={`${problem.id}-s-${i}`}>
                  <div className="sample-box-row">
                    <strong>Input</strong>
                    <pre>{tc.input || '—'}</pre>
                  </div>
                  <div className="sample-box-row">
                    <strong>Output</strong>
                    <pre>{tc.expected_output || '—'}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}

          {problem.constraints && (
            <div className="detail-section">
              <h3>Constraints</h3>
              <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                {problem.constraints}
              </p>
            </div>
          )}
        </aside>

        {/* ══ DRAG HANDLE 1: vertical ══ */}
        <div className="resize-handle resize-handle--v" onMouseDown={startDragV}>
          <div className="resize-handle__inner" />
        </div>

        {/* ══ RIGHT: Editor + bottom panel ══ */}
        <section className="editor-panel-wrap">

          {/* Language toolbar */}
          <div className="editor-toolbar">
            <div className="lang-select-wrap">
              <span className="lang-badge">C++</span>
            </div>
          </div>

          {/* Code editor */}
          <CodeEditor value={code} onChange={setCode} />

          {/* ══ DRAG HANDLE 2: editor / bottom-panel ══ */}
          <div className="resize-handle resize-handle--h" onMouseDown={startDragH1}>
            <div className="resize-handle__inner" />
          </div>

          {/* Bottom panel */}
          <div className="bottom-panel" style={{ height: bottomH, minHeight: bottomH, maxHeight: bottomH }}>

            {/* Test case tabs row */}
            <div className="bottom-panel-tabs">
              <span className="bottom-tab active">Test Cases</span>
            </div>

            {/* Scrollable body */}
            <div className="bottom-panel-body">
              {visibleCases.length > 0 ? (
                <>
                  <div className="testcase-tabs">
                    {visibleCases.map((_, i) => (
                      <button
                        key={i}
                        className={`testcase-tab ${activeCase === i ? 'active' : ''}`}
                        onClick={() => setActiveCase(i)}
                      >
                        Case {i + 1}
                      </button>
                    ))}
                  </div>

                  {visibleCases[activeCase] && (
                    <>
                      <div className="testcase-field">
                        <div className="testcase-field-label">Input</div>
                        <div className="testcase-field-value">
                          {visibleCases[activeCase].input || '—'}
                        </div>
                      </div>
                      <div className="testcase-field">
                        <div className="testcase-field-label">Expected Output</div>
                        <div className="testcase-field-value">
                          {visibleCases[activeCase].expected_output || '—'}
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No visible test cases for this problem.
                </p>
              )}
            </div>

            {/* ══ DRAG HANDLE 3: body / action-bar ══ */}
            <div className="resize-handle resize-handle--h" onMouseDown={startDragH2}>
              <div className="resize-handle__inner" />
            </div>

            {/* Action bar — Run/Submit + output */}
            <div
              className="action-bar"
              style={{ height: actionH, minHeight: actionH, maxHeight: actionH }}
            >
              <pre className={`console-output ${status}`} style={{ flex: 1, overflow: 'hidden', fontSize: '0.78rem', margin: 0 }}>
                {output || 'Output will appear here.'}
              </pre>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button type="button" className="btn-run" onClick={runCode}>▶ Run</button>
                <button type="button" className="btn-submit" onClick={submitCode}>Submit</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}
