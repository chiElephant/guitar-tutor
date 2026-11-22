# Contributing

Thanks for helping build a free guitar tutor. Everything here is open: code under AGPL-3.0,
lessons and tabs under CC BY-SA 4.0.

## What we accept

- **Tabs and sheet music** of public-domain works, Creative Commons works (BY, BY-SA, CC0), or
  music you wrote yourself. A work is public domain when the composer *and* the arranger have
  been dead for 70+ years, or it was published in the US before 1931. When in doubt, say where
  it came from in the pull request.
- **Not accepted:** tabs, chord charts or arrangements of songs still in copyright, even
  partial, even "for education". They are derivative works and we cannot license them.
- **Lessons** in your own words. Do not paste or closely paraphrase other courses or books.

## Adding a tab

1. In the app: Tabs → New tab. Write alphaTex or paste an ASCII tab and press Convert.
   Tick the license box and press Propose; GitHub opens with the file prefilled.
2. By hand: add `content/tabs/<slug>.alphatex` (or `.musicxml` plus a `<slug>.json` sidecar
   with `title`, `composer`, `source`, `license`, `attribution`).
3. Run `npm test`. It parses every tab and lesson and fails on typos.

## Adding a lesson

See `content/lessons/FORMAT.md`. Put the file under `content/lessons/grade-<n>/` and declare
the skills it teaches so the practice scheduler can track them.

## Pull request checklist

- Source and license named for any music that is not your own.
- `npm test` and `npm run check` pass.
- One tab or lesson per pull request keeps review quick.

## Takedowns

If you believe something here infringes your rights, see [TAKEDOWN.md](TAKEDOWN.md).
