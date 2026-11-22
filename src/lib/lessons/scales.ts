const NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
const FLATS: Record<string, string> = { Db: 'C♯', Eb: 'D♯', Gb: 'F♯', Ab: 'G♯', Bb: 'A♯' }
export const SCALES: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  'natural minor': [0, 2, 3, 5, 7, 8, 10],
  'major pentatonic': [0, 2, 4, 7, 9],
  'minor pentatonic': [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
}
/** Open-string pitch classes, string 1 (high e) first. */
const OPEN = [4, 11, 7, 2, 9, 4]

export function pitchClass(name: string): number {
  const n = FLATS[name] ?? name.replace('#', '♯')
  const i = NAMES.indexOf(n)
  if (i < 0) throw new Error(`unknown note ${name}`)
  return i
}

export type Dot = { string: number; fret: number; name: string; root: boolean }

export function scaleDots(root: string, scale: string, from: number, to: number): Dot[] {
  const r = pitchClass(root)
  const steps = SCALES[scale]
  if (!steps) throw new Error(`unknown scale ${scale}`)
  const dots: Dot[] = []
  OPEN.forEach((openPc, i) => {
    for (let fret = from; fret <= to; fret++) {
      const pc = (openPc + fret) % 12
      if (steps.includes((pc - r + 12) % 12)) dots.push({ string: i + 1, fret, name: NAMES[pc], root: pc === r })
    }
  })
  return dots
}

/** Horizontal fretboard, string 1 on top, as an SVG string. */
export function fretboardSvg(root: string, scale: string, from: number, to: number): string {
  const dots = scaleDots(root, scale, from, to)
  const fw = 44, sh = 22, left = 24, top = 14
  const n = to - from + 1
  const w = left + n * fw + 8, h = top + 5 * sh + 28
  const fx = (fret: number) => left + (fret - from + 0.5) * fw
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" class="fb" role="img" aria-label="${root} ${scale}, frets ${from} to ${to}">`
  for (let i = 0; i <= n; i++) s += `<line x1="${left + i * fw}" y1="${top}" x2="${left + i * fw}" y2="${top + 5 * sh}" stroke="#999" stroke-width="${from + i === 0 ? 4 : 1}"/>`
  for (let i = 0; i < 6; i++) s += `<line x1="${left}" y1="${top + i * sh}" x2="${left + n * fw}" y2="${top + i * sh}" stroke="#666"/>`
  for (let fret = from; fret <= to; fret++) s += `<text x="${fx(fret)}" y="${h - 8}" font-size="11" text-anchor="middle" fill="#666">${fret}</text>`
  for (const d of dots)
    s += `<circle cx="${fx(d.fret)}" cy="${top + (d.string - 1) * sh}" r="9" fill="${d.root ? '#c33' : '#2a6fdb'}"/><text x="${fx(d.fret)}" y="${top + (d.string - 1) * sh + 4}" font-size="10" text-anchor="middle" fill="#fff">${d.name}</text>`
  return s + '</svg>'
}
