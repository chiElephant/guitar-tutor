<script lang="ts">
  import { liveQuery } from 'dexie'
  import { bundled, db, importFile, type Piece } from './catalog'

  let { onopen, onnew }: { onopen: (p: Piece) => void; onnew: () => void } = $props()
  let query = $state('')
  const imports = liveQuery(() => db.imports.toArray())

  const local = $derived<Piece[]>(
    ($imports ?? []).map((r) => ({ id: `local-${r.id}`, title: r.name, composer: 'Imported', kind: 'bytes', data: r.data, local: r.id })),
  )
  const match = (p: Piece) => `${p.title} ${p.composer}`.toLowerCase().includes(query.toLowerCase())
  const shown = $derived([...local, ...bundled].filter(match))

  async function onfile(e: Event) {
    const input = e.currentTarget as HTMLInputElement
    for (const f of input.files ?? []) await importFile(f)
    input.value = ''
  }
</script>

<div class="toolbar">
  <input type="search" placeholder="Search title or composer" bind:value={query} />
  <button onclick={onnew}>New tab</button>
  <label class="button primary">
    Import file
    <input type="file" accept=".gp,.gp3,.gp4,.gp5,.gpx,.musicxml,.xml,.mxl,.alphatex" multiple onchange={onfile} hidden />
  </label>
</div>
<p class="hint">Imported files stay on this device. Guitar Pro, MusicXML and alphaTex are supported.</p>

<ul class="pieces">
  {#each shown as p (p.id)}
    <li>
      <button class="row" onclick={() => onopen(p)}>
        <span class="title">{p.title}</span>
        <span class="composer">{p.composer}</span>
      </button>
      {#if p.local}
        <button class="delete" title="Remove import" onclick={() => db.imports.delete(p.local!)}>✕</button>
      {/if}
    </li>
  {:else}
    <li class="hint">No pieces match.</li>
  {/each}
</ul>
