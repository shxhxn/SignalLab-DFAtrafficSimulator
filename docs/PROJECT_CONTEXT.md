# Project context

## User request

Improve an existing DFA traffic simulator for the subject FLAT without changing its educational purpose or underlying scenario behavior. Use a professional, clean, light theme; improve vehicles, lights and animation; use the empty side space; keep the state diagram and transition function visible during animation. Create a new Git repository with context and a PDF whose first part explains the website and whose second part provides a presentation script.

## Original model retained

The original app used four states (R/G/Y/D), three symbols (R/G/Y), a red formal initial state, and three accepting normal states. The only valid forward steps are R→G, G→Y and Y→R. Every other pair enters D; D is absorbing.

The original scenario list is preserved verbatim, including the names “Two cycles” and “Cycle + extra green.” Those names describe demonstrations, not counts of accepted complete cycles from qR.

The original first-symbol convention is preserved: the first token selects the starting configuration, rather than being consumed. Thus `R G Y R` consumes `G Y R` from qR, while `G R` demonstrates a local fault from qG. The formal initial state remains qR.

Valid scenarios replay until stopped. A replay reset is outside the transition function and is explicitly labeled in the trace. Matching end/start colors do not get an extra duplicate dwell. A single-symbol sequence can replay without recording a transition.

## Changes

- Replaced the narrow vertical layout with a full-width workspace and adjacent sticky theory panel on desktop.
- Added light sage/white surfaces, consistent typography, restrained borders, clear hierarchy and responsive arrangements.
- Rebuilt the intersection and vehicles as code-native SVG for crisp, synchronized animation without external assets.
- Replaced the original interval-based position jumps with elapsed-time physics and requestAnimationFrame rendering.
- Added acceleration/braking, a front-bumper stop line, properly spaced queues, brake lights and safe vehicle recycling off-screen.
- Preserved the rule that committed cars continue forward after green ends.
- Added step mode, reset, speed selection, reduced-motion support and bounded trace history.
- Fixed the original parser bug where `"RGY".includes(token)` incorrectly accepted multi-character tokens such as `RG`.
- Completed all edge labels and the qD self-loop in the live diagram.
- Corrected theory statements: qD has self-loops; the full model has four states; manual flashing behavior is an app convention, not a claim about real roads.
- Added an eight-page PDF and download links, with presentation wording aligned to actual app behavior.

## State/control conventions

`idle`: initial qR; cars may approach the red stop line.
`running`: timed inputs and continuous car motion.
`stepping`: manual input advancement; cars remain still.
`failsafe`: manual stop, frozen cars, amber indication. Start begins a new run.
`halted`: invalid input, qD, frozen cars, flashing red indication. A new run or reset is required.

Changing playback speed restarts the current state's dwell at the new speed. Reset clears trace/counters and returns to qR. The trace stores the latest 80 events; its display numbering is local to that retained buffer. Transition counts exclude start and replay reset events.

## Validation

`npm test` covers table completeness, absorbing trap, all original scenario outcomes, malformed-token rejection, replay boundaries, single-symbol runs, stop-line compliance, queue spacing, crossing clearance and a long vehicle simulation. `npm run lint` and `npm run build` validate the app source. The PDF is extracted and rendered using `scripts/verify_guide.py`, then visually inspected.

The session's connected Browser runtime returned no available browsers. Automated in-browser layout and interaction verification could not be completed in this environment; verify the UI in a normal browser before presenting. CSS provides desktop, tablet and phone breakpoints; a desktop window gives the best simultaneous animation/theory view.

## Repository and artifacts

The original folder had no Git history. It is initialized as a new local repository with the completed application, source PDF generator, final PDF and project context. No GitHub account connection was available and no remote was requested by a follow-up, so remote publishing is not assumed. Build output, node_modules, local backups, environment secrets and QA intermediates are ignored.
