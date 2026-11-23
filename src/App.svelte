<script lang="ts">
  import Tuner from './lib/tuner/Tuner.svelte'
  import Library from './lib/library/Library.svelte'
  import Player from './lib/player/Player.svelte'
  import Lessons from './lib/lessons/Lessons.svelte'
  import Lesson from './lib/lessons/Lesson.svelte'
  import Practice from './lib/practice/Practice.svelte'
  import Record from './lib/recorder/Record.svelte'
  import Editor from './lib/editor/Editor.svelte'
  import { bundled, type Piece } from './lib/library/catalog'
  import type { Lesson as LessonT } from './lib/lessons/catalog'

  type View = 'lessons' | 'library' | 'tuner' | 'record' | 'practice'
  const tabs: [View, string, string, string][] = [
    ['lessons', 'Lessons', 'Learn at your own pace', 'A clear path from your first notes to the songs you want to play.'],
    ['library', 'Tabs', 'Your music library', 'Find a tune, or bring in a file from your own collection.'],
    ['tuner', 'Tuner', 'Get in tune', 'Play one string at a time. Tune when the needle settles in the centre.'],
    ['record', 'Record', 'Capture and replay', 'Record from your mic or interface. Open a tab to record alongside its playback.'],
    ['practice', 'Practice', 'Spaced review', 'Return to skills you have rated when they come due.'],
  ]
  let view = $state<View>('lessons')
  let piece = $state<Piece | null>(null)
  let lesson = $state<LessonT | null>(null)
  let editing = $state(false)

  function go(v: View) { view = v; piece = null; lesson = null; editing = false }
  function openLesson(l: LessonT) { view = 'lessons'; lesson = l }
  function openPieceSlug(slug: string) {
    const p = bundled.find((b) => b.id === slug)
    if (p) { view = 'library'; piece = p }
  }
</script>

<header>
  <div class="brand"><span class="mark">♪</span><div><h1>Guitar Tutor</h1><small>Your practice room</small></div></div>
  <nav>
    {#each tabs as [v, label] (v)}<button class:active={view === v} onclick={() => go(v)}>{label}</button>{/each}
  </nav>
  <p class="local">Local first: your imports, recordings and practice history stay on this device.</p>
</header>
<main>
  {#if !piece && !lesson && !editing}
    {@const [, label, kicker, tagline] = tabs.find((t) => t[0] === view)!}
    <hgroup><p class="kicker">{kicker}</p><h2>{label}</h2><p>{tagline}</p></hgroup>
  {/if}
  {#if view === 'tuner'}
    <Tuner />
  {:else if view === 'record'}
    <Record />
  {:else if view === 'practice'}
    <Practice onopen={openLesson} />
  {:else if view === 'lessons'}
    {#if lesson}
      {#key lesson.id}<Lesson {lesson} onback={() => (lesson = null)} onpiece={openPieceSlug} />{/key}
    {:else}
      <Lessons onopen={(l) => (lesson = l)} />
    {/if}
  {:else if piece}
    {#key piece.id}<Player {piece} onback={() => (piece = null)} />{/key}
  {:else if editing}
    <Editor onback={() => (editing = false)} />
  {:else}
    <Library onopen={(p) => (piece = p)} onnew={() => (editing = true)} />
  {/if}
</main>
