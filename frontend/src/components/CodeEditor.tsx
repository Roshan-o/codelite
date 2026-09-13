export function CodeEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <textarea
      className="code-editor"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      spellCheck={false}
    />
  )
}
