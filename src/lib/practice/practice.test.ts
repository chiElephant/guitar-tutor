import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { Rating, review, dueSkills } from './practice'

describe('practice log', () => {
  it('schedules a skill into the future and tracks what is due', async () => {
    const now = new Date('2026-01-01T10:00:00Z')
    expect(await dueSkills(now)).toHaveLength(0)
    const due = await review('chord-em', Rating.Good, 'grade-1/x', now)
    expect(due.getTime()).toBeGreaterThan(now.getTime())
    expect(await dueSkills(now)).toHaveLength(0)
    expect(await dueSkills(new Date(due.getTime() + 1))).toHaveLength(1)
    const later = await review('chord-em', Rating.Easy, 'grade-1/x', due)
    expect(later.getTime()).toBeGreaterThan(due.getTime())
  })
})
