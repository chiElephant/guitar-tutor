type Finger = [number, number | 'x']
export type Shape = { fingers: Finger[]; barres: { fromString: number; toString: number; fret: number }[] }

const x = 'x' as const
// String 1 = high e, string 6 = low E (same as svguitar and alphaTex). Fret 0 = open.
const open = (frets: (number | 'x')[]): Shape => ({ fingers: frets.map((f, i) => [6 - i, f] as Finger), barres: [] })
const barre = (fret: number, from: number, frets: (number | 'x')[]): Shape => ({
  fingers: frets.map((f, i) => [6 - i, f] as Finger).filter(([, f]) => f === x || (f as number) > fret),
  barres: [{ fromString: from, toString: 1, fret }],
})

/** Frets listed low E → high e. */
export const chords: Record<string, Shape> = {
  Em: open([0, 2, 2, 0, 0, 0]),
  Am: open([x, 0, 2, 2, 1, 0]),
  D: open([x, x, 0, 2, 3, 2]),
  A: open([x, 0, 2, 2, 2, 0]),
  E: open([0, 2, 2, 1, 0, 0]),
  G: open([3, 2, 0, 0, 0, 3]),
  C: open([x, 3, 2, 0, 1, 0]),
  Dm: open([x, x, 0, 2, 3, 1]),
  F: barre(1, 6, [1, 3, 3, 2, 1, 1]),
  B7: open([x, 2, 1, 2, 0, 2]),
  A7: open([x, 0, 2, 0, 2, 0]),
  D7: open([x, x, 0, 2, 1, 2]),
  E7: open([0, 2, 0, 1, 0, 0]),
  G7: open([3, 2, 0, 0, 0, 1]),
  C7: open([x, 3, 2, 3, 1, 0]),
  Asus2: open([x, 0, 2, 2, 0, 0]),
  Asus4: open([x, 0, 2, 2, 3, 0]),
  Dsus2: open([x, x, 0, 2, 3, 0]),
  Dsus4: open([x, x, 0, 2, 3, 3]),
  Esus4: open([0, 2, 2, 2, 0, 0]),
  E5: open([0, 2, 2, x, x, x]),
  A5: open([x, 0, 2, 2, x, x]),
  D5: open([x, x, 0, 2, 3, x]),
  G5: open([3, 5, 5, x, x, x]),
  Am7: open([x, 0, 2, 0, 1, 0]),
  Em7: open([0, 2, 0, 0, 0, 0]),
  Cmaj7: open([x, 3, 2, 0, 0, 0]),
  Fmaj7: open([x, x, 3, 2, 1, 0]),
  Cadd9: open([x, 3, 2, 0, 3, 3]),
  Bm: barre(2, 5, [x, 2, 4, 4, 3, 2]),
  'F#m': barre(2, 6, [2, 4, 4, 2, 2, 2]),
  Bb: barre(1, 5, [x, 1, 3, 3, 3, 1]),
  Gm: barre(3, 6, [3, 5, 5, 3, 3, 3]),
}
