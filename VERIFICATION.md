# Verification results

Executed on 11 October 2026 using Node 22.22.0 and Microsoft Edge on Windows.

| Check | Actual result |
| --- | --- |
| `npm run build` | Passed; Angular production bundle generated with strict TypeScript and template checking |
| `npm test` | 8 passed, 0 failed |
| `npx playwright test` | 4 passed, 0 failed; final run took 1.3 minutes |
| Question validation | 1,500 generated questions checked for arithmetic, unique options, correct answers, integer/nonnegative results, and recent-repeat avoidance |
| Laptop layout | Passed at 1366×768; screenshot reviewed |
| Desktop layout | Passed at 1920×1080 |
| Mobile layout | Passed at 390×844; no horizontal overflow |
| Browser game controls | Correct shot, score, pause/resume, restart and sound toggle passed |
| Full progression | Browser played all 30 questions across all 3 levels and reached Earth is safe with 450 points |
| Persistence | High score and unlocked final level remained after browser reload |
| Game over | Three wrong shots produced the game-over report |
| Runtime failures | No page errors in the browser tests |
| Offline assets | No external requests in the three viewport tests; production served entirely from local files |

Screenshots: `test-results/game-1366.png`, `game-1920.png`, and `game-390.png`.

The initial sandboxed build and test commands could not launch child workers (`spawn EPERM`). The same commands passed after execution with the required permissions. This was an execution-environment restriction.

Offline verification checks that the game requests only its local server. Physical network disconnection and real touchscreen hardware were not tested. Automated browser controls verified the mobile layout; keyboard and canvas collisions were covered by the unit and browser suites. Sound enabling/disabling was exercised, but audio quality still benefits from a quick listening check on the exhibition laptop. No hosted deployment was requested or performed.
