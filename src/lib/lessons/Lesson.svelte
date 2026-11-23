<script lang="ts">
  import { onMount } from 'svelte'
  import { SVGuitarChord } from 'svguitar'
  import * as alphaTab from '@coderline/alphatab'
  import { createApi } from '../alphatab'
  import type { Lesson } from './catalog'
  import { chords } from './chords'
  import { fretboardSvg } from './scales'
  import { parseSpec, renderMarkdown } from './render'
  import { RATINGS, ratingLabel, review, type Grade } from '../practice/practice'

  let { lesson, onback, onpiece }: { lesson: Lesson; onback: () => void; onpiece: (slug: string) => void } = $props()
  let host: HTMLElement
  let next = $state<Record<string, Date>>({})
  const html = $derived(renderMarkdown(lesson.body))

  onMount(() => {
    const apis: alphaTab.AlphaTabApi[] = []
    for (const el of host.querySelectorAll<HTMLElement>('.chords')) {
      for (const name of el.dataset.chords!.split(/\s+/)) {
        const shape = chords[name]
        const box = el.appendChild(document.createElement('figure'))
        if (!shape) { box.textContent = `? ${name}`; continue }
        new SVGuitarChord(box).chord({ ...shape, title: name }).configure({ frets: 4, fretSize: 1.2, fingerSize: 0.6, titleFontSize: 48, color: '#ece9f7', fingerColor: '#d7ff3c', fingerTextColor: '#151a00' }).draw()
      }
    }
    for (const el of host.querySelectorAll<HTMLElement>('.fretboard')) {
      const s = parseSpec(el.dataset.spec!)
      const [from, to] = (s.frets ?? '0-12').split('-').map(Number)
      try { el.innerHTML = fretboardSvg(s.root ?? 'A', s.scale ?? 'minor pentatonic', from, to) } catch (e) { el.textContent = String(e) }
    }
    for (const el of host.querySelectorAll<HTMLElement>('.tex')) {
      const button = el.appendChild(document.createElement('button'))
      button.className = 'primary'
      button.textContent = 'Play'
      button.disabled = true
      const score = el.appendChild(document.createElement('div'))
      const api = createApi(score)
      api.playerReady.on(() => (button.disabled = false))
      api.playerStateChanged.on((e) => (button.textContent = e.state === alphaTab.synth.PlayerState.Playing ? 'Pause' : 'Play'))
      button.onclick = () => api.playPause()
      api.tex(el.dataset.tex!)
      apis.push(api)
    }
    const onclick = (e: Event) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>('a.piece')
      if (a) { e.preventDefault(); onpiece(a.dataset.piece!) }
    }
    host.addEventListener('click', onclick)
    return () => { apis.forEach((a) => a.destroy()); host.removeEventListener('click', onclick) }
  })

  async function rate(skill: string, r: Grade) {
    next[skill] = await review(skill, r, lesson.id)
  }
  const inDays = (d: Date) => Math.max(0, Math.round((d.getTime() - Date.now()) / 86400000))
</script>

<div class="toolbar">
  <button class="back" onclick={onback}>‹ Lessons</button>
  <span class="hint">Grade {lesson.grade} · Module {lesson.module} · {lesson.minutes} min</span>
</div>
<article bind:this={host}>
  <h2>{lesson.title}</h2>
  {@html html}
</article>

{#if lesson.skills.length}
  <section class="rate">
    <h3>How did it go?</h3>
    <p class="hint">Rate each skill; the Practice tab brings it back when it is due.</p>
    {#each lesson.skills as skill (skill)}
      <div class="skill">
        <span>{skill}</span>
        {#if next[skill]}
          <span class="hint">again in {inDays(next[skill])} day{inDays(next[skill]) === 1 ? '' : 's'}</span>
        {:else}
          {#each RATINGS as r (r)}<button onclick={() => rate(skill, r)}>{ratingLabel(r)}</button>{/each}
        {/if}
      </div>
    {/each}
  </section>
{/if}
