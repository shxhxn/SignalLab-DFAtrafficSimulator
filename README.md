# SignalLab — DFA Traffic Simulator

[![CI](https://github.com/shxhxn/SignalLab-DFAtrafficSimulator/actions/workflows/ci.yml/badge.svg)](https://github.com/shxhxn/SignalLab-DFAtrafficSimulator/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-19-149eca)
![Vite](https://img.shields.io/badge/Vite-8-646cff)

An interactive **Formal Languages and Automata Theory (FLAT)** project that validates traffic-light changes using a deterministic finite automaton. A light interface puts an animated intersection beside its live state diagram and transition table.

## Run locally

Requirements: Node.js compatible with the locked Vite version (Node 22.12+ recommended) and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. In Windows PowerShell, use `npm.cmd` if PowerShell blocks the `npm.ps1` shim. No account, API key, backend, external font or image service is required.

```sh
npm run build    # production output in dist/
npm run preview # preview the production build
npm run lint
npm test
```

## How to demonstrate it

1. Choose **Full cycle**, then **Start simulation**. Observe Red → Green → Yellow → Red.
2. Watch the current state, diagram, table cell and transition trace update together.
3. Use **Stop simulation** to halt or **Reset simulation** to clear the run.
4. Use **Advance one step** to initialize step mode; click again to consume each next input. **Run automatically** continues the same run.
5. Choose **Skips green** to demonstrate rejection in the trap state.
6. Enter custom symbols such as `R G Y R` or `R, G, R`. Only individual R/G/Y tokens are valid.
7. Download the presentation guide from the header or footer.

The first symbol selects the scenario's initial light. Remaining symbols are consumed as DFA inputs. Valid scenarios automatically replay as separate demonstrations. This preserves the original application's behavior and is deliberately distinguished from a formal run starting at qR.

## Formal definition

- **Q** = {qR, qG, qY, qD}
- **Σ** = {R, G, Y}
- **q₀** = qR
- **F** = {qR, qG, qY}
- **δ** is total and deterministic:

| State / input | R | G | Y |
|---|---|---|---|
| qR | qD | qG | qD |
| qG | qD | qD | qY |
| qY | qR | qD | qD |
| qD | qD | qD | qD |

From the formal start qR, the recognized language is `(GYR)*(ε | G | GY)`. All finite valid prefixes are accepted, including the empty word. qD is absorbing and non-accepting. Normal states reject repeated colors; qD has self-loops on every symbol.

## Design and behavior

- Wide responsive desktop workspace with a sticky theory panel; stacked layout on smaller screens.
- Detailed vector vehicles, glass and body shading, brake lights, signal lenses, road markings, crossings and landscaping.
- Time-based animation with acceleration, braking, front-bumper stop-line enforcement and safe following distances.
- Cars that cross the stop line during green continue through a later red/yellow instead of jumping backward.
- Manual stop and invalid transitions freeze vehicles; invalid inputs halt in qD.
- 0.5×, 1× and 2× speed; explicit stepping and reset controls.
- Reduced-motion preference freezes decorative car movement and disables flashing, while DFA controls remain usable.
- Latest 80 trace events retained to bound memory use.
- Local assets and system fonts support presentations without internet access after setup.

## Project map

| File | Responsibility |
|---|---|
| `src/dfa.js` | Formal model, original scenarios, parser and run advancement |
| `src/traffic.js` | Pure vehicle physics |
| `src/App.jsx` | Controls, timer, state diagram, table and trace |
| `src/Intersection.jsx` | SVG scene and requestAnimationFrame renderer |
| `src/App.css`, `src/index.css` | Responsive light theme |
| `scripts/model.test.mjs` | Model and movement regression checks |
| `docs/PROJECT_CONTEXT.md` | Original requirements, preserved conventions and implementation decisions |
| `output/pdf/dfa-presentation-guide.pdf` | Eight-page theory explanation and presentation script |
| `public/dfa-presentation-guide.pdf` | Identical guide served for in-app download |
| `scripts/create_guide.py` | Reproducible PDF authoring source |
| `scripts/verify_guide.py` | PDF text checks and rendered QA previews |

## Presentation guide

**Part 1 (pages 1–5):** website areas and controls, five-tuple, complete transition table, worked examples, language, timing, implementation and limitations.

**Part 2 (pages 6–8):** exact speaking script, click-by-click presentation cues and common follow-up questions.

To regenerate on Windows with Arial installed:

```sh
python -m pip install -r scripts/requirements-pdf.txt
python scripts/create_guide.py
python scripts/verify_guide.py
```

The PDF generator currently references standard Windows Arial font paths; adjust the registered font paths for another operating system. QA previews are written to ignored `tmp/pdfs/`. Rebuild the app after changing the downloadable PDF.

## Model boundaries

This is a single-approach teaching simulation. Dwell times (red 4.2s, green 4.2s, yellow 1.9s), vehicle motion, replay and manual stop are outside the DFA. It does not implement physical intersection safety, pedestrian phases or real-world controller timing. The signal is a Moore-style output derived from state; acceptance is a separate DFA property.

