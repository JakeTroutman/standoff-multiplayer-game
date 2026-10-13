# STANDOFF!

A two-player Western strategy game. Secretly choose **Shoot**, **Reload**, or **Dodge**; both moves resolve together. Players join from separate devices using a room code. First to two duel wins wins the match.

[Play the hosted game](https://standoff-duel.redshell6.chatgpt.site)

## About the project

Created for the Handshake AI Skills Showcase with assistance from ChatGPT. I designed the initial concept, refined the rules, directed the visuals and audio, playtested iterations, and identified bugs for correction. ChatGPT assisted with implementation and automated testing.

## Features

- Room codes, avatar selection, and a ready lobby.
- Five character options, mustaches, and matching intro characters.
- Simultaneous secret choices with server-side validation.
- Animated shots, dodges, reloads, damage, and a persistent turn recap.
- Individual duel results and final Victory/Defeat screens.
- Original synthesized arcade Western music and effects with independent mute controls.
- Phone-friendly layouts and reduced-motion support.

## Run locally

Install **Node.js 24 or newer**. The root local server requires no third-party dependencies, API keys, account, or `npm install` step.

1. Extract this ZIP, or clone the repository.
2. Open a terminal in the folder containing this README and `package.json`.
3. Run:

```sh
npm start
```

Alternatively, run `node server.mjs`, or double-click **Start_Standoff.bat** on Windows.

4. Open **http://localhost:3000**.
5. Create a room. Have a second player join using the code, choose characters, and both press Ready.

To test alone, use a normal browser window and a private/incognito window. Avoid duplicating a tab, which can copy the player's session.

For another device on the same Wi-Fi, use the **Same Wi-Fi** address printed by the server. `localhost` on a phone means the phone itself. Allow Node.js through Windows Firewall on your private network if prompted. Keep the server window open; stop with Ctrl+C.

Rooms persist locally in `data/standoff.sqlite`, excluded by `.gitignore`. Stop the server and delete `data/` to reset them. Rooms idle for 24 hours expire. Set the `PORT` environment variable if port 3000 is occupied.

## Rules

Start each duel with **3 health and 1 bullet**; maximum ammo is **2 bullets**.

| Action | Effect |
| --- | --- |
| Shoot | Spend a bullet; deal 1 damage unless the opponent dodges. |
| Reload | Gain a bullet, even if shot. |
| Dodge | Avoid incoming damage. |

Use an action at most twice consecutively. Shoot needs ammunition; Reload is unavailable at full ammo. Both shooting damages both. Simultaneous knockouts are draws with no wins awarded. First to **two duel wins** wins the match. There is no turn timer.

## Source layout

| Location | Contents |
| --- | --- |
| `server.mjs` | Portable Node HTTP server and SQLite adapter. |
| `hosted/public/index.html` | Frontend markup and inline SVG character/result artwork. |
| `hosted/public/app.js` | Client state, 500 ms polling, avatars, animations, synthesized music and effects. |
| `hosted/public/style.css` | Western styles and animations. |
| `hosted/lib/game.mjs` | Rules, resolution, and secret-safe state views. |
| `hosted/lib/api.mjs` | Rooms, readiness, avatars, moves, and version-checked concurrent writes. |
| `hosted/lib/api.test.mjs`, `local.test.mjs` | Backend and local adapter tests. |
| `hosted/app/` | Deployed Vinext route handlers. |
| `hosted/db/`, `hosted/drizzle/` | D1 schema and database migration. |
| `hosted/build/`, `hosted/scripts/` | Complete hosted build integration and helpers. |
| `hosted/package.json`, `hosted/pnpm-lock.yaml` | Hosted dependencies and lockfile. |
| `hosted/.openai/hosting.json`, `hosted/vite.config.ts` | Sanitized hosted configuration. |

Game art is implemented in SVG/CSS; the active soundtrack and effects are synthesized in JavaScript. No external image or audio downloads are needed. Unused starter SVG files are retained for completeness.

## Tests

```sh
npm test
```

Node may print an experimental SQLite warning on some versions; this does not indicate a failed test.

## Hosted version

The deployed game uses **Vinext, Cloudflare Workers, and D1**. The local launcher imports the same hosted API and game rules with SQLite in place of D1. Server-side version checks and retries prevent simultaneous moves from overwriting each other. The client polls; it does not use WebSockets.

The `hosted/` folder contains the actual deployed source. Its Site ID was removed. Redeploying it through Sites requires provisioning a new Site and database; these files do not grant access to the existing deployment. Use the root launcher for the documented local workflow. GitHub Pages alone cannot host this multiplayer backend.

## Upload to GitHub

1. Create an empty **Public** repository named `standoff`; do not initialize a README.
2. Choose **uploading an existing file**, or **Add file → Upload files**.
3. Upload the extracted folder's **contents**, including `hosted/`. Upload the source files, not the ZIP. Confirm `.gitignore` is included; create it manually if your browser upload omits it.
4. Commit with `Add STANDOFF! source and local setup`.
5. Add the live game URL to the repository's About section.

Or use Git from this folder:

```sh
git init
git add .
git commit -m "Add STANDOFF! source and local setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/standoff.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. Authenticate through your credential manager; never include a token in source files or remote URLs.

## Export and licensing

Credentials, environment files, Git metadata/history, dependencies, builds, local databases, runtime sessions, and live room data are excluded. Build artifacts and dependencies can be regenerated. See `SOURCE_PROVENANCE.md` for the source commit and portability changes.

Third-party license notices are preserved with build integration and vendor files. No project-wide open-source license was chosen on your behalf; choose one if you want to grant reuse rights for your original code.

## Next steps

Improve character art, explore a three-player mode, improve disconnect handling, and add browser integration/accessibility tests.
