import { describe, expect, it } from 'vitest'
import * as alphaTab from '@coderline/alphatab'
import { asciiToTex, looksLikeAsciiTab } from './ascii'

const sample = `
Intro
e|-------0-----|-0-----------|
B|-----1---1---|-1-----------|
G|---2-------2-|-0----12-----|
D|-2-----------|-2-----------|
A|-------------|-3-----------|
E|-------------|-------------|
`

describe('asciiToTex', () => {
  it('detects tab blocks', () => {
    expect(looksLikeAsciiTab(sample)).toBe(true)
    expect(looksLikeAsciiTab('just some words\nand more')).toBe(false)
  })
  it('emits notes per column, chords as groups, bars, and two-digit frets', () => {
    const tex = asciiToTex(sample, 'Test')
    expect(tex).toContain('\\title "Test"')
    expect(tex).toContain(':8 2.4 2.3 1.2 0.1 1.2 2.3 | (0.1 1.2 0.3 2.4 3.5) 12.3 |')
  })
  it('parses with alphaTab', () => {
    const score = alphaTab.importer.ScoreLoader.loadAlphaTex(asciiToTex(sample))
    expect(score.masterBars.length).toBe(2)
  })
})
