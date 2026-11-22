<script lang="ts">
  import Tuner from './lib/tuner/Tuner.svelte'
  import TabDemo from './lib/TabDemo.svelte'

  let view = $state<'tuner' | 'tabs'>('tuner')
</script>

<header>
  <h1>Guitar Tutor</h1>
  <nav>
    <button class:active={view === 'tuner'} onclick={() => (view = 'tuner')}>Tuner</button>
    <button class:active={view === 'tabs'} onclick={() => (view = 'tabs')}>Tabs</button>
  </nav>
</header>
<main>
  {#if view === 'tuner'}<Tuner />{:else}<TabDemo />{/if}
</main>
