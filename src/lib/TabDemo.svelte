<script lang="ts">
  import { onMount } from 'svelte'
  import * as alphaTab from '@coderline/alphatab'
  import odeToJoy from '../../content/tabs/ode-to-joy.alphatex?raw'

  let host: HTMLElement
  let api: alphaTab.AlphaTabApi
  let ready = $state(false)
  let playing = $state(false)

  onMount(() => {
    api = new alphaTab.AlphaTabApi(host, {
      player: {
        playerMode: alphaTab.PlayerMode.EnabledAutomatic,
        soundFont: '/soundfont/sonivox.sf3',
        scrollElement: 'html',
      },
    })
    api.playerReady.on(() => (ready = true))
    api.playerStateChanged.on((e) => (playing = e.state === alphaTab.synth.PlayerState.Playing))
    api.tex(odeToJoy)
    return () => api.destroy()
  })
</script>

<!-- A user gesture is required before audio can start (iOS); the click provides it. -->
<button onclick={() => api.playPause()} disabled={!ready}>
  {ready ? (playing ? 'Pause' : 'Play') : 'Loading sounds…'}
</button>
<div bind:this={host}></div>
