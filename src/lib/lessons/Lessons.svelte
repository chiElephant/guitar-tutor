<script lang="ts">
  import { lessons, type Lesson } from './catalog'

  let { onopen }: { onopen: (l: Lesson) => void } = $props()

  const grades = $derived(
    [1, 2, 3].map((g) => {
      const inGrade = lessons.filter((l) => l.grade === g)
      const modules = [...new Set(inGrade.map((l) => l.module))].map((m) => ({ m, items: inGrade.filter((l) => l.module === m) }))
      return { g, modules }
    }),
  )
</script>

{#each grades as { g, modules } (g)}
  <h2>Grade {g}</h2>
  {#if !modules.length}<p class="hint">Coming soon.</p>{/if}
  {#each modules as { m, items } (m)}
    {#if m > 0}<h3>Module {m}</h3>{/if}
    <ul class="pieces">
      {#each items as l (l.id)}
        <li><button class="row" onclick={() => onopen(l)}><span class="title">{l.title}</span><span class="composer">{l.minutes ? `${l.minutes} min` : ''}</span></button></li>
      {/each}
    </ul>
  {/each}
{/each}
