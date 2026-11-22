import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import * as alphaTab from '@coderline/alphatab'
import { parseLesson } from './catalog'
import { chords } from './chords'
import { scaleDots } from './scales'
import { parseSpec } from './render'

// Every bundled lesson must render: this is the contributor's safety net for alphaTex typos.
const root = 'content/lessons'
const files = readdirSync(root, { recursive: true }).map(String).filter((f) => /grade-\d\/.*\.md$/.test(f))
const blocks = (body: string, lang: string) => [...body.matchAll(new RegExp('```' + lang + '\\n([\\s\\S]*?)```', 'g'))].map((m) => m[1])

describe.each(files)('%s', (file) => {
  const lesson = parseLesson(file, readFileSync(`${root}/${file}`, 'utf8'))
  it('has front matter', () => {
    expect(lesson.grade).toBeGreaterThan(0)
    expect(lesson.title).not.toBe(file)
  })
  it('alphaTex parses', () => {
    for (const tex of blocks(lesson.body, 'alphatex')) expect(() => alphaTab.importer.ScoreLoader.loadAlphaTex(tex)).not.toThrow()
  })
  it('chords, fretboards and piece links resolve', () => {
    for (const b of blocks(lesson.body, 'chords')) for (const name of b.trim().split(/\s+/)) expect(chords, name).toHaveProperty(name)
    for (const b of blocks(lesson.body, 'fretboard')) {
      const s = parseSpec(b)
      const [from, to] = s.frets.split('-').map(Number)
      expect(scaleDots(s.root, s.scale, from, to).length).toBeGreaterThan(0)
    }
    for (const m of lesson.body.matchAll(/\(piece:([^)]+)\)/g))
      expect(existsSync(`content/tabs/${m[1]}.musicxml`) || existsSync(`content/tabs/${m[1]}.alphatex`), m[1]).toBe(true)
  })
})
