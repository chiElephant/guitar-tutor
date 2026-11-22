import { describe, expect, it } from 'vitest'
import { concat, encodeWav, trimStart } from './wav'

describe('wav', () => {
  it('writes a valid 16-bit mono header', async () => {
    const blob = encodeWav(new Float32Array([0, 1, -1, 0.5]), 48000)
    const v = new DataView(await blob.arrayBuffer())
    expect(blob.size).toBe(44 + 8)
    expect(String.fromCharCode(...new Uint8Array(v.buffer, 0, 4))).toBe('RIFF')
    expect(v.getUint16(22, true)).toBe(1) // mono
    expect(v.getUint32(24, true)).toBe(48000)
    expect(v.getInt16(46, true)).toBe(32767)
    expect(v.getInt16(48, true)).toBe(-32768)
  })
  it('concatenates and trims', () => {
    const s = concat([new Float32Array([1, 2]), new Float32Array([3, 4, 5])])
    expect([...s]).toEqual([1, 2, 3, 4, 5])
    expect([...trimStart(s, 0.002, 1000)]).toEqual([3, 4, 5])
    expect(trimStart(s, 10, 1000).length).toBe(0)
    expect(trimStart(s, -1, 1000).length).toBe(5)
  })
})
