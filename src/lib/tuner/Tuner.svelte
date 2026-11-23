<script lang="ts">
  import { onDestroy } from 'svelte'
  import { closeInput, listInputs, openInput, type Input } from '../audio/input'
  import { PitchReader, type Note } from './pitch'

  let devices = $state<MediaDeviceInfo[]>([])
  let deviceId = $state('')
  let input = $state<Input | null>(null)
  let note = $state<Note | null>(null)
  let error = $state('')
  let frame = 0
  let heldUntil = 0

  async function start() {
    error = ''
    try {
      stop()
      input = await openInput(deviceId || undefined)
      devices = await listInputs() // labels are available now that permission is granted
      const reader = new PitchReader(input.analyser, input.context.sampleRate)
      const tick = () => {
        const n = reader.read()
        const now = performance.now()
        if (n) { note = n; heldUntil = now + 400 } // hold the needle briefly after the string decays
        else if (now > heldUntil) note = null
        frame = requestAnimationFrame(tick)
      }
      tick()
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    }
  }

  function stop() {
    cancelAnimationFrame(frame)
    if (input) closeInput(input)
    input = null
    note = null
  }

  onDestroy(stop)

  const inTune = $derived(note !== null && Math.abs(note.cents) <= 3)
</script>

<section>
  <div class="dial" class:good={inTune}>
    <div class="scale"><span>-50</span><span>0</span><span>+50</span></div>
    <div class="needle" style:transform={`rotate(${(note?.cents ?? 0) * 0.9}deg)`}></div>
    <div class="note">{note ? `${note.name}${note.octave}` : '—'}</div>
    <div class="cents">{note ? `${note.cents > 0 ? '+' : ''}${note.cents} cents · ${note.hz.toFixed(1)} Hz` : 'play a string'}</div>
  </div>

  <div class="controls">
    <select bind:value={deviceId} onchange={() => input && start()}>
      <option value="">Default input</option>
      {#each devices as d (d.deviceId)}
        <option value={d.deviceId}>{d.label || 'Input'}</option>
      {/each}
    </select>
    {#if input}
      <button class="primary" onclick={stop}>Stop</button>
    {:else}
      <button class="primary" onclick={start}>Start tuner</button>
    {/if}
  </div>
  {#if input}<p class="hint">Listening on: {input.label} at {input.context.sampleRate / 1000} kHz</p>{/if}
  {#if error}<p class="error">{error}</p>{/if}

  <details>
    <summary>Which input is my guitar?</summary>
    <ul>
      <li><b>No interface:</b> leave "Default input" and play near the microphone.</li>
      <li><b>USB interface (Scarlett, UM2, iRig…):</b> plug it in first, press Start, then pick it in the list. Use the interface's <b>input 1</b>; some browsers only hear the left channel.</li>
      <li><b>iPhone/iPad in Safari:</b> USB interfaces are ignored by the browser and the built-in mic is used. The App Store version routes the interface correctly.</li>
      <li>Nothing showing? The browser needs the mic permission once before it lists input names.</li>
    </ul>
  </details>
</section>
