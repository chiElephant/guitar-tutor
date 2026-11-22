<script lang="ts">
  import { onMount } from 'svelte'
  import * as alphaTab from '@coderline/alphatab'
  import { createApi } from '../alphatab'
  import type { Piece } from '../library/catalog'
  import Recorder from '../recorder/Recorder.svelte'

  let { piece, onback }: { piece: Piece; onback: () => void } = $props()

  let host: HTMLElement
  let api: alphaTab.AlphaTabApi
  let ready = $state(false)
  let playing = $state(false)
  let tracks = $state<{ name: string; muted: boolean }[]>([])
  let speed = $state(1)
  let loop = $state(false)
  let metronome = $state(false)
  let countIn = $state(false)
  let error = $state('')

  onMount(() => {
    api = createApi(host)
    api.playerReady.on(() => (ready = true))
    api.playerStateChanged.on((e) => (playing = e.state === alphaTab.synth.PlayerState.Playing))
    api.scoreLoaded.on((score) => {
      // MusicXML tab staves import as tab-only with a 6-line "notation" staff; show both staves properly.
      for (const staff of score.tracks.flatMap((t) => t.staves)) {
        if (staff.tuning.length) {
          staff.showStandardNotation = true
          staff.standardNotationLineCount = 5
        }
      }
      tracks = score.tracks.map((t) => ({ name: t.name || `Track ${t.index + 1}`, muted: false }))
    })
    api.error.on((e) => (error = String(e)))
    if (piece.kind === 'tex') api.tex(piece.data as string)
    else api.load(piece.kind === 'bytes' ? new Uint8Array(piece.data as ArrayBuffer) : piece.data)
    return () => api.destroy()
  })

  $effect(() => { if (api) api.playbackSpeed = speed })
  $effect(() => { if (api) api.isLooping = loop })
  $effect(() => { if (api) api.metronomeVolume = metronome ? 1 : 0 })
  $effect(() => { if (api) api.countInVolume = countIn ? 1 : 0 })

  function toggleMute(i: number) {
    tracks[i].muted = !tracks[i].muted
    api.changeTrackMute([api.score!.tracks[i]], tracks[i].muted)
  }
</script>

<div class="toolbar">
  <button onclick={onback}>‹ Library</button>
  <button onclick={() => api.playPause()} disabled={!ready}>{ready ? (playing ? 'Pause' : 'Play') : 'Loading…'}</button>
  <button onclick={() => api.stop()} disabled={!ready}>Stop</button>
  <label>Tempo <input type="range" min="0.25" max="1.5" step="0.05" bind:value={speed} /> {Math.round(speed * 100)}%</label>
  <label><input type="checkbox" bind:checked={loop} /> Loop</label>
  <label><input type="checkbox" bind:checked={metronome} /> Metronome</label>
  <label><input type="checkbox" bind:checked={countIn} /> Count-in</label>
  {#if tracks.length > 1}
    {#each tracks as t, i (i)}
      <label><input type="checkbox" checked={!t.muted} onchange={() => toggleMute(i)} /> {t.name}</label>
    {/each}
  {/if}
</div>
<p class="hint">Drag across bars on the score to pick a section; Loop repeats it.</p>
{#if error}<p class="error">{error}</p>{/if}
<Recorder pieceId={piece.id} title={piece.title} onstart={() => api.play()} onstop={() => api.stop()} />
<div bind:this={host}></div>
