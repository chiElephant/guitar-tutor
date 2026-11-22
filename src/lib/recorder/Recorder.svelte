<script lang="ts">
  import { liveQuery } from 'dexie'
  import { db } from '../db'
  import { closeInput, openInput, type Input } from '../audio/input'
  import { Recorder } from './recorder'
  import { concat, encodeWav, trimStart } from './wav'

  let { pieceId = '', title = 'Free recording', onstart, onstop }:
    { pieceId?: string; title?: string; onstart?: () => void; onstop?: () => void } = $props()

  let input = $state<Input | null>(null)
  let error = $state('')
  let startedAt = 0
  const recorder = new Recorder()
  // Extra sync nudge the user can set after listening back; the device estimate is added on top.
  let nudgeMs = $state(Number(localStorage.getItem('syncNudgeMs') ?? 0))
  $effect(() => localStorage.setItem('syncNudgeMs', String(nudgeMs)))

  const takes = liveQuery(() => (pieceId ? db.takes.where('pieceId').equals(pieceId) : db.takes.orderBy('at')).reverse().toArray())
  const urls = new Map<number, string>()
  const url = (id: number, wav: Blob) => urls.get(id) ?? (urls.set(id, URL.createObjectURL(wav)), urls.get(id)!)

  async function start() {
    error = ''
    try {
      input = await openInput()
      await recorder.start(input)
      startedAt = performance.now()
      onstart?.()
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
      if (input) closeInput(input)
      input = null
    }
  }

  async function stop() {
    if (!input) return
    onstop?.()
    const { chunks, sampleRate, latency } = recorder.stop(input)
    closeInput(input)
    input = null
    const samples = trimStart(concat(chunks), latency + nudgeMs / 1000, sampleRate)
    if (!samples.length) return
    await db.takes.add({ pieceId, title, at: new Date(), seconds: samples.length / sampleRate, wav: encodeWav(samples, sampleRate) })
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
</script>

<div class="toolbar">
  {#if input}
    <button class="rec on" onclick={stop}>■ Stop</button>
    <span class="hint">Recording from {input.label}…</span>
  {:else}
    <button class="rec" onclick={start}>● Record{pieceId ? ' with playback' : ''}</button>
  {/if}
  <label>Sync nudge <input type="number" step="5" bind:value={nudgeMs} style="width:5em" /> ms</label>
</div>
{#if error}<p class="error">{error}</p>{/if}

{#if $takes?.length}
  <ul class="takes">
    {#each $takes as t (t.id)}
      <li>
        <span class="title">{t.title}<br /><small class="hint">{t.at.toLocaleString()} · {fmt(t.seconds)}</small></span>
        <audio controls preload="none" src={url(t.id, t.wav)}></audio>
        <a href={url(t.id, t.wav)} download={`${t.title}-${t.at.toISOString().slice(0, 16)}.wav`}>WAV</a>
        <button class="delete" title="Delete take" onclick={() => db.takes.delete(t.id)}>✕</button>
      </li>
    {/each}
  </ul>
{:else}
  <p class="hint">No takes yet. Takes stay on this device; download the WAV to keep one elsewhere.</p>
{/if}
