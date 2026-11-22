import Dexie, { type EntityTable } from 'dexie'
import type { SkillCard } from './practice/practice'

/** Everything the user creates stays on this device (see BLUEPRINT.md 2.2, 2.6). */
export const db = new Dexie('guitar-tutor') as Dexie & {
  imports: EntityTable<{ id: number; name: string; data: ArrayBuffer }, 'id'>
  skills: EntityTable<{ id: string; card: SkillCard; due: Date; lessonId: string }, 'id'>
  reviews: EntityTable<{ id: number; skill: string; rating: number; at: Date }, 'id'>
  takes: EntityTable<{ id: number; pieceId: string; title: string; at: Date; seconds: number; wav: Blob }, 'id'>
}
db.version(1).stores({ imports: '++id, name' })
db.version(2).stores({ imports: '++id, name', skills: 'id, due', reviews: '++id, skill, at' })
db.version(3).stores({ imports: '++id, name', skills: 'id, due', reviews: '++id, skill, at', takes: '++id, pieceId, at' })
