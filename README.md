# Guitar Tutor

Free, open-source guitar tutor: lessons, tabs and sheet music, tuner, recorder and practice
tools. Ships as a PWA and as free iOS and Android apps from one codebase.

See [BLUEPRINT.md](BLUEPRINT.md) for the plan and the reasoning behind every choice.

## Develop

```bash
npm install
npm run dev
```

`npm run check` type-checks, `npm run test` runs unit tests, `npm run build` produces the
deployable `dist/` folder (Vercel or any static host: build command `npm run build`,
output `dist`).

## Native apps (Capacitor)

```bash
npm run cap:sync        # build the web app and copy it into ios/ and android/
npx cap open ios        # Xcode; needs Xcode 16+ (tested with 27)
npx cap open android    # Android Studio; Gradle needs JDK 21, e.g.
# JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew assembleDebug
```

The only native code is `ios/App/App/AudioSession.swift`, which asks iOS to route a plugged-in
USB audio interface to the WebView's microphone input (Safari cannot do this itself).

## Content

Tabs live in `content/tabs/` as [alphaTex](https://alphatab.net/docs/alphatex/introduction)
or MusicXML files, each MusicXML with a `.json` sidecar (title, composer, source, license).
The 41 traditional tunes come from [thesession.org](https://thesession.org) (CC BY-SA) via
`scripts/import-thesession.py`, which also assigns guitar strings and frets; see
`content/tabs/SOURCES.md`. Only public-domain, Creative Commons or your own original music
is accepted; see `content/LICENSE` (CC BY-SA 4.0).

Lessons live in `content/lessons/grade-<n>/` as Markdown with front matter; see
`content/lessons/FORMAT.md` for the chord, alphaTex and fretboard blocks. `npm test` validates
every lesson (alphaTex parses, chord names exist, piece links resolve).

Recordings are captured through an AudioWorklet (`public/recorder.worklet.js`), saved as WAV in
IndexedDB on the device, and trimmed by the measured output + input latency so a take lines up
with the tab it was played against. `npm run preview` serves the production build; check it
rather than only the dev server, since asset paths differ.

## Licenses

- Code: [AGPL-3.0-only](LICENSE)
- Content (`content/`): [CC BY-SA 4.0](content/LICENSE)
- Bundled: alphaTab (MPL-2.0), Bravura font (OFL), SONiVOX soundfont (Apache-2.0)
