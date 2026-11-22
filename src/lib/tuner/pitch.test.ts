import { describe, expect, it } from 'vitest'
import { PitchDetector } from 'pitchy'
import { noteFromFrequency } from './pitch'

const SR = 48000
const sine = (hz: number, n = 4096) =>
  Float32Array.from({ length: n }, (_, i) => 0.5 * Math.sin((2 * Math.PI * hz * i) / SR))

describe('noteFromFrequency', () => {
  it('names the open strings', () => {
    expect(noteFromFrequency(82.41)).toMatchObject({ name: 'E', octave: 2, cents: 0 })
    expect(noteFromFrequency(110)).toMatchObject({ name: 'A', octave: 2, cents: 0 })
    expect(noteFromFrequency(329.63)).toMatchObject({ name: 'E', octave: 4, cents: 0 })
  })
  it('reports sharp and flat in cents', () => {
    expect(noteFromFrequency(440 * 2 ** (10 / 1200)).cents).toBe(10)
    expect(noteFromFrequency(440 * 2 ** (-25 / 1200)).cents).toBe(-25)
  })
})

describe('pitchy on a 4096-sample window', () => {
  it('finds low E within a cent', () => {
    const d = PitchDetector.forFloat32Array(4096)
    const [hz, clarity] = d.findPitch(sine(82.41), SR)
    expect(clarity).toBeGreaterThan(0.9)
    expect(Math.abs(noteFromFrequency(hz).cents)).toBeLessThanOrEqual(1)
  })
})
