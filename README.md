# Math Space Defender

A complete Angular and TypeScript arcade game for a Grade 6 technology exhibition. Calculate the answer, aim at its asteroid, and shoot to protect Earth.

## Install and play

Requires Node.js 22.12 or later in the Node 22 series (verified with 22.22.0), and npm. Angular 21.2.25 is the latest stable major compatible with the installed Node version; Angular 22 requires Node 22.22.3 or newer.

```powershell
cd C:\Azeez\math-space-defender
npm ci
npm start
```

Open **http://127.0.0.1:4200**. Start Mission opens level selection. Complete ten questions with at least one shield to unlock the next level. Use the gear button to edit student/school details and enable reduced motion. Sound starts muted.

## Exhibition / offline launch

While internet access is available, install dependencies and build once:

```powershell
npm ci
npm run build
npm run serve:offline
```

Open **http://127.0.0.1:4200**. Keep the terminal running. After installation and build, this launch works with internet disconnected: no remote fonts, graphics, APIs, or audio files are used. It needs a local HTTP server, so do not double-click index.html. The production folder is `dist/math-space-defender/browser`; you can copy it and `serve.mjs` to another laptop with Node installed, preserving that folder structure. Dependencies are not required to run that production server.

This is a local project; it has not been published to a hosting service. It is not a service-worker app: an initial visit still needs the local server. High scores, unlocked levels, reduced-motion preferences, and exhibition details persist in this browser. Clearing browser data resets them. Storage restrictions do not stop gameplay.

## Controls and rules

- Left/Right arrows or A/D: move the ship.
- Mouse: hover over an asteroid to target it; click to fire.
- Number keys 1–4: select an answer from left to right. Space: fire.
- P or the pause button: pause/resume. Switching away from the window automatically pauses.
- Touch: tap an asteroid, or an answer target below the battlefield, to fire. On-screen arrows move the ship.
- Correct answer: 10 points; an answer in the first third of the countdown adds 5 bonus points.
- Wrong or missed answer: lose one shield, see the correct answer, then continue.
- Three lost shields end the game. Each mission has ten questions.
- Next Mission carries the score, statistics, and remaining shields. Play Again and Restart start a fresh mission with three shields.

| Mission | Maths | Options | Countdown |
| --- | --- | --- | --- |
| Space Rookie | Addition/subtraction, operands 1–30 | 3 | 22s |
| Galaxy Warrior | Multiplication and whole-number division | 4 | 17s |
| Math Commander | Mixed operations, with explicit parentheses | 4 | 12s |

## How the code works

- `src/app/app.component.*`: standalone Angular UI, signal state, menus, settings, pause and result overlays.
- `src/app/components.ts`: scoreboard and the school exhibition guide.
- `src/app/core/models.ts`: typed questions, game objects, states, and level settings.
- `src/app/core/services.ts`: question service, safe local storage, and synthesized Web Audio effects.
- `src/app/game/question-generator.ts`: reusable arithmetic generator; no negative rookie results, duplicate choices, fractional division results, or recent repeats.
- `src/app/game/game-engine.ts`: physics, aiming, collisions, scoring and progression, independent of drawing and Angular.
- `src/app/game/canvas-renderer.ts`: stars, planets, Earth, ship, rocks, lasers, particles and target markers.
- `src/app/game/game-board/`: game board component with separate TypeScript, HTML, and CSS files; handles requestAnimationFrame, delta time, keyboard/pointer input and lifecycle cleanup.

Angular displays menus and scores. The engine updates positions using elapsed seconds. The renderer draws the resulting scene on an HTML canvas. Once a round resolves, it clears its asteroids and shots and waits before the next question, preventing duplicate awards or damage. Animation frames and Angular-managed listeners are removed when the board is destroyed; audio oscillators disconnect on completion.

## Exhibition explanation

The **How this game works** link inside the game includes six simple steps, a 60-second demonstration script, and five teacher questions with answers. It acknowledges development assistance instead of claiming the student wrote every line. Read it together, practise the controls, and personalize the student/school information before the exhibition.

## Tests

```powershell
npm test
npm run build
npm run test:browser
```

Browser tests use an installed Microsoft Edge and automatically start the production server. Build first. If Edge is unavailable, install a Playwright-supported browser and change `channel` in `playwright.config.ts`. Browser screenshots are saved in `test-results/`.

The eight unit tests check 1,500 questions, arithmetic invariants, scoring, one-time collision resolution, pause, reset, all three mission completions, timeouts/game over, and boundaries. Browser tests cover laptop, desktop and mobile layouts, shooting, pause, restart, sound, zero page errors/external requests, progression, persistent unlocks and high scores, and game over.

See `VERIFICATION.md` for actual execution results.
