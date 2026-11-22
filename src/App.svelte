<script lang="ts">
  import Tuner from './lib/tuner/Tuner.svelte'
  import Library from './lib/library/Library.svelte'
  import Player from './lib/player/Player.svelte'
  import Lessons from './lib/lessons/Lessons.svelte'
  import Lesson from './lib/lessons/Lesson.svelte'
  import Practice from './lib/practice/Practice.svelte'
  import { bundled, type Piece } from './lib/library/catalog'
  import type { Lesson as LessonT } from './lib/lessons/catalog'

  type View = 'lessons' | 'library' | 'tuner' | 'practice'
  const tabs: [View, string][] = [['lessons', 'Lessons'], ['library', 'Tabs'], ['tuner', 'Tuner'], ['practice', 'Practice']]
  let view = $state<View>('lessons')
  let piece = $state<Piece | null>(null)
  let lesson = $state<LessonT | null>(null)

  function go(v: View) { view = v; piece = null; lesson = null }
  function openLesson(l: LessonT) { view = 'lessons'; lesson = l }
  function openPieceSlug(slug: string) {
    const p = bundled.find((b) => b.id === slug)
    if (p) { view = 'library'; piece = p }
  }
</script>

<header>
  <h1>Guitar Tutor</h1>
  <nav>
    {#each tabs as [v, label] (v)}<button class:active={view === v} onclick={() => go(v)}>{label}</button>{/each}
  </nav>
</header>
<main>
  {#if view === 'tuner'}
    <Tuner />
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
  {:else}
    <Library onopen={(p) => (piece = p)} />
  {/if}
</main>
