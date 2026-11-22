<script lang="ts">
  import { onMount } from 'svelte'
  import { createApi } from '../alphatab'
  import type * as alphaTab from '@coderline/alphatab'
  import { db } from '../db'
  import { parseTexMeta } from '../library/catalog'
  import { CONTENT_BRANCH, REPO_URL } from '../config'
  import { asciiToTex, looksLikeAsciiTab } from './ascii'

  const STARTER = `\\title "My tune"\n\\artist "Me"\n\\tempo 100\n.\n\\ts 4 4\n0.1.4 1.2 0.3 2.4 | (0.1 1.2 0.3 2.4 3.5).2 r.2 |\n`

  let { initial = STARTER, onback }: { initial?: string; onback: () => void } = $props()
  // svelte-ignore state_referenced_locally
  let text = $state(initial)
  let error = $state('')
  let status = $state('')
  let name = $state(localStorage.getItem('contributorName') ?? '')
  let attest = $state(false)
  let host: HTMLElement
  let api: alphaTab.AlphaTabApi

  onMount(() => {
    api = createApi(host)
    api.error.on((e) => (error = String(e).replace(/^.*?:\s*/, '')))
    api.renderStarted.on(() => (error = ''))
    return () => api.destroy()
  })

  // Re-render the preview 400 ms after the last keystroke.
  $effect(() => {
    const t = text
    const id = setTimeout(() => api?.tex(t), 400)
    return () => clearTimeout(id)
  })
  $effect(() => localStorage.setItem('contributorName', name))

  const meta = $derived(parseTexMeta(text))
  const slug = $derived((meta.title ?? 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
  const isAscii = $derived(looksLikeAsciiTab(text))

  async function save() {
    await db.imports.add({ name: meta.title ?? 'Untitled', data: new TextEncoder().encode(text).buffer as ArrayBuffer })
    status = 'Saved to your library (Tabs → Imported).'
  }

  async function propose() {
    const credit = `\\copyright "CC BY-SA 4.0, contributed by ${name.replace(/"/g, "'")}"\n`
    const body = text.includes('\\copyright') ? text : credit + text
    const base = `${REPO_URL}/new/${CONTENT_BRANCH}/content/tabs?filename=${slug}.alphatex`
    const full = `${base}&value=${encodeURIComponent(body)}`
    if (full.length < 7500) {
      window.open(full, '_blank', 'noopener')
      status = 'GitHub opened with your tab prefilled. Commit it there to open a pull request.'
    } else {
      await navigator.clipboard.writeText(body)
      window.open(base, '_blank', 'noopener')
      status = 'Tab copied to your clipboard (too long for a link). Paste it into the GitHub editor that opened.'
    }
  }
</script>

<div class="toolbar">
  <button onclick={onback}>‹ Library</button>
  <button onclick={() => (text = asciiToTex(text, meta.title))} disabled={!isAscii} title="Turns pasted ASCII tab into alphaTex">Convert ASCII tab</button>
  <button onclick={save}>Save to my library</button>
  <a href="https://alphatab.net/docs/alphatex/introduction" target="_blank" rel="noopener">alphaTex reference</a>
</div>
<p class="hint">Paste an ASCII tab or write alphaTex. Note = fret.string (string 1 = high e), add .4 .8 for durations, | for bars.</p>

<div class="editor">
  <textarea bind:value={text} spellcheck="false" rows="14"></textarea>
  <div class="preview">
    {#if error}<p class="error">{error}</p>{/if}
    <div bind:this={host}></div>
  </div>
</div>

<section class="propose">
  <h3>Share it with everyone</h3>
  <p class="hint">Proposed tabs go into the shared library by pull request under CC BY-SA 4.0. Only music you wrote, public-domain works, or arrangements of public-domain works are accepted; tabs of copyrighted songs are not.</p>
  <label>Your name for the credit <input bind:value={name} placeholder="Name or handle" /></label>
  <label><input type="checkbox" bind:checked={attest} /> I wrote this or it is public domain / CC-licensed, and I license my contribution under CC BY-SA 4.0.</label>
  <button onclick={propose} disabled={!attest || !name.trim() || !!error}>Propose "{meta.title ?? 'untitled'}" on GitHub</button>
  {#if status}<p class="hint">{status}</p>{/if}
</section>
