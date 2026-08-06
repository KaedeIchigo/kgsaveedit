Kittens Game Save Editor by [patsy](https://coderpatsy.bitbucket.io/)

For [Kittens Game](https://bloodrizer.ru/games/kittens/) by [bloodrizer](https://bloodrizer.ru/)

Thanks to Guest93 for some updates, and thanks to countless people for the suggestions and bug reports.

---

## About this fork

**I did not write this editor. [patsy](https://coderpatsy.bitbucket.io/) did.**

Every part of the save editor itself — the design, the architecture, and effectively
all of the code in this repository — is patsy's original work, released by them under
the MIT License. The original repository lives at
[bitbucket.org/coderpatsy/kgsaveedit](https://bitbucket.org/coderpatsy/kgsaveedit)
and its last update was in July 2023. The full commit history, with patsy's original
authorship intact, has been preserved here rather than squashed or re-committed.

This fork exists for one reason: the upstream project appears to be no longer
maintained, and the editor has fallen behind current Kittens Game versions. It is
**not** a rewrite, a rebrand, or a claim of ownership.

### On how this fork is maintained

I am maintaining this fork **using LLM tooling** to bring the editor up to date with
current Kittens Game versions and to keep it working going forward. That is the honest
description of the process, and it is stated up front so nobody is misled about it:

- Changes here are largely produced with AI assistance rather than hand-written.
- All original credit for the editor belongs to patsy, not to me and not to any model.
- Bugs introduced after the fork point are mine, not patsy's. Please report them
  [here](https://github.com/KaedeIchigo/kgsaveedit/issues) and **not** to patsy or upstream.

If patsy ever resumes upstream development, or objects to this fork existing, upstream
takes precedence and this fork will defer to it.

## Status

Currently targets Kittens Game version **1.4.9.0.r674**, which is what the editor was
left at upstream. Updating this to current Kittens Game is the active work.

The target version is declared in one place — the `#gameVersionSpan` element in
[`editor.html`](editor.html) — and is read at runtime into `window.editorVersion`,
which also drives cache-busting for module and locale fetches.

## Running it locally

The editor is entirely client-side: plain HTML, CSS, and ES5-era JavaScript loaded via
`<script>` tags. **There is no build step and no runtime dependencies to install.** It
does need to be served over HTTP rather than opened as a `file://` URL, because it
fetches its locale JSON over XHR.

```bash
npm install
npm start
```

That serves the repo on <http://localhost:8080> and opens the editor. Any static file
server works just as well if you would rather not use npm.

### Dev mode

The save-diffing **Dev** tab is opt-in. It loads automatically on `localhost` /
`127.0.0.1`, or anywhere else by adding `?dev` to the URL:

```
http://localhost:8080/editor.html?dev
```

Deployed copies therefore stay clean by default. (Upstream shipped the dev tooling
hard-coded into `editor.html`, with a comment from patsy noting it was not meant to go
live.)

### Linting

```bash
npm run lint
```

The source files already carried `/* global ... */` directives but no committed ESLint
config, so one has been added in [`eslint.config.mjs`](eslint.config.mjs) to match how
the code is actually written. Indentation rules are deliberately left to
[`.editorconfig`](.editorconfig).

## Credits

- **[patsy](https://coderpatsy.bitbucket.io/)** — created the save editor. All of it.
- **Guest93** — updates to the original.
- **[bloodrizer](https://bloodrizer.ru/)** — created [Kittens Game](https://bloodrizer.ru/games/kittens/) itself.
- Countless people who sent patsy suggestions and bug reports.

## License

MIT, unchanged from upstream — see [license.txt](license.txt).
Copyright (c) 2016 patsy. The original copyright notice is retained in full, as the
license requires.
