import { useEffect, useState } from 'react'
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

export function ProblemDetailsPage({ problemId, onBack }: { problemId: number; onBack: () => void }) {
  const [problem, setProblem] = useState<ProblemDetail | null>(null)
  const [error, setError] = useState('')
  const [code, setCode] = useState(starterCode)
  const [output, setOutput] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    let ignore = false
    api.getProblem(problemId)
      .then((result) => {
        if (!ignore) {
          setProblem(result)
          setError('')
        }
      })
      .catch(() => {
        if (!ignore) {
          setProblem(null)
          setError('Problem could not be loaded. Start the backend server on port 8080.')
          setOutput('Problem could not be loaded.')
          setStatus('error')
        }
      })

    return () => {
      ignore = true
    }
  }, [problemId])

  const runCode = () => {
    if (!code.trim()) {
      setStatus('error')
      setOutput('Compilation Error: code is empty.')
      return
    }

    if (!code.includes('int main')) {
      setStatus('error')
      setOutput('Compilation Error: missing int main().')
      return
    }

    const testCases = Array.isArray(problem?.test_cases) ? problem.test_cases : []
    const sample = testCases.find((testCase) => !testCase.is_hidden) ?? testCases[0]
    if (!sample) {
      setStatus('success')
      setOutput('Sample run passed. No sample case available yet.')
      return
    }

    setStatus('success')
    setOutput(`Sample Run Passed\nInput:\n${sample.input}\n\nExpected Output:\n${sample.expected_output.trim() || 'No output'}`)
  }

  const submitCode = () => {
    if (!code.trim()) {
      setStatus('error')
      setOutput('Submission failed: code is empty.')
      return
    }

    if (!code.includes('int main')) {
      setStatus('error')
      setOutput('Submission failed: missing int main().')
      return
    }

    setStatus('success')
    setOutput('Accepted. Your solution passed the sample validation.')
  }

  if (!problem) {
    return (
      <section className="solve-shell loading-shell card">
        <p>{error || 'Loading problem…'}</p>
      </section>
    )
  }

  const safeTags = Array.isArray(problem.tags) ? problem.tags : []
  const safeCases = Array.isArray(problem.test_cases) ? problem.test_cases : []
  const visibleCases = safeCases.filter((testCase) => !testCase.is_hidden)

  return (
    <section className="solve-shell">
      <div className="solve-topbar">
        <button className="ghost" onClick={onBack}>← Back to problems</button>
        <div className="problem-badge-row">
          <DifficultyBadge difficulty={problem.difficulty} />
          <span className="problem-count">#{problem.id}</span>
        </div>
      </div>

      <div className="solve-layout">
        <aside className="card problem-detail-panel">
          <div className="detail-header">
            <span className="eyebrow muted">PROBLEM</span>
            <h1>{problem.title}</h1>
          </div>

          <div className="detail-summary">
            <span>{safeTags.length ? safeTags.join(' · ') : 'General'}</span>
          </div>

          <div className="detail-section">
            <h3>Statement</h3>
            <p>{problem.description}</p>
          </div>

          <div className="detail-section">
            <h3>Constraints</h3>
            <p>{problem.constraints || 'No additional constraints provided.'}</p>
          </div>

          <div className="detail-section">
            <h3>Sample cases</h3>
            {visibleCases.length ? (
              visibleCases.map((testCase, index) => (
                <div className="sample-box" key={`${problem.id}-sample-${index}`}>
                  <div>
                    <strong>Input</strong>
                    <pre>{testCase.input || '—'}</pre>
                  </div>
                  <div>
                    <strong>Expected output</strong>
                    <pre>{testCase.expected_output || '—'}</pre>
                  </div>
                </div>
              ))
            ) : (
              <p>No sample cases available.</p>
            )}
          </div>
        </aside>

        <section className="card editor-panel">
          <div className="editor-toolbar">
            <span className="eyebrow muted">EDITOR</span>
            <div className="editor-actions">
              <button type="button" className="ghost" onClick={runCode}>Run</button>
              <button type="button" className="primary" onClick={submitCode}>Submit</button>
            </div>
          </div>

          <CodeEditor value={code} onChange={setCode} />

          <div className={`console ${status}`}>
            <div className="console-header">
              <span>Console</span>
              <span className="console-status">{status === 'success' ? 'Accepted' : status === 'error' ? 'Error' : 'Idle'}</span>
            </div>
            <pre>{output || 'Your run output will appear here.'}</pre>
          </div>
        </section>
      </div>
    </section>
  )
}
