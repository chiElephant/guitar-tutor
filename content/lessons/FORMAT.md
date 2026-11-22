# Lesson format

One Markdown file per lesson at `content/lessons/grade-<g>/<module>-<order>-<slug>.md`, CC BY-SA 4.0.

```
---
title: Your first two chords
grade: 1
module: 2
order: 1
minutes: 15
skills: chord-em, chord-am, change-em-am
---
Body in Markdown. Keep paragraphs short; one idea each.
```

Front matter keys: `title`, `grade` (1–3), `module` (number within the grade), `order`
(lesson number within the module), `minutes` (rough practice time), `skills` (comma-separated
ids this lesson teaches; the practice log tracks them with spaced repetition; reuse the same id
across lessons that practise the same skill).

Special fenced blocks:

- ```` ```chords ```` — space-separated chord names, rendered as diagrams. Available names:
  `Em Am D A E G C Dm F B7 A7 D7 E7 G7 C7 Asus2 Asus4 Dsus2 Dsus4 Esus4 E5 A5 D5 G5 Am7 Em7
  Cmaj7 Fmaj7 Cadd9 Bm F#m Bb Gm`.
- ```` ```alphatex ```` — an [alphaTex](https://alphatab.net/docs/alphatex/introduction) snippet,
  rendered as notation + tab with a play button. Example of a strummed Em bar in 4/4:
  `\ts 4 4 (0.1 0.2 0.3 2.4 2.5 0.6).4 (0.1 0.2 0.3 2.4 2.5 0.6).4 (0.1 0.2 0.3 2.4 2.5 0.6).4 (0.1 0.2 0.3 2.4 2.5 0.6).4 |`
  (note = fret.string, string 1 = high e; `.4` quarter, `.8` eighth; `r.4` rest; `|` barline).
- ```` ```fretboard ```` — `root: A`, `scale: minor pentatonic | major | natural minor | major pentatonic | blues`,
  `frets: 5-8` (range shown). Renders a fretboard with the scale notes.

Link to a library piece with `[Play The Kesh](piece:the-kesh)`; the slug is the file name in
`content/tabs/`. Only public-domain or CC-licensed songs may be named as repertoire.
