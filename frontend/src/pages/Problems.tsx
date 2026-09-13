import type { Problem } from '../types/problem'
import { ProblemCard } from '../components/ProblemCard'

export function ProblemsPage({
  problems,
  error,
  search,
  onSearch,
  difficultyFilter,
  onDifficultyChange,
  onAddProblem,
  onOpenProblem,
}: {
  problems: Problem[]
  error?: string
  search: string
  onSearch: (value: string) => void
  difficultyFilter: 'ALL' | Problem['difficulty']
  onDifficultyChange: (value: 'ALL' | Problem['difficulty']) => void
  onAddProblem: () => void
  onOpenProblem: (id: number) => void
}) {
  return (
    <section className="problem-panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow muted">PROBLEMS</span>
          <h1>Explore challenges</h1>
        </div>
        <button className="primary" onClick={onAddProblem}>+ Add problem</button>
      </div>

      <div className="toolbar">
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search by title, tag, or keyword"
          aria-label="Search problems"
        />
        <select
          value={difficultyFilter}
          onChange={(event) => onDifficultyChange(event.target.value as 'ALL' | Problem['difficulty'])}
          aria-label="Filter by difficulty"
        >
          <option value="ALL">All difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {error && <p className="message">{error}</p>}

      <div className="grid">
        {problems.map((problem) => (
          <ProblemCard key={problem.id} problem={problem} onOpen={onOpenProblem} />
        ))}

        {!problems.length && !error && (
          <div className="empty-state card">
            <h3>No matching problems yet</h3>
            <p>Try a different search term or add a new challenge.</p>
          </div>
        )}
      </div>
    </section>
  )
}
