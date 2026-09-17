import test from 'node:test';
import assert from 'node:assert/strict';
import { TRANSITIONS, SCENARIOS, parseSequence, advanceRun } from '../src/dfa.js';
import { initialCars, stepTraffic, STOP, CAR_LENGTH, GAP } from '../src/traffic.js';

test('DFA is total and deterministic, with an absorbing trap', () => {
  for (const state of ['R','G','Y','D']) {
    assert.deepEqual(Object.keys(TRANSITIONS[state]), ['R','G','Y']);
    for (const input of ['R','G','Y']) assert.ok(['R','G','Y','D'].includes(TRANSITIONS[state][input]));
  }
  assert.deepEqual(TRANSITIONS.D, {R:'D',G:'D',Y:'D'});
});
test('every original scenario has the intended acceptance result', () => {
  for (const scenario of SCENARIOS) {
    let state = scenario.seq[0];
    for (const input of scenario.seq.slice(1)) state = TRANSITIONS[state][input];
    assert.equal(state !== 'D', scenario.valid, scenario.label);
  }
});
test('parser rejects combined and unknown tokens instead of silently accepting them', () => {
  for (const invalid of ['', 'RG', 'GY', 'RGY', 'R G X', 'R;G']) assert.equal(parseSequence(invalid).valid, false);
  assert.deepEqual(parseSequence(' r, g y '), {tokens:['R','G','Y'],valid:true});
});
test('replays are distinct from DFA transitions and trap cannot be advanced out of', () => {
  let run = {state:'R',index:0,tick:0,replays:0};
  const seq = ['R','G','Y','R'];
  for (let i=0;i<4;i++) run = advanceRun(run,seq);
  assert.equal(run.state,'G'); assert.equal(run.tick,4); assert.equal(run.replays,1);
  assert.equal(run.entries[0].reset,true);
  const halted = advanceRun({state:'R',index:0,tick:0,replays:0},['R','Y']);
  assert.equal(halted.state,'D'); assert.equal(advanceRun(halted,['R','Y']),halted);
  const single = advanceRun({state:'G',index:0,tick:0,replays:0},['G']);
  assert.equal(single.state,'G'); assert.equal(single.tick,0); assert.equal(single.replays,1);
});
test('red queues never cross the line or overlap', () => {
  let cars = initialCars();
  for(let i=0;i<1200;i++) cars=stepTraffic(cars,'R',1/60);
  assert.ok(cars[0].x <= STOP); assert.ok(cars[0].x > STOP-1);
  const sorted=[...cars].sort((a,b)=>b.x-a.x);
  for(let i=1;i<sorted.length;i++) assert.ok(sorted[i-1].x-sorted[i].x>=CAR_LENGTH+GAP-.001);
});
test('committed cars clear after yellow without moving backward', () => {
  let cars=[{id:0,x:STOP+10,v:120},{id:1,x:STOP-100,v:120}];
  for(let i=0;i<120;i++) {
    const next=stepTraffic(cars,'Y',1/60);
    for (const c of next) assert.ok(c.x >= cars.find(p=>p.id===c.id).x);
    cars=next;
  }
  assert.ok(cars.find(c=>c.id===0).x>650);
  assert.ok(cars.find(c=>c.id===1).x<=STOP);
});
test('frozen traffic preserves exact positions; long runs retain safe spacing', () => {
  const original=initialCars(); assert.equal(stepTraffic(original,'frozen',1),original);
  let cars=original;
  for(let i=0;i<18000;i++) {
    cars=stepTraffic(cars,['R','G','Y'][Math.floor(i/300)%3],1/60);
    const sorted=[...cars].sort((a,b)=>b.x-a.x);
    for(let j=1;j<sorted.length;j++) assert.ok(sorted[j-1].x-sorted[j].x>=CAR_LENGTH+GAP-.01);
  }
});
