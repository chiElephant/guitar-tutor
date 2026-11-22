# Guitar Tutor

Free, open-source guitar tutor: lessons, tabs and sheet music, tuner, recorder and practice
tools. Ships as a PWA and as free iOS and Android apps from one codebase.

See [BLUEPRINT.md](BLUEPRINT.md) for the plan and the reasoning behind every choice.

## Develop

```bash
npm install
npm run dev
```

`npm run check` type-checks, `npm run build` produces the deployable `dist/` folder
(Cloudflare Pages or any static host: build command `npm run build`, output `dist`).

## Content

Tabs live in `content/tabs/` as [alphaTex](https://alphatab.net/docs/alphatex/introduction)
files. Only public-domain, Creative Commons or your own original music is accepted; see
`content/LICENSE` (CC BY-SA 4.0).

## Licenses

- Code: [AGPL-3.0-only](LICENSE)
- Content (`content/`): [CC BY-SA 4.0](content/LICENSE)
- Bundled: alphaTab (MPL-2.0), Bravura font (OFL), SONiVOX soundfont (Apache-2.0)
