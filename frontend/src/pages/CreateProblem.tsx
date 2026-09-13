import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../services/api'
import type { Problem, ProblemInput, TestCaseInput } from '../types/problem'

const makeTestCase = (): TestCaseInput => ({ input: '', expected_output: '', is_hidden: false })
const makeProblem = (): ProblemInput => ({
  title: '',
  description: '',
  difficulty: 'EASY',
  constraints: '',
  tags: [],
  test_cases: [makeTestCase()],
})

export function CreateProblemPage({ token, onCreated }: { token: string; onCreated: (problem: Problem) => void }) {
  const [data, setData] = useState<ProblemInput>(makeProblem())
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const updateField = <K extends keyof ProblemInput>(key: K, value: ProblemInput[K]) => {
    setData((current) => ({ ...current, [key]: value }))
  }

  const updateTestCase = (index: number, field: keyof TestCaseInput, value: string | boolean) => {
    setData((current) => {
      const nextCases = [...current.test_cases]
      nextCases[index] = { ...nextCases[index], [field]: value }
      return { ...current, test_cases: nextCases }
    })
  }

  const addTestCase = () => {
    setData((current) => ({ ...current, test_cases: [...current.test_cases, makeTestCase()] }))
  }

  const removeTestCase = (index: number) => {
    setData((current) => {
      if (current.test_cases.length === 1) return current
      return { ...current, test_cases: current.test_cases.filter((_, i) => i !== index) }
    })
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const trimmedTitle = data.title.trim()
    const trimmedDescription = data.description.trim()
    const cleanedCases = data.test_cases.map((testCase) => ({
      input: testCase.input.trim(),
      expected_output: testCase.expected_output.trim(),
      is_hidden: testCase.is_hidden,
    }))

    if (!trimmedTitle || !trimmedDescription) {
      setError('Title and description are required.')
      return
    }

    const hasValidCases = cleanedCases.some((testCase) => testCase.input && testCase.expected_output)
    if (!hasValidCases) {
      setError('Add at least one complete test case with input and expected output.')
      return
    }

    setSaving(true)

    try {
      const payload: ProblemInput = {
        ...data,
        title: trimmedTitle,
        description: trimmedDescription,
        constraints: data.constraints.trim(),
        tags: data.tags.map((tag) => tag.trim()).filter(Boolean),
        test_cases: cleanedCases,
      }

      const created = await api.createProblem(payload, token)
      onCreated(created)
      setData(makeProblem())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create problem')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="editor-layout">
      <form className="card create-form" onSubmit={submit}>
        <div className="panel-header compact">
          <div>
            <span className="eyebrow muted">NEW PROBLEM</span>
            <h1>Create a challenge</h1>
          </div>
        </div>

        {error && <p className="message">{error}</p>}

        <label>
          Title
          <input
            value={data.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="Example: Two Sum"
            required
          />
        </label>

        <label>
          Description
          <textarea
            value={data.description}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="Write the full problem statement..."
            required
          />
        </label>

        <div className="inline-grid">
          <label>
            Difficulty
            <select
              value={data.difficulty}
              onChange={(event) => updateField('difficulty', event.target.value as Problem['difficulty'])}
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </label>

          <label>
            Tags
            <input
              value={data.tags.join(', ')}
              onChange={(event) =>
                updateField(
                  'tags',
                  event.target.value
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                )
              }
              placeholder="array, graphs, dynamic-programming"
            />
          </label>
        </div>

        <label>
          Constraints
          <textarea
            value={data.constraints}
            onChange={(event) => updateField('constraints', event.target.value)}
            placeholder="Example: 1 <= n <= 10^5"
          />
        </label>

        <div className="test-case-header">
          <h3>Test cases</h3>
          <button type="button" className="ghost" onClick={addTestCase}>+ Add test case</button>
        </div>

        <div className="test-case-list">
          {data.test_cases.map((testCase, index) => (
            <div className="test-case-card" key={`test-case-${index}`}>
              <div className="case-topline">
                <span>Case {index + 1}</span>
                {data.test_cases.length > 1 && (
                  <button type="button" className="remove-button" onClick={() => removeTestCase(index)}>
                    Remove
                  </button>
                )}
              </div>

              <label>
                Input
                <textarea
                  value={testCase.input}
                  onChange={(event) => updateTestCase(index, 'input', event.target.value)}
                  placeholder="Input for the test case"
                />
              </label>

              <label>
                Expected output
                <textarea
                  value={testCase.expected_output}
                  onChange={(event) => updateTestCase(index, 'expected_output', event.target.value)}
                  placeholder="Expected result"
                />
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={testCase.is_hidden}
                  onChange={(event) => updateTestCase(index, 'is_hidden', event.target.checked)}
                />
                Mark as hidden test case
              </label>
            </div>
          ))}
        </div>

        <button className="primary submit-button" type="submit" disabled={saving}>
          {saving ? 'Publishing...' : 'Publish problem'}
        </button>
      </form>

      <aside className="card preview-panel">
        <span className="eyebrow-label">PREVIEW</span>
        <h2>{data.title || 'Untitled problem'}</h2>
        <p className="preview-difficulty"><span className={`pill difficulty-${data.difficulty.toLowerCase()}`}>{data.difficulty}</span></p>
        <div className="preview-block">
          <h4>Problem statement</h4>
          <p>{data.description || 'Your problem description will appear here.'}</p>
        </div>
        <div className="preview-block">
          <h4>Constraints</h4>
          <p>{data.constraints || 'No constraints added yet.'}</p>
        </div>
        <div className="preview-block">
          <h4>Tags</h4>
          <div className="tag-list">
            {data.tags.length ? data.tags.map((tag) => <span key={tag}>{tag}</span>) : <span>No tags</span>}
          </div>
        </div>
        <div className="preview-block">
          <h4>Test cases</h4>
          <ul className="preview-tests">
            {data.test_cases.map((testCase, index) => (
              <li key={`preview-${index}`}>
                <strong>#{index + 1}</strong>
                <span>{testCase.is_hidden ? 'Hidden' : 'Visible'}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </section>
  )
}
