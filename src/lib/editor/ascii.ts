/**
 * ASCII tab → alphaTex. Six-line systems, top line = high e (string 1), every note an eighth.
 * shortcut: rhythm is not recoverable from ASCII tab and techniques (h p / \ b ~) are dropped;
 * the user fixes durations in the editor afterwards.
 */
const TAB_LINE = /^\s*[a-gA-G]?[#b]?\s*\|?[-0-9hpbrx/\\~|()\s]*-[-0-9hpbrx/\\~|()\s]*$/

export function looksLikeAsciiTab(text: string): boolean {
  return findSystems(text.split('\n')).length > 0
}

function findSystems(lines: string[]): string[][] {
  const systems: string[][] = []
  let run: string[] = []
  for (const line of [...lines, '']) {
    if (TAB_LINE.test(line) && line.includes('-')) run.push(line)
    else {
      if (run.length >= 6) systems.push(run.slice(0, 6))
      run = []
    }
  }
  return systems
}

/** Strip the "e|" prefix so column 0 is the first fret column on every string. */
const body = (line: string) => line.replace(/^\s*[a-gA-G]?[#b]?\s*\|?/, '')

export function asciiToTex(text: string, title = 'Imported ASCII tab'): string {
  const out: string[] = []
  for (const system of findSystems(text.split('\n'))) {
    const rows = system.map(body)
    const width = Math.min(...rows.map((r) => r.length))
    const starts = new Map<number, string[]>() // column → notes starting there
    rows.forEach((row, s) => {
      for (let c = 0; c < width; c++) {
        if (!/\d/.test(row[c]) || (c > 0 && /\d/.test(row[c - 1]))) continue
        const two = /\d/.test(row[c + 1] ?? '') && Number(row.slice(c, c + 2)) <= 24
        const fret = two ? row.slice(c, c + 2) : row[c]
        if (!starts.has(c)) starts.set(c, [])
        starts.get(c)!.push(`${fret}.${s + 1}`)
      }
    })
    for (let c = 0; c < width; c++) {
      if (rows[0][c] === '|' && out.length && out[out.length - 1] !== '|') out.push('|')
      const notes = starts.get(c)
      if (notes) out.push(notes.length === 1 ? notes[0] : `(${notes.join(' ')})`)
    }
    if (out[out.length - 1] !== '|') out.push('|')
  }
  return `\\title "${title.replace(/"/g, "'")}"\n.\n:8 ${out.join(' ')}\n`
}
