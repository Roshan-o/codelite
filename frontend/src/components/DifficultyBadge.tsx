import type { Difficulty } from '../types/problem'

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <span className={`pill difficulty-${difficulty.toLowerCase()}`}>{difficulty}</span>
}
