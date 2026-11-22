import { db } from '../db'

export type Piece = {
  id: string
  title: string
  composer: string
  /** 'tex' = alphaTex text, 'url' = file alphaTab fetches itself, 'bytes' = imported file */
  kind: 'tex' | 'url' | 'bytes'
  data: string | ArrayBuffer
  local?: number
}

type Meta = { title?: string; composer?: string }

const tex = import.meta.glob('/content/tabs/*.alphatex', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const files = import.meta.glob('/content/tabs/*.{musicxml,xml,gp,gp3,gp4,gp5,gpx}', { query: '?url', import: 'default', eager: true }) as Record<string, string>
const metas = import.meta.glob('/content/tabs/*.json', { eager: true, import: 'default' }) as Record<string, Meta>

/** Pulls \title and \artist out of alphaTex without parsing the whole thing. */
export function parseTexMeta(src: string): Meta {
  const meta: Meta = {}
  for (const m of src.matchAll(/\\(title|artist)\s+(?:"([^"]*)"|'([^']*)'|(\S+))/g)) {
    const value = m[2] ?? m[3] ?? m[4]
    if (m[1] === 'title') meta.title = value
    else meta.composer = value
  }
  return meta
}

const slug = (path: string) => path.replace(/^.*\/|\.[^.]+$/g, '')

export const bundled: Piece[] = [
  ...Object.entries(tex).map(([path, src]) => {
    const m = parseTexMeta(src)
    return { id: slug(path), title: m.title ?? slug(path), composer: m.composer ?? '', kind: 'tex' as const, data: src }
  }),
  ...Object.entries(files).map(([path, url]) => {
    const m = metas[path.replace(/\.[^.]+$/, '.json')] ?? {}
    return { id: slug(path), title: m.title ?? slug(path), composer: m.composer ?? '', kind: 'url' as const, data: url }
  }),
].sort((a, b) => a.title.localeCompare(b.title))

export { db }

export async function importFile(file: File) {
  await db.imports.add({ name: file.name.replace(/\.[^.]+$/, ''), data: await file.arrayBuffer() })
}
