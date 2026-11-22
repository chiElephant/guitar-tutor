import { describe, expect, it } from 'vitest'
import { parseLesson } from './catalog'
import { scaleDots, pitchClass } from './scales'
import { renderMarkdown } from './render'
import { chords } from './chords'

describe('parseLesson', () => {
  it('reads front matter and strips it from the body', () => {
    const l = parseLesson('grade-1/x', '---\ntitle: Hi: there\ngrade: 1\nmodule: 2\norder: 3\nskills: a, b\n---\nBody')
    expect(l).toMatchObject({ title: 'Hi: there', grade: 1, module: 2, order: 3, skills: ['a', 'b'], body: 'Body' })
  })
  it('survives missing front matter', () => {
    expect(parseLesson('x', 'Just text').body).toBe('Just text')
  })
})

describe('scales', () => {
  it('finds the A minor pentatonic box 1', () => {
    const dots = scaleDots('A', 'minor pentatonic', 5, 8)
    expect(dots.filter((d) => d.string === 6).map((d) => d.fret)).toEqual([5, 8])
    expect(dots.filter((d) => d.root).map((d) => [d.string, d.fret])).toEqual([[1, 5], [4, 7], [6, 5]])
    expect(pitchClass('Bb')).toBe(pitchClass('A#'))
  })
})

describe('renderMarkdown', () => {
  it('turns special blocks and piece links into placeholders', () => {
    const html = renderMarkdown('```chords\nEm Am\n```\n[Play](piece:the-kesh)')
    expect(html).toContain('data-chords="Em Am"')
    expect(html).toContain('data-piece="the-kesh"')
  })
})

it('every chord shape has six strings', () => {
  for (const [name, shape] of Object.entries(chords)) {
    const strings = new Set(shape.fingers.map(([s]) => s))
    shape.barres.forEach((b) => { for (let s = b.toString; s <= b.fromString; s++) strings.add(s) })
    expect(strings.size, name).toBe(6)
  }
})
