import { useEffect, useRef } from 'react';
import { initialCars, stepTraffic } from './traffic';

const paints = ['#f3f0e7', '#317aa1', '#bc6652', '#607e69', '#d7ae64', '#46576c'];
export default function Intersection({ state, phase, speed, generation }) {
  const carNodes = useRef({});
  const brakeNodes = useRef({});
  const cars = useRef(initialCars());
  const settings = useRef({ state, phase, speed });
  useEffect(() => { settings.current = { state, phase, speed }; }, [state, phase, speed]);
  useEffect(() => {
    cars.current = initialCars();
    for (const car of cars.current) carNodes.current[car.id]?.setAttribute('transform', `translate(${car.x - 62} 300)`);
  }, [generation]);
  useEffect(() => {
    let frame;
    let previous;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function animate(now) {
      const dt = previous === undefined ? 0 : Math.min((now - previous) / 1000, 0.04);
      previous = now;
      const config = settings.current;
      const frozen = reducedMotion.matches || ['halted', 'failsafe', 'stepping'].includes(config.phase);
      cars.current = stepTraffic(cars.current, frozen ? 'frozen' : config.state, dt * config.speed);
      for (const car of cars.current) {
        carNodes.current[car.id]?.setAttribute('transform', `translate(${car.x - 62} 300)`);
        brakeNodes.current[car.id]?.setAttribute('opacity', car.v < 100 && config.state !== 'G' ? '1' : '.25');
      }
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);
  const fault = state === 'D';
  const stopped = phase === 'failsafe';
  const active = stopped ? 'Y' : fault ? 'R' : state;
  return <svg className="intersection" viewBox="0 0 1000 510" role="img" aria-label={`Animated eastbound traffic intersection. ${stopped ? 'Manual stop, amber flashing' : fault ? 'Controller fault, red flashing' : `${state} signal active`}`}>
    <defs>
      <linearGradient id="asphalt" x2="0" y2="1"><stop stopColor="#647074" /><stop offset="1" stopColor="#58666a" /></linearGradient>
      <linearGradient id="signal-metal" x2="1" y2="0"><stop stopColor="#293c42" /><stop offset=".45" stopColor="#526369" /><stop offset="1" stopColor="#26363c" /></linearGradient>
      <linearGradient id="glass" x2="1" y2="1"><stop stopColor="#16323f" /><stop offset=".5" stopColor="#547786" /><stop offset="1" stopColor="#223e4b" /></linearGradient>
      <linearGradient id="body-shine" x2="0" y2="1"><stop stopColor="#fff" stopOpacity=".6" /><stop offset=".4" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#102e36" stopOpacity=".3" /></linearGradient>
      <radialGradient id="tree-canopy"><stop stopColor="#87ac80" /><stop offset=".65" stopColor="#6e9667" /><stop offset="1" stopColor="#5d8258" /></radialGradient>
      <filter id="car-shadow" x="-30%" y="-70%" width="170%" height="250%"><feDropShadow dx="2" dy="5" stdDeviation="3" floodColor="#183a3c" floodOpacity=".3" /></filter>
      <filter id="tree-shadow" x="-50%" y="-50%" width="200%" height="220%"><feDropShadow dx="5" dy="7" stdDeviation="4" floodColor="#3f6344" floodOpacity=".18" /></filter>
      <pattern id="paving" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#e3e6dd" /><path d="M24 0H0V24" fill="none" stroke="#cdd4cc" strokeWidth=".7" /></pattern>
      <pattern id="road-grain" width="7" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="3" r=".6" fill="#fff" opacity=".08" /><circle cx="6" cy="7" r=".6" fill="#142e34" opacity=".12" /></pattern>
    </defs>
    <rect width="1000" height="510" fill="#e8ede3" />
    <path d="M0 172H443V0H667V172H1000V380H667V510H443V380H0Z" fill="url(#paving)" />
    <path d="M0 192H464V0H646V192H1000V361H646V510H464V361H0Z" fill="#c4cbc3" />
    <path d="M0 201H473V0H637V201H1000V352H637V510H473V352H0Z" fill="url(#asphalt)" />
    <path d="M0 201H473V0H637V201H1000V352H637V510H473V352H0Z" fill="url(#road-grain)" />
    <path d="M0 205H469V0M641 0V205H1000M0 348H469V510M641 510V348H1000" stroke="#f0f0df" strokeWidth="2" fill="none" opacity=".6" />
    <path d="M0 275H414M698 275H1000M553 0V143M553 412V510" stroke="#e7cd8c" strokeWidth="2" fill="none" /><path d="M0 281H414M698 281H1000M559 0V143M559 412V510" stroke="#e7cd8c" strokeWidth="2" fill="none" />
    <path d="M20 239H407M705 239H980M20 314H400M710 314H980M515 15V134M596 15V135M515 420V500M596 420V500" stroke="#f2f2e7" strokeWidth="1.7" strokeDasharray="19 18" opacity=".4" />
    <rect x="427" y="285" width="5" height="58" rx="1" fill="#fffbed" /><rect x="678" y="211" width="5" height="58" rx="1" fill="#fffbed" />
    {Array.from({ length: 8 }, (_, i) => <g key={i}><rect x="448" y={211 + i * 17} width="16" height="9" fill="#f4f2e5" opacity=".88" /><rect x="648" y={211 + i * 17} width="16" height="9" fill="#f4f2e5" opacity=".88" /><rect x={482 + i * 18} y="172" width="10" height="17" fill="#f4f2e5" opacity=".88" /><rect x={482 + i * 18} y="365" width="10" height="17" fill="#f4f2e5" opacity=".88" /></g>)}
    <g stroke="#f4f2e5" strokeWidth="3" fill="none" opacity=".6"><path d="M212 314H245L237 307M245 314L237 321M802 240H769L777 233M769 240L777 247" /></g>
    <text x="286" y="256" fontSize="10" fontFamily="sans-serif" fill="#fff" opacity=".45" letterSpacing="3">OAK STREET</text><text x="713" y="333" fontSize="10" fontFamily="sans-serif" fill="#fff" opacity=".45" letterSpacing="3">OAK STREET</text>
    <g><rect x="56" y="49" width="218" height="101" rx="8" fill="#bec8bd" opacity=".4" transform="translate(6 8)" /><rect x="56" y="49" width="218" height="101" rx="7" fill="#f6f6ee" /><rect x="66" y="59" width="198" height="81" rx="3" fill="#d6ded4" /><rect x="81" y="73" width="111" height="51" rx="3" fill="#eaf0e5" /><path d="M85 98H188M135 77V119" stroke="#c2cec0" /><rect x="211" y="77" width="35" height="22" rx="2" fill="#aebcb0" /><path d="M215 83H242M215 89H242" stroke="#dfe8dd" /><text x="97" y="104" fill="#85967e" fontSize="9" letterSpacing="2">THE CORNER</text></g>
    <path d="M722 33H960V130H722Z" fill="#d4dfce" /><path d="M748 33V130M722 105H960" stroke="#edf0e6" strokeWidth="12" />
    <g fill="#c5d4bd"><rect x="709" y="412" width="246" height="75" rx="22" /><rect x="61" y="421" width="236" height="64" rx="20" /></g>
    <g stroke="#a88c69" strokeWidth="3"><path d="M314 121H348M314 127H348M314 133H348M775 429H809M775 435H809M775 441H809" /></g>
    {[ [335,57,24], [391,124,21], [78,398,18], [329,450,28], [401,411,19], [716,66,22], [912,91,29], [865,426,24], [946,462,21], [127,467,19] ].map(([x, y, r], i) => <g key={i} filter="url(#tree-shadow)"><circle cx={x} cy={y} r={r} fill="url(#tree-canopy)" /><circle cx={x - r * .25} cy={y - r * .25} r={r * .58} fill="#99b68b" opacity=".35" /><circle cx={x + r * .3} cy={y + r * .1} r={r * .42} fill="#517c51" opacity=".2" /></g>)}
    <g transform="translate(828 226) rotate(180 31 14)" opacity=".6"><Car color="#b8c1bb" /></g>
    {initialCars().map(car => <g key={car.id} ref={node => { carNodes.current[car.id] = node; }} transform={`translate(${car.x - 62} 300)`}><Car color={paints[car.id]} brakeRef={node => { brakeNodes.current[car.id] = node; }} /></g>)}
    <g transform="translate(391 365)"><ellipse cx="15" cy="20" rx="15" ry="6" fill="#789184" opacity=".2" /><rect width="22" height="10" rx="3" fill="#9caaa0" /><circle cx="11" cy="5" r="4" fill="#526760" /></g>
    <g className="traffic-signal" transform="translate(382 109)" filter="url(#car-shadow)"><rect x="17" y="22" width="10" height="65" rx="3" fill="url(#signal-metal)" /><rect x="2" y="0" width="40" height="90" rx="10" fill="#20353b" stroke="#71837c" strokeWidth="1.5" /><rect x="7" y="5" width="30" height="80" rx="7" fill="#172c32" />{[['R', '#ff7466'], ['Y', '#ffd164'], ['G', '#67e3ab']].map(([s, color], i) => <g key={s}><ellipse cx="22" cy={19 + i * 26} rx="12" ry="11" fill="#0e2026" /><circle cx="22" cy={21 + i * 26} r="8.5" fill={active === s ? color : s === 'R' ? '#502f31' : s === 'Y' ? '#49432d' : '#25463d'} className={active === s && (fault || stopped) ? 'signal-flash' : ''} style={active === s ? { filter: `drop-shadow(0 0 5px ${color})` } : {}} /><path d={`M14 ${17 + i * 26}Q22 ${10 + i * 26} 30 ${17 + i * 26}`} stroke="#a7bbb2" opacity=".15" fill="none" /></g>)}</g>
    <g transform="translate(285 371)"><rect width="133" height="29" rx="5" fill="#fff" fillOpacity=".92" /><circle cx="13" cy="14" r="3" fill={fault ? '#db5b52' : '#23836a'} /><text x="24" y="18" fontSize="10" fill="#435c52" fontFamily="sans-serif">MONITORED SIGNAL</text></g>
  </svg>;
}
function Car({ color, brakeRef }) {
  return <g filter="url(#car-shadow)"><g fill="#223239"><rect x="10" y="-2" width="12" height="5" rx="2" /><rect x="43" y="-2" width="12" height="5" rx="2" /><rect x="10" y="25" width="12" height="5" rx="2" /><rect x="43" y="25" width="12" height="5" rx="2" /></g><path d="M8 0H47Q61 0 62 10V18Q61 28 47 28H8Q1 28 0 20V8Q1 0 8 0Z" fill={color} /><path d="M8 0H47Q61 0 62 10V18Q61 28 47 28H8Q1 28 0 20V8Q1 0 8 0Z" fill="url(#body-shine)" /><path d="M18 3L39 3L45 7V21L39 25H18L13 21V7Z" fill="url(#glass)" /><path d="M22 4H35L38 7V21L35 24H22L19 21V7Z" fill={color} /><path d="M23 5H34" stroke="#fff" strokeOpacity=".5" /><path d="M47 4L51 5M47 24L51 23" stroke="#162f39" strokeOpacity=".3" /><rect x="42" y="-2" width="5" height="4" rx="1.5" fill={color} /><rect x="42" y="26" width="5" height="4" rx="1.5" fill={color} /><g fill="#fff7d9"><rect x="58" y="4" width="3" height="6" rx="1.2" /><rect x="58" y="18" width="3" height="6" rx="1.2" /></g><g fill="#9d3f36"><rect x="1" y="3" width="3" height="6" rx="1" /><rect x="1" y="19" width="3" height="6" rx="1" /></g><g ref={brakeRef} fill="#ff4f42" opacity=".25" style={{ filter: 'drop-shadow(-2px 0 3px #ff5544)' }}><rect x="1" y="3" width="3" height="6" rx="1" /><rect x="1" y="19" width="3" height="6" rx="1" /></g><path d="M4 11V17M60 11V17" stroke="#b6c2be" strokeWidth="2" /></g>;
}
