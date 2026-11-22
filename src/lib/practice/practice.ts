import { DefaultScheduler, Rating, type Grade } from 'ts-fsrs'
import { db } from '../db'

export { Rating, type Grade }
export const RATINGS: Grade[] = [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy]
export const ratingLabel = (r: Grade) => ({ 1: 'Again', 2: 'Hard', 3: 'Good', 4: 'Easy' })[r]

const scheduler = DefaultScheduler()
export type SkillCard = ReturnType<Awaited<typeof scheduler>['newCard']>

/** Record one practice attempt of a skill; returns when it is next due. */
export async function review(skill: string, rating: Grade, lessonId: string, now = new Date()): Promise<Date> {
  const s = await scheduler
  const existing = await db.skills.get(skill)
  const card: SkillCard = existing?.card ?? s.newCard({ now })
  const { card: next } = s.review({ card, grade: rating, now })
  await db.transaction('rw', db.skills, db.reviews, async () => {
    await db.skills.put({ id: skill, card: next, due: new Date(next.dueAt), lessonId })
    await db.reviews.add({ skill, rating, at: now })
  })
  return new Date(next.dueAt)
}

export const dueSkills = (now = new Date()) => db.skills.where('due').belowOrEqual(now).toArray()
export const recentReviews = (days: number, now = new Date()) =>
  db.reviews.where('at').above(new Date(now.getTime() - days * 86400000)).toArray()
