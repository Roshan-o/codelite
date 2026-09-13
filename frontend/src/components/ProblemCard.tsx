import type { Problem } from '../types/problem'
import { DifficultyBadge } from './DifficultyBadge'

export function ProblemCard({ problem, onOpen }: { problem: Problem; onOpen: (id: number) => void }) {
  return (
    <article className="problem-card card" onClick={() => onOpen(problem.id)}>
      <div className="problem-meta">
        <DifficultyBadge difficulty={problem.difficulty} />
        <span>#{problem.id}</span>
      </div>
      <h2>{problem.title}</h2>
      <p>{problem.description}</p>
      <div className="tag-list">
        {problem.tags.length ? (
          problem.tags.map((tag) => <span key={`${problem.id}-${tag}`}>{tag}</span>)
        ) : (
          <span>No tags</span>
        )}
      </div>
    </article>
  )
}
