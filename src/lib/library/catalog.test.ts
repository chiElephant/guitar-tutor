import { describe, expect, it } from 'vitest'
import { parseTexMeta } from './catalog'

describe('parseTexMeta', () => {
  it('reads quoted and bare values', () => {
    expect(parseTexMeta('\\title "Ode to Joy"\n\\artist "Beethoven"\n.')).toEqual({ title: 'Ode to Joy', composer: 'Beethoven' })
    expect(parseTexMeta("\\title 'A B' \\artist Trad .")).toEqual({ title: 'A B', composer: 'Trad' })
  })
  it('tolerates missing fields', () => {
    expect(parseTexMeta('. 3.3.4')).toEqual({})
  })
})
