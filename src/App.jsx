import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Check, ChevronDown, Download, GitBranch, Play, RotateCcw, Square, StepForward, TrafficCone, Activity, CircleHelp } from 'lucide-react';
import { TRANSITIONS, COLORS, NAMES, NEXT, DWELL, SCENARIOS, parseSequence, advanceRun } from './dfa';
import Intersection from './Intersection';
import './App.css';

const fresh = (state = 'R') => ({ state, index: 0, replays: 0, tick: 0, last: null });
const label = s => `q${s}`;
function Dot({ state }) { return <span className="state-dot" style={{ background: COLORS[state] }} />; }

export default function App() {
  const [scenario, setScenario] = useState('v1');
  const [custom, setCustom] = useState('');
  const [mode, setMode] = useState('preset');
  const [phase, setPhase] = useState('idle');
  const [run, setRun] = useState(fresh);
  const [history, setHistory] = useState([]);
  const [speed, setSpeed] = useState(1);
  const [generation, setGeneration] = useState(0);
  const [showTheory, setShowTheory] = useState(false);
  const sequenceRef = useRef([]);
  const runRef = useRef(run);
  const parsed = parseSequence(custom);
  const selected = SCENARIOS.find(s => s.id === scenario);
  const sequence = mode === 'preset' ? selected.seq : parsed.tokens;
  const validInput = mode === 'preset' || parsed.valid;
  const locked = phase === 'running' || phase === 'stepping';
  const fault = phase === 'halted';

  function append(entries) { setHistory(h => [...h, ...entries].slice(-80)); }
  function advance() {
    const next = advanceRun(runRef.current, sequenceRef.current);
    runRef.current = next;
    setRun(next);
    append(next.entries || []);
    if (next.state === 'D') setPhase('halted');
  }
  useEffect(() => {
    if (phase !== 'running') return;
    const timer = setTimeout(advance, DWELL[run.state] / speed);
    return () => clearTimeout(timer);
  }, [phase, run, speed]);

  function begin(nextPhase = 'running') {
    if (!validInput) return;
    sequenceRef.current = [...sequence];
    const next = fresh(sequence[0]);
    runRef.current = next;
    setRun(next);
    setHistory([{ start: true, to: sequence[0] }]);
    setGeneration(g => g + 1);
    setPhase(nextPhase);
  }
  function reset() {
    setPhase('idle');
    const next = fresh();
    runRef.current = next;
    setRun(next);
    setHistory([]);
    setGeneration(g => g + 1);
  }
  const status = { idle: 'Ready to simulate', running: 'Simulation running', stepping: 'Step mode', failsafe: 'Manually stopped', halted: 'Sequence rejected' }[phase];
  const signalText = fault ? 'Controller fault. Traffic is frozen.' : phase === 'failsafe' ? 'Manual stop. Flashing amber; traffic is frozen.' : run.state === 'G' ? 'Green signal. Vehicles accelerate through.' : run.state === 'Y' ? 'Yellow signal. Approaching vehicles stop; crossings clear.' : 'Red signal. Vehicles wait behind the stop line.';

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark"><TrafficCone size={22} /></span><span>Signal<span className="brand-light">Lab</span><small>FINITE AUTOMATA / INTERACTIVE LAB</small></span></a>
      <div className="header-right"><span className="course-tag">FLAT PROJECT</span><a className="text-link" href="/dfa-presentation-guide.pdf" download><Download size={15} /> Presentation guide</a></div>
    </header>
    <main>
      <div className="page-heading"><div><div className="eyebrow">FROM THEORY TO TRAFFIC</div><h1>A little city. A finite set of rules.</h1><p>Explore how a deterministic finite automaton keeps a traffic signal in sequence.</p></div><div className={`status-pill ${phase}`} role="status"><span />{status}</div></div>
      <div className="workspace">
        <section className="simulation-column" aria-label="Traffic simulator">
          <div className="panel scene-panel">
            <div className="panel-heading"><div><span className="section-index">01</span><h2>Live intersection</h2></div><span className="small-label"><span className={`live-dot ${phase === 'running' ? 'on' : ''}`} /> EASTBOUND APPROACH</span></div>
            <div className="scene-wrap"><Intersection state={run.state} phase={phase} speed={speed} generation={generation} /><div className="scene-location"><span>OAK STREET</span><small>Single signal · controlled approach</small></div><div className="compass">N<span>↑</span></div></div>
            <div className="scene-caption"><span className={`signal-label ${run.state}`}><Dot state={run.state} />{fault ? 'FAULT' : phase === 'failsafe' ? 'STOPPED' : NAMES[run.state].toUpperCase()}</span><p>{signalText}</p></div>
            <div className="metrics"><div><small>CURRENT STATE</small><strong style={{ color: COLORS[run.state] }}>{label(run.state)}<span>{NAMES[run.state]}</span></strong></div><div><small>NEXT VALID INPUT</small><strong>{NEXT[run.state] || '—'}<span>{NEXT[run.state] ? NAMES[NEXT[run.state]] : 'No exit from qD'}</span></strong></div><div><small>TRANSITIONS</small><strong>{String(run.tick).padStart(2, '0')}<span>{run.replays} replays</span></strong></div></div>
          </div>
          <section className="panel controls"><div className="panel-heading"><div><span className="section-index">02</span><h2>Build your sequence</h2></div><div className="segmented"><button disabled={locked} className={mode === 'preset' ? 'selected' : ''} onClick={() => setMode('preset')}>Scenarios</button><button disabled={locked} className={mode === 'custom' ? 'selected' : ''} onClick={() => setMode('custom')}>Custom input</button></div></div>
            {mode === 'preset' ? <div className="scenario-select"><label htmlFor="scenario">Test scenario</label><div className="select-wrap"><select id="scenario" value={scenario} disabled={locked} onChange={e => setScenario(e.target.value)}><optgroup label="Valid sequences">{SCENARIOS.filter(s => s.valid).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</optgroup><optgroup label="Invalid sequences">{SCENARIOS.filter(s => !s.valid).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</optgroup></select><ChevronDown size={15} /></div><span className={`expected-result ${selected.valid ? '' : 'invalid'}`}>{selected.valid ? <Check size={13} /> : <CircleHelp size={13} />}{selected.valid ? 'Valid sequence' : 'Triggers a fault'}</span></div> : <div className="custom-control"><label htmlFor="custom">Signal sequence</label><input id="custom" value={custom} disabled={locked} placeholder="R G Y R" aria-invalid={custom.length > 0 && !parsed.valid} aria-describedby="input-help" onChange={e => setCustom(e.target.value)} /><small id="input-help" className={custom.length > 0 && !parsed.valid ? 'error-text' : ''}>{custom.length > 0 && !parsed.valid ? 'Use individual R, G or Y symbols, separated by spaces or commas.' : 'Use R, G, Y separated by spaces or commas.'}</small></div>}
            <div className="sequence-strip" aria-label="Selected signal sequence">{sequence.length ? sequence.map((s, i) => <div className="sequence-item" key={i}>{i > 0 && <ArrowRight size={14} />}<span className={`sequence-token ${locked && run.index === i ? 'active' : ''}`} style={{ '--state-color': COLORS[s] || '#687184' }}>{s}<small>{i === 0 ? 'start' : String(i).padStart(2, '0')}</small></span></div>) : <span className="muted">Enter a sequence to begin.</span>}</div>
            <div className="control-bottom"><div className="run-buttons"><button className={`primary-button ${phase === 'running' ? 'stop' : ''}`} disabled={!validInput && phase !== 'running'} onClick={() => phase === 'running' ? setPhase('failsafe') : phase === 'stepping' ? setPhase('running') : begin()}>{phase === 'running' ? <Square size={15} /> : <Play size={15} fill="currentColor" />}{phase === 'running' ? 'Stop simulation' : phase === 'stepping' ? 'Run automatically' : 'Start simulation'}</button><button className="icon-button" aria-label="Advance one step" title="Advance one step" disabled={phase === 'running' || fault || !validInput} onClick={() => phase === 'stepping' ? advance() : begin('stepping')}><StepForward size={18} /></button><button className="icon-button" aria-label="Reset simulation" title="Reset simulation" onClick={reset}><RotateCcw size={16} /></button></div><div className="speed-control"><span>Speed</span>{[0.5, 1, 2].map(s => <button key={s} className={speed === s ? 'selected' : ''} onClick={() => setSpeed(s)} aria-label={`${s} times speed`} aria-pressed={speed === s}>{s}×</button>)}</div></div>
            <p className="control-note">First symbol = starting light. Remaining symbols = inputs. Valid scenarios replay until stopped.</p>
          </section>
        </section>
        <aside className="theory-column" aria-label="Live automata theory">
          <section className="panel theory-panel"><div className="panel-heading"><div><span className="section-index">03</span><h2>The automaton</h2></div><span className="sync-label"><Activity size={13} /> Live sync</span></div>
            <div className="diagram-heading"><h3>State diagram</h3><span>R → G → Y → R</span></div><DfaDiagram current={run.state} last={run.last} />
            <div className="diagram-legend"><span>◎ Accepting state</span><span><i /> Invalid input</span><span>qD = trap</span></div>
            <div className="table-heading"><h3>Transition function <span className="mono">δ</span></h3><span>Q × Σ → Q</span></div><TransitionTable last={run.last} current={run.state} />
            <div className={`transition-readout ${fault ? 'fault' : ''}`} role="status"><GitBranch size={16} /><div><small>{run.last ? 'LATEST TRANSITION' : 'INITIAL CONFIGURATION'}</small><strong>{run.last ? `δ(${label(run.last.from)}, ${run.last.input}) = ${label(run.last.to)}` : `${label(run.state)} · ${NAMES[run.state]}`}</strong></div><span>{fault ? 'Rejected' : run.last ? 'Valid' : 'Ready'}</span></div>
            <p className="theory-note">Each state–input pair has exactly one outcome. Invalid changes enter <b>qD</b>, which cannot be exited by any input.</p>
          </section>
        </aside>
      </div>
      <section className="panel log-panel"><div className="panel-heading"><div><span className="section-index">04</span><h2>Transition trace</h2></div><span className="small-label">LATEST FIRST · LAST 80 EVENTS</span></div><div className="trace-scroll" aria-label="Transition history">{history.length ? [...history].reverse().map((e, i) => <div className={`trace-entry ${e.valid === false ? 'rejected' : ''}`} key={`${history.length}-${i}`}><span className="trace-number">{String(history.length - i).padStart(2, '0')}</span>{e.start || e.reset ? <><span className="trace-icon">↻</span><b>{e.start ? 'Start' : 'Replay reset'}</b><span>→ {label(e.to)}</span>{e.reset && <small>New demonstration, not a DFA transition</small>}</> : <><span className="trace-icon">{e.valid ? '✓' : '×'}</span><b className="mono">{label(e.from)} <span>—{e.input}→</span> {label(e.to)}</b><small>{e.valid ? 'Valid transition' : 'Invalid input · halted in trap state'}</small></>}</div>) : <div className="trace-empty"><GitBranch size={20} /><div>Your sequence, step by step.<small>Start the simulation or advance a step to see the DFA at work.</small></div></div>}</div></section>
      <section className="panel formal-panel"><button className="formal-toggle" aria-expanded={showTheory} onClick={() => setShowTheory(v => !v)}><span><BookOpen size={17} /> Formal definition & model notes</span><ChevronDown size={18} style={{ transform: showTheory ? 'rotate(180deg)' : '' }} /></button>{showTheory && <div className="formal-content"><div><h3>The five-tuple</h3><p className="mono">M = (Q, Σ, δ, q₀, F)<br />Q = {'{qR, qG, qY, qD}'}<br />Σ = {'{R, G, Y}'}<br />q₀ = qR<br />F = {'{qR, qG, qY}'}</p></div><div><h3>What this demonstrates</h3><p>The DFA validates signal changes. Repeated colors and out-of-order changes are rejected. All three normal states are accepting; qD is non-accepting and has a self-loop for every symbol.</p><p>From the formal start qR, the language is <span className="mono">(GYR)*(ε | G | GY)</span>. A scenario beginning with G or Y demonstrates a local transition from that selected state.</p></div><div><h3>Animation vs. automaton</h3><p>Dwell times, speed, vehicle movement, replay resets and manual stop belong to the demonstration. They are not extra input symbols or DFA states.</p><p>The output depends on the state, as in a Moore machine. This simplified single-approach model does not implement a real intersection's safety or timing requirements.</p></div></div>}</section>
      <footer><span><span className="footer-dot" /> SignalLab <span className="muted"> / Formal Languages & Automata Theory</span></span><a href="/dfa-presentation-guide.pdf" download>Take the theory with you <ArrowRight size={13} /></a></footer>
    </main>
  </div>;
}

function DfaDiagram({ current, last }) {
  const nodes = { R: [80, 66], G: [324, 66], Y: [202, 205], D: [202, 108] };
  const edges = [
    { from: 'R', to: 'G', input: 'G', path: 'M110 66 L292 66', x: 202, y: 55 },
    { from: 'G', to: 'Y', input: 'Y', path: 'M312 96 Q295 177 235 200', x: 294, y: 155 },
    { from: 'Y', to: 'R', input: 'R', path: 'M170 200 Q106 177 89 98', x: 110, y: 155 },
    { from: 'R', to: 'D', input: 'R,Y', path: 'M109 80 L176 103', x: 143, y: 111, invalid: true },
    { from: 'G', to: 'D', input: 'R,G', path: 'M295 80 L228 103', x: 266, y: 111, invalid: true },
    { from: 'Y', to: 'D', input: 'G,Y', path: 'M202 172 L202 134', x: 224, y: 157, invalid: true },
    { from: 'D', to: 'D', input: 'R,G,Y', path: 'M188 87 C164 29 240 29 219 87', x: 202, y: 29, invalid: true },
  ];
  return <svg className="dfa-diagram" viewBox="0 0 404 250" role="img" aria-label={`DFA state diagram. Current state ${label(current)}. Valid cycle qR to qG on G, qG to qY on Y, qY to qR on R. All other inputs lead to qD; qD loops on R, G, Y.`}>
    <defs>{['normal', 'active', 'invalid'].map((s, i) => <marker key={s} id={`arrow-${s}`} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7Z" fill={['#96a3a1', '#23836a', '#db5b52'][i]} /></marker>)}</defs>
    <text x="9" y="52" fontSize="9" fill="#7a8885">start</text><path d="M9 66 H45" stroke="#96a3a1" markerEnd="url(#arrow-normal)" />
    {edges.map((e, i) => { const active = last?.from === e.from && last?.to === e.to; return <g key={i}><path d={e.path} fill="none" stroke={active ? (e.invalid ? '#db5b52' : '#23836a') : e.invalid ? '#bac4c1' : '#96a3a1'} strokeWidth={active ? 2.5 : 1.4} strokeDasharray={e.invalid && !active ? '3 4' : undefined} markerEnd={`url(#arrow-${active ? e.invalid ? 'invalid' : 'active' : 'normal'})`} /><text x={e.x} y={e.y} textAnchor="middle" fontSize="10" fontFamily="monospace" fill={active ? '#173b32' : '#6e7c78'} paintOrder="stroke" stroke="#fff" strokeWidth="5" strokeLinejoin="round">{e.input}</text></g>; })}
    {Object.entries(nodes).map(([s, [x, y]]) => <g key={s}>{current === s && <circle cx={x} cy={y} r={s === 'D' ? 31 : 39} fill={COLORS[s]} opacity=".08" />}<circle cx={x} cy={y} r={s === 'D' ? 24 : 30} fill={current === s ? COLORS[s] : '#fff'} stroke={COLORS[s]} strokeWidth="1.6" />{s !== 'D' && <circle cx={x} cy={y} r="25" fill="none" stroke={current === s ? '#fff' : COLORS[s]} strokeOpacity=".6" />}<text x={x} y={y + 4} textAnchor="middle" fill={current === s ? '#fff' : COLORS[s]} fontSize="13" fontWeight="600" fontFamily="monospace">{label(s)}</text></g>)}
  </svg>;
}
function TransitionTable({ last, current }) {
  return <table className="transition-table"><caption className="sr-only">Complete DFA transition table, highlighted at the latest transition</caption><thead><tr><th scope="col">State / input</th>{['R', 'G', 'Y'].map(s => <th scope="col" key={s}><Dot state={s} />{s}</th>)}</tr></thead><tbody>{['R', 'G', 'Y', 'D'].map(s => <tr key={s}><th scope="row"><span className={current === s ? 'current-row' : ''}>{label(s)}</span>{s !== 'D' && <small>◎</small>}</th>{['R', 'G', 'Y'].map(input => <td key={input} className={`${TRANSITIONS[s][input] === 'D' ? 'trap-cell' : 'valid-cell'} ${last?.from === s && last?.input === input ? 'selected-cell' : ''}`}>{label(TRANSITIONS[s][input])}</td>)}</tr>)}</tbody></table>;
}
