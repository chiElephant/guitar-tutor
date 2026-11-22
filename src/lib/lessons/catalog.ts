export type Lesson = {
  id: string
  title: string
  grade: number
  module: number
  order: number
  minutes: number
  skills: string[]
  body: string
}

const files = import.meta.glob('/content/lessons/grade-*/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

/** Front matter is `key: value` lines between `---` fences; skills are comma-separated. */
export function parseLesson(id: string, src: string): Lesson {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(src)
  const meta: Record<string, string> = {}
  for (const line of (m?.[1] ?? '').split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return {
    id,
    title: meta.title ?? id,
    grade: Number(meta.grade ?? 0),
    module: Number(meta.module ?? 0),
    order: Number(meta.order ?? 0),
    minutes: Number(meta.minutes ?? 0),
    skills: (meta.skills ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    body: src.slice(m?.[0].length ?? 0),
  }
}

export const lessons: Lesson[] = Object.entries(files)
  .map(([path, src]) => parseLesson(path.replace(/^\/content\/lessons\/|\.md$/g, ''), src))
  .sort((a, b) => a.grade - b.grade || a.module - b.module || a.order - b.order)

export const lessonById = (id: string) => lessons.find((l) => l.id === id)
export const lessonForSkill = (skill: string) => lessons.find((l) => l.skills.includes(skill))
