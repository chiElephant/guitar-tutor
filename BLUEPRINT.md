# Guitar Tutor (placeholder name) — Blueprint & Plan

Free, open-source guitar tutor: lessons, tabs/sheet music, tuner, recording, practice tools,
community-contributed content, and "plug your guitar in". Research done 21 Nov 2026 (five
parallel research passes; sources linked inline). Guiding rule: **reuse, don't build.**

---

## 1. One-paragraph decision

Build a **single web app**, shipped three ways: as a PWA, as a free iOS App Store app, and
as a free Google Play app (both via Capacitor, same code). Vite + TypeScript + Svelte 5, **alphaTab** for tab/notation
rendering and playback, **pitchy** in an AudioWorklet for the tuner and note detection,
raw-PCM recording to WAV stored locally (OPFS/IndexedDB), and **no backend at launch**:
community tabs and lessons arrive as pull requests to a content repo. Add **PocketBase**
(one binary) only when users actually need accounts. License the code **AGPL-3.0**, the
content **CC BY-SA 4.0**. Guitar input works via mic everywhere and via USB interfaces on
desktop and Android through the browser. iPhone Safari ignores USB interfaces, so the iOS store
app carries a small native audio-input plugin (~200 lines Swift); that plugin is also what
makes the store app more than a "web wrapper" in Apple's eyes.

---

## 2. Feature-by-feature

### 2.1 Tabs & sheet music (render, play, import)
- **Renderer/player: alphaTab 1.9** (MPL-2.0). Reads Guitar Pro 3–8, MusicXML, alphaTex;
  renders tab + standard notation; built-in SoundFont synth with cursor, A-B loop, tempo
  control, backing-track sync. The only OSS lib that does all of it.
  Rejected: VexFlow (drawing API only, no import/playback), OSMD (no Guitar Pro, audio
  player is paywalled), abcjs (ABC is a weak tab format).
- **Canonical storage format: alphaTex** (text, diffable, round-trips 100% of alphaTab's
  model since 1.7). Keep the original upload (GP/MusicXML) alongside for fidelity.
- **Editor: embed alphaTab's Monaco alphaTex editor** with live preview. There is no
  maintained OSS graphical tab editor for the browser; text + preview is the pragmatic path.
- **ASCII tab paste-in:** no production-grade parser exists. Write ~200 lines: detect the six
  string lines, column-scan frets, emit alphaTex with uniform note values, let the user fix
  rhythm in the editor. Warn that ASCII tab has no reliable rhythm.
- **Caveat:** alphaTab 1.9 draws a small "alphaTab.net" mark on larger scores with no off
  switch. MPL lets us patch it; decide whether we care.

### 2.2 Legal reality for tabs (this shapes the product)
- Tabs and chord charts of in-copyright songs are derivative works. OLGA (1998, 2006),
  MXTabs, Wikifonia (2013) all died over this. Ultimate Guitar and Songsterr survive because
  they pay publishers (HFA deals). A free project cannot.
- **We host only:** public-domain works (composer *and* arranger dead 70+ years, or
  pre-1931 US publication), user-original compositions, CC-licensed scores, user
  arrangements of PD works. **No "cover of X" category.** Upload form requires a license
  attestation; register a DMCA agent; notice-and-takedown flow.
- Users can still *import* any file for private, local-only use. That stays on their device.

### 2.3 Seed catalog (legal sources)
Mutopia (Sor, Carcassi, Giuliani, Sanz; LilyPond, PD/CC BY-SA) · IMSLP (PD scans and some
CC typesets; check per-country) · OpenScore (CC0 MusicXML) · thesession.org (ABC folk tunes,
CC BY-SA) · musescore.com only where staff-flagged PD/CC0/CC-BY. classtab.org (~4,000
classical ASCII tabs) has no stated license: ask before importing. Werner Guitar Editions,
Delcamp, Justin Guitar are free to view but *not* openly licensed: link, don't copy.

### 2.4 Tuner & "plug your guitar in"
- **Pitch detection: pitchy** (MIT, McLeod Pitch Method, pure JS) running in an
  AudioWorklet: 2048–4096-sample window at 48 kHz, HPF ~60 Hz + LPF ~1.5 kHz, RMS gate,
  clarity ≥ 0.9, octave check, median of last 3–5 frames, needle smoothing, 300–500 ms hold.
  Reaches ~±1 cent on a sustained string, which matches clip-on tuners.
- **Input:** `getUserMedia` with echoCancellation/noiseSuppression/autoGainControl **off**.
  - Mic: works everywhere.
  - USB class-compliant interface (Scarlett Solo, UM2, iRig HD): works on desktop
    Chrome/Firefox/Safari and Android Chrome via device picker. No per-channel API, so take
    channel 0 in the worklet; tell Scarlett users to use input 1 (Safari gives left only).
  - **iPhone/iPad Safari ignores USB interfaces and uses the built-in mic** (WebKit bug
    211192, open since 2020, still reproducing on iOS 26.3). All iOS browsers share WebKit.
    **Decision: ship a Capacitor iOS shell in Phase 1** whose native plugin captures from
    AVAudioEngine and streams PCM to the same worklet code. The PWA keeps mic-only on iOS.
- **Live monitoring/amp sim in browser: not the default.** Desktop round-trip is ~25–30 ms
  (playable); iOS is 40 ms+ and glitchy. Tell users to use the interface's direct-monitor
  knob. Optional later: neural-amp-modeler-wasm as a desktop-only opt-in.
- iOS gotchas baked into the plan: create AudioContext synchronously in a tap handler, never
  force `sampleRate`, read the real rate in the worklet, audio stops in background.

### 2.5 "Did you play the right note?" (Rocksmith/Yousician-style scoring)
- **Monophonic scoring is feasible now** (pitchy + onset detection, ~30–50 ms). Chord
  checking: chroma template match against the *expected* chord, cheap and in-worklet.
- **Full polyphonic real-time transcription on a phone is not feasible in 2026.** Basic
  Pitch (Spotify, Apache-2) works offline for "turn my recording into a tab", not live.
- Don't build the 3D note highway: watch/contribute to fee[dB]ack (AGPL-3, active,
  GP/MusicXML import, note detection, NAM plugin). Revisit once it's past pre-release.

### 2.6 Recording
- **Capture raw PCM in the AudioWorklet, write WAV locally.** MediaRecorder gives different
  formats per browser (Safari AAC, Chrome WebM/Opus) and no sample-accurate timing. Encode to
  Opus/AAC only for export (WebCodecs where present, wasm `opus-recorder` fallback).
- **Sync with backing track:** same AudioContext for both; stamp `currentTime` at first
  input block and at playback start; subtract `outputLatency`; one-time loopback calibration
  (play click, record it, cross-correlate) stored per device; manual nudge slider.
- **Storage: local only by default.** OPFS for audio blobs, IndexedDB (Dexie) for metadata.
  Prompt iOS users to Add to Home Screen and call `navigator.storage.persist()` because
  Safari evicts browser-tab storage after 7 idle days. Optional sync later via user-owned
  storage (remoteStorage.js → Dropbox/Drive) rather than hosting audio ourselves
  (a 5-min WAV is ~55 MB; hosting means GDPR/DMCA/abuse surface for a free project).

### 2.7 Practice tools (all off-the-shelf)
| Tool | Building block | License |
|---|---|---|
| Metronome | Web Audio lookahead scheduler, timer in a Worker | pattern |
| Slow-downer / pitch shift | signalsmith-stretch (AudioWorklet build) | MIT |
| A-B loop on audio | wavesurfer.js v7 Regions | BSD-3 |
| Tab A-B loop + tempo | alphaTab built-in | MPL-2 |
| Chord library | tombatossals/chords-db + svguitar | MIT |
| Fretboard / scales | fretboard.js + tonal | MIT |
| Soundfont | FluidR3 GM (SF3 ~14 MB) or GeneralUser GS | MIT / permissive |
| Spaced repetition | ts-fsrs (each skill is a "card", self-rate after practice) | MIT |

### 2.8 Lessons
- **Seed from openly licensed text:** Wikibooks *Guitar* (CC BY-SA, has an 8-lesson
  "Campfire Diploma"), *Sight-Reading for Guitar* (CC BY), Open Music Theory v2 (CC BY-SA),
  PD methods by Carcassi, Sor, Aguado, Giuliani (IMSLP/Mutopia) for repertoire.
- **Write our own 3-grade skeleton** (ideas aren't copyrightable; Justin Guitar's text is):
  - Grade 1: setup, tuning, reading tab/chord boxes; Em Am D A E G C Dm; one-minute
    changes; down-strums → D DU UDU; capo; E5/A5 power chords; one 2–3-chord PD/original
    song per module; first riff. Checkpoint: 3 songs at 60 bpm with clean changes.
  - Grade 2: F mini-barre; sus2/sus4; A7 D7 E7 G7 B7 + 12-bar blues; palm muting; 8th-note
    and syncopated strumming; p-i-m-a fingerpicking; C major scale + minor pentatonic box 1;
    rhythm reading; 4+-chord songs with capo transposition.
  - Grade 3: E- and A-shape barres; CAGED intro; pentatonic boxes 1–2 with bends/slides/
    hammer-ons; triads; I–IV–V–vi number system; playing to a backing track; easy Carcassi/
    Sor studies; consolidation checklist.
- Lesson format: Markdown + embedded alphaTex blocks + chord diagrams. Each lesson can
  declare "skills" that feed the spaced-repetition scheduler.

### 2.9 Community contributions
- **Launch: content lives in a Git repo; contributions are pull requests** (Mutopia model).
  Zero ops, built-in review and history. Add an in-app "Submit" that opens a prefilled PR.
- **Later: PocketBase** (MIT, single Go binary, SQLite, auth/OAuth, uploads, admin UI) on a
  ~$5 VPS when people want in-app accounts. Note: its GitHub repo was archived Oct 2026 and
  moved to the author's own host; still maintained, still pre-1.0. Supabase/Appwrite are
  heavier to self-host.
- **Contributor terms must say:** you own it or have rights; licensed CC BY-SA 4.0
  irrevocably; arrangements of in-copyright works not accepted; PD claims need death dates
  or a source; takedown + repeat-infringer policy; attribution name.

### 2.10 Platform, stack, hosting
- **PWA + free App Store app + free Google Play app, one codebase.** Capacitor 8 wraps
  the same build for iOS and Android. The only native code is the iOS audio-input plugin
  (USB interfaces, background-safe capture) and, if needed, an Android one for USB fallback
  bugs. Store builds are a deliverable, not a workaround.
  - **App Store Guideline 4.2** ("minimum functionality") rejects thin web wrappers. Our
    case: native audio capture, fully offline tuner/library/recorder, no web content loaded
    from a server. Keep the store app 100% offline-capable and avoid remote-loaded HTML.
  - **Accounts you must own:** Apple Developer Program ($99/yr) and Google Play Console
    ($25 once). Both need a privacy policy URL (we collect nothing; say so), a support URL,
    screenshots, and a mic-permission rationale string.
  - **Updates:** native shell changes go through review; web-only changes could use OTA
    bundles, but Apple tolerates that only for bug fixes. Plan on normal store releases.
  - Rejected: Tauri mobile, Flutter, React Native, KMP all mean a second audio codebase.
- **Stack:** Vite + TypeScript + Svelte 5 (alphaTab is imperative; a framework buys little),
  vite-plugin-pwa (Workbox) for offline, Dexie for local DB, Vitest for tests.
- **Hosting:** Vercel, team `303devs` (Anthony's decision 2026-11-22: the team already runs
  Vercel and Ratchet watches its billing; the blueprint's original pick was Cloudflare Pages,
  which stays the fallback). A static PWA fits the Hobby tier. GitHub Pages is a second
  fallback. Fly.io has no free tier anymore; Hetzner's cheapest plan is currently unorderable.
- **Licenses:** code AGPL-3.0 (keeps hosted forks open; MPL/MIT deps are compatible),
  content CC BY-SA 4.0 (matches Wikibooks/Open Music Theory so content can flow both ways).

---

## 3. Phased plan

**Phase 0 — Skeleton (week 1)**
Repo, AGPL + CC BY-SA licenses, Vite/Svelte/TS, PWA manifest + service worker, Vercel
deploy, CI. One page that loads a Mutopia piece in alphaTab and plays it.

**Phase 1 — Tuner + input + store shells (weeks 2–4)**
Device picker, constraints off, AudioWorklet + pitchy, needle UI, iOS gesture handling,
"which input is my guitar" help text. Capacitor iOS and Android projects in the repo; iOS
native AVAudioEngine input plugin feeding the same worklet; one input abstraction with two
sources (getUserMedia, native). First TestFlight and Play internal-testing builds go out
here with just the tuner, so store review problems surface early, not at launch. Test on
iPhone (mic and USB interface via the app), Android (USB), Mac (Scarlett).

**Phase 2 — Tab library + viewer (weeks 3–4)**
Content repo layout (`/tabs/*.alphatex` + metadata + source blob), 30–50 seed pieces from
Mutopia/OpenScore/thesession, search/filter, viewer with tempo, loop, track mute, metronome.
Local import of any GP/MusicXML file (private, stays on device).

**Phase 3 — Lessons v1 (weeks 5–8)**
Lesson format, Grade 1 written in full (8–10 modules) **and** Grade 2–3 as module outlines
with one worked lesson each, so returning players see a path on day one. Chord diagrams
(svguitar), fretboard (fretboard.js), practice log + ts-fsrs "skills due today". Seed
pieces span both audiences: 2–3-chord folk songs for Grade 1, Carcassi/Sor studies and
12-bar blues for Grade 2–3.

**Phase 4 — Recording + play-along (weeks 8–9)**
Worklet PCM capture → WAV in OPFS, record over a tab/backing track with calibration, list
and play back takes, export Opus/WAV. Slow-downer for imported audio (signalsmith-stretch).

**Phase 5 — Contribute (week 10)**
alphaTex editor with preview, ASCII-tab paste converter, "Submit" that opens a prefilled
GitHub PR with license attestation. Contributor guide + DMCA page.

**Phase 5b — Store launch (week 11)**
App Store and Google Play listings: icons, screenshots, privacy policy page, mic rationale,
age rating, "free, no ads, no purchases" declarations. Submit for review; fix whatever 4.2
feedback comes back. Public release of PWA, iOS and Android together.

**Phase 6 — Note feedback (weeks 12–14)**
Monophonic "play this riff" scoring with pitchy + onset; chord check via chroma templates.
Evaluate fee[dB]ack for anything beyond that.

**Later / only on demand:** PocketBase accounts and in-app uploads; optional sync via
remoteStorage; Android Capacitor shell if Android USB fallback bugs bite; NAM amp sim on
desktop; Basic Pitch "audio → tab" offline.

---

## 4. Explicitly out of scope (unless you say otherwise)
Hosting tabs of copyrighted songs · hosting user audio · live amp simulation as a default ·
real-time polyphonic song scoring · native apps at launch · a graphical drag-and-drop tab
editor · video lessons (link to YouTube instead).

## 5. Key risks
1. **App Store review.** Guideline 4.2 is the most likely rejection. Mitigation: native
   audio plugin, fully offline app, early TestFlight in Phase 1. If Apple still refuses, the
   PWA and Play app ship on time and we iterate on iOS.
2. **iOS native audio plugin** is the only non-web code. Phase 1 overruns if it fights
   WKWebView audio; the fallback is mic-only on iOS until it works.
3. **Catalog appeal.** Legally hostable music is classical, folk, and originals. Pop-song
   tabs are the thing people search for and we can't host them. Local private import
   softens this; it doesn't remove it.
4. **alphaTab single-maintainer + branding mark.** Acceptable; MPL protects us.
5. **Safari storage eviction** for recordings in browser tabs. Mitigated by Home Screen
   install + `persist()`; must test on a device left idle >7 days.
6. **Point-in-time facts** (star counts, hosting free tiers, PocketBase's move) should be
   rechecked when each phase starts.

## 6. Decisions taken (21 Nov 2026)
- Ship as PWA **and** free App Store **and** Google Play apps from one codebase (Capacitor).
- Web hosting is Vercel (team 303devs), not Cloudflare; iOS ships through the team's existing
  App Store Connect account; Android through Anthony's Play Console (22 Nov 2026).
- iPhone/iPad with a USB interface is a launch requirement → native iOS audio plugin in Phase 1.
- Hosted catalog is legal-only (public domain, CC, user-original); private local import for
  everything else.
- Audience is both beginners and chord-literate players from day one → Grade 1 in full plus
  Grade 2–3 outlines in Phase 3.
- Name is a placeholder ("Guitar Tutor"); no GitHub org yet. Rename is cheap.
