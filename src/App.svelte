<script lang="ts">
  import Tuner from './lib/tuner/Tuner.svelte'
  import Library from './lib/library/Library.svelte'
  import Player from './lib/player/Player.svelte'
  import type { Piece } from './lib/library/catalog'

  let view = $state<'tuner' | 'library'>('library')
  let piece = $state<Piece | null>(null)
</script>

<header>
  <h1>Guitar Tutor</h1>
  <nav>
    <button class:active={view === 'tuner'} onclick={() => (view = 'tuner')}>Tuner</button>
    <button class:active={view === 'library'} onclick={() => ((view = 'library'), (piece = null))}>Tabs</button>
  </nav>
</header>
<main>
  {#if view === 'tuner'}
    <Tuner />
  {:else if piece}
    {#key piece.id}<Player {piece} onback={() => (piece = null)} />{/key}
  {:else}
    <Library onopen={(p) => (piece = p)} />
  {/if}
</main>
