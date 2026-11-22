<script lang="ts">
  import SignalsmithStretch from 'signalsmith-stretch'

  let name = $state('')
  let duration = $state(0)
  let position = $state(0)
  let rate = $state(1)
  let semitones = $state(0)
  let loopA = $state(0)
  let loopB = $state(0)
  let playing = $state(false)
  let stretch: Awaited<ReturnType<typeof SignalsmithStretch>> | null = null
  let context: AudioContext | null = null

  async function open(e: Event) {
    const file = (e.currentTarget as HTMLInputElement).files?.[0]
    if (!file) return
    context ??= new AudioContext()
    await context.resume()
    const audio = await context.decodeAudioData(await file.arrayBuffer())
    if (!stretch) {
      stretch = await SignalsmithStretch(context)
      stretch.connect(context.destination)
      stretch.setUpdateInterval(0.1, () => (position = stretch!.inputTime))
    }
    stretch.stop()
    stretch.dropBuffers()
    duration = await stretch.addBuffers(Array.from({ length: audio.numberOfChannels }, (_, c) => audio.getChannelData(c)))
    name = file.name
    loopA = 0; loopB = 0; position = 0; playing = false
    apply()
  }

  function apply() { stretch?.schedule({ rate, semitones, loopStart: loopA, loopEnd: loopB }) }
  $effect(apply)

  function toggle() {
    if (!stretch) return
    playing ? stretch.stop() : stretch.start()
    playing = !playing
  }
  function seek(t: number) { stretch?.schedule({ input: t }) }
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
</script>

<h3>Slow down a recording</h3>
<p class="hint">Open an audio file (mp3, wav, m4a), slow it without changing pitch, or change pitch without changing speed. Set A and B to loop a section.</p>
<div class="toolbar">
  <label class="button">Open audio <input type="file" accept="audio/*" onchange={open} hidden /></label>
  {#if name}
    <button onclick={toggle}>{playing ? 'Pause' : 'Play'}</button>
    <span>{fmt(position)} / {fmt(duration)}</span>
  {/if}
</div>
{#if name}
  <input type="range" min="0" max={duration} step="0.1" value={position} oninput={(e) => seek(Number(e.currentTarget.value))} style="width:100%" />
  <div class="toolbar">
    <label>Speed <input type="range" min="0.4" max="1.2" step="0.05" bind:value={rate} /> {Math.round(rate * 100)}%</label>
    <label>Pitch <input type="range" min="-12" max="12" step="1" bind:value={semitones} /> {semitones > 0 ? '+' : ''}{semitones} st</label>
    <button onclick={() => (loopA = position)}>Set A ({fmt(loopA)})</button>
    <button onclick={() => (loopB = position)}>Set B ({fmt(loopB)})</button>
    <button onclick={() => { loopA = 0; loopB = 0 }} disabled={loopA === loopB}>Clear loop</button>
  </div>
{/if}
