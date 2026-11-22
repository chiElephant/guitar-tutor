import { Marked } from 'marked'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** Markdown → HTML. Special fenced blocks become placeholders that Lesson.svelte hydrates. */
const marked = new Marked({
  renderer: {
    code({ text, lang }) {
      if (lang === 'chords') return `<div class="chords" data-chords="${esc(text.trim())}"></div>`
      if (lang === 'alphatex') return `<div class="tex" data-tex="${esc(text)}"></div>`
      if (lang === 'fretboard') return `<div class="fretboard" data-spec="${esc(text)}"></div>`
      return `<pre><code>${esc(text)}</code></pre>`
    },
    link({ href, text }) {
      if (href.startsWith('piece:')) return `<a href="#" class="piece" data-piece="${esc(href.slice(6))}">${text}</a>`
      return `<a href="${esc(href)}" target="_blank" rel="noopener">${text}</a>`
    },
  },
})

export const renderMarkdown = (src: string) => marked.parse(src) as string

/** `key: value` lines of a fretboard block. */
export function parseSpec(text: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of text.split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return out
}
