<script lang="ts">
  import { liveQuery } from 'dexie'
  import { db } from '../db'
  import { lessonById, lessonForSkill, type Lesson } from '../lessons/catalog'

  let { onopen }: { onopen: (l: Lesson) => void } = $props()
  const skills = liveQuery(() => db.skills.toArray())
  const reviews = liveQuery(() => db.reviews.where('at').above(new Date(Date.now() - 7 * 86400000)).toArray())

  const now = new Date()
  const due = $derived(($skills ?? []).filter((s) => s.due <= now))
  const upcoming = $derived(($skills ?? []).filter((s) => s.due > now).sort((a, b) => a.due.getTime() - b.due.getTime()).slice(0, 10))
  const days = $derived(new Set(($reviews ?? []).map((r) => r.at.toDateString())).size)
  const lessonFor = (s: { id: string; lessonId: string }) => lessonById(s.lessonId) ?? lessonForSkill(s.id)
</script>

<p class="hint">{($skills ?? []).length} skills started · practised on {days} of the last 7 days</p>

<h3>Due now</h3>
{#if !due.length}<p class="hint">Nothing due. Open a lesson and rate its skills to start tracking.</p>{/if}
<ul class="pieces">
  {#each due as s (s.id)}
    {@const l = lessonFor(s)}
    <li><button class="row" onclick={() => l && onopen(l)}><span class="title">{s.id}</span><span class="composer">{l?.title ?? ''}</span></button></li>
  {/each}
</ul>

{#if upcoming.length}
  <h3>Coming up</h3>
  <ul class="pieces">
    {#each upcoming as s (s.id)}
      <li><button class="row" onclick={() => { const l = lessonFor(s); l && onopen(l) }}><span class="title">{s.id}</span><span class="composer">{s.due.toLocaleDateString()}</span></button></li>
    {/each}
  </ul>
{/if}
