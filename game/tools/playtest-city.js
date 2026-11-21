// Plays the city lab from the first station to the last with simulated key presses, both siblings, and reports each
// step and the time each station took to the dev server.
// Run python tools/dev_server.py 8780 log.txt, open http://127.0.0.1:8780/tools/playtest-city.html and read log.txt:
// the last line says PLAY PASSED or PLAY FAILED. (It always starts at station 0; ?fps=30 runs it like a slow device.)
// It presses the same keys a player would and never moves anybody by magic, so if it gets through, the level can be
// finished. tools/playtest-city.html?solo=1 runs the other test instead: that one sibling alone cannot finish a station.
(async () => {
  let sent = Promise.resolve(); // one line at a time: two reports arriving together can overwrite each other in the log file
  const log = (t) => (sent = sent.then(() => fetch('/log', { method: 'POST', body: t }).catch(() => {})));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const tick = () => new Promise((r) => requestAnimationFrame(r));
  while (typeof players === 'undefined' || typeof kit === 'undefined') await wait(50);
  await wait(400);
  const frame = async () => { const t = game.time; do { await tick(); } while (game.time === t); }; // one frame of the game
  const frames = async (n) => { for (let i = 0; i < n; i++) await frame(); };
  const key = (code, on) => dispatchEvent(new KeyboardEvent(on ? 'keydown' : 'keyup', { code }));
  const tap = async (code) => { key(code, true); await frames(3); key(code, false); await frames(2); };
  const until = async (cond, max = 5000) => { const t0 = performance.now(); while (!cond() && performance.now() - t0 < max) await frame(); return !!cond(); };
  const up = (p) => FEET - p.y; // how high the feet are above the pavement
  const near = (v, want, tol) => Math.abs(v - want) <= tol;
  const JUMP = { sister: 'KeyW', brother: 'ArrowUp' }, GRAB = { sister: 'KeyS', brother: 'ArrowDown' };
  // walk to a place, jumping whenever something is in the way
  const go = async (p, x, max = 9000) => {
    const k = p.keys, t0 = performance.now(); let held = 0;
    while (Math.abs(p.x - x) >= 16 && performance.now() - t0 < max) {
      const d = x > p.x ? 1 : -1; key(d > 0 ? k.left : k.right, false); key(d > 0 ? k.right : k.left, true);
      if (held > 0) { if (--held === 0) key(k.up, false); } else if (p.grounded && p.hitSide === d && !p.crawl) { key(k.up, true); held = 3; }
      await frame();
    }
    key(k.left, false); key(k.right, false); key(k.up, false); await until(() => p.grounded && Math.abs(p.vx) < 5, 2500); await frames(3); // standing still, not sliding to a stop
    return Math.abs(p.x - x) < 60;
  };
  const face = async (p, d) => { const c = d > 0 ? p.keys.right : p.keys.left; key(c, true); await frames(2); key(c, false); await frames(3); };
  const hop = async (p) => { await tap(JUMP[p.who]); await until(() => p.grounded, 2500); await frames(2); };           // jump on the spot
  const leap = async (p, from, d = 1) => { // run, and jump as they pass a spot: from one step up onto the next
    const c = d > 0 ? p.keys.right : p.keys.left; key(c, true); await until(() => (p.x - from) * d >= 0, 5000); key(p.keys.up, true); await frames(3); key(p.keys.up, false);
    await until(() => !p.grounded, 500); await until(() => p.grounded, 2500); key(c, false); await frames(3);
  };
  const carry = async (p, box, toX, d, from = d) => { // fetch a box (standing on its 'from' side) and put it down so that it lands at toX
    await go(p, box.x - from * 84); await face(p, from); await tap(GRAB[p.who]); if (!(await until(() => p.carry === box && box.liftT >= 1, 2500))) return false;
    await go(p, toX - d * ((p.w + box.w) / 2 + 10)); await face(p, d); await tap(GRAB[p.who]); return (await until(() => !box.held && box.grounded, 2500)) && Math.abs(box.x - toX) < 40;
  };
  const liftUp = async () => { await tap('ArrowDown'); return until(() => MV.duo.state === 'on', 2500); };               // he asks, she lifts
  const of = (kind) => kit.filter((o) => o.def.kind === kind);
  const inStation = (n, kind) => kit.filter((o) => o.station === n && o.def.kind === kind);

  let fails = 0;
  const check = (name, ok, info = '') => { if (!ok) fails++; log(`${ok ? 'ok  ' : 'FAIL'} ${name}${info ? '   [' + info + ']' : ''}`); return ok; };
  if (QS.get('solo')) { window.TEST = { log, wait, frame, frames, key, tap, until, up, near, go, face, hop, leap, carry, liftUp, of, inStation, check, fails: () => fails, JUMP, GRAB }; return; } // the solo test takes over (playtest-city-solo.js)
  try {
    const H = MOVE.jumpHeight * broHeight();
    if (FROM <= 0) { // ================= station 0: jump, carry, the torn map
    let top = 0; key('KeyW', true); for (let i = 0; i < 80; i++) { await frame(); if (i === 2) key('KeyW', false); top = Math.max(top, up(sis)); if (i > 6 && sis.grounded) break; }
    check(`a jump is ${MOVE.jumpHeight} brother-heights`, near(top, H, H * 0.03), `wanted ${H.toFixed(0)}, got ${top.toFixed(0)}`);
    const box0 = inStation(0, 'box')[0].body, shelf = inStation(0, 'ledge')[0].def;
    check('she gets over the steps and the low wall', (await go(sis, 1330)) && sis.x > 1250);
    check('he gets over them too', (await go(bro, 1300)) && bro.x > 1250);
    check('he carries the light box to the shelf', await carry(bro, box0, shelf.x[0] - 60, 1), `box at ${box0.x.toFixed(0)}`);
    await go(bro, box0.x); await hop(bro); check('he hops onto the box', bro.on === box0);
    await leap(bro, bro.x - 5); check('and from the box onto the shelf', near(up(bro), shelf.h, 3), `height ${up(bro).toFixed(0)}`);
    await go(bro, 1660); check('star on the shelf', of('star')[0].star.got);
    await go(sis, 2380); await go(bro, 2330);
    check('the bar lets them through', sis.x > 1900 && bro.x > 1900);
    const gate0 = inStation(0, 'gate')[0], finds = of('find');
    await go(sis, 2480); check('the wind tears the map', game.map.gust && (await until(() => game.map.landed(2), 5000)));
    check('the gate is shut without the pieces', gate0.state.open === 0);
    await go(sis, finds[0].def.x - 20); await tap('KeyS'); check('she takes the piece from the shop sign', game.map.got[0]);
    await go(bro, finds[1].def.x - 15); await tap('ArrowDown'); check('he fishes the piece out of the drain', game.map.got[1]);
    await go(sis, finds[2].def.x - 20); await go(bro, finds[2].def.x + 50);
    check('she lifts him', await liftUp()); await tap('ArrowDown'); check('and he takes the piece from the window box', game.map.got[2]);
    await hop(bro);
    check('three pieces open the gate', await until(() => gate0.state.open >= 1, 3000));
    check('into station 1', (await go(sis, 3780)) && (await go(bro, 3830)) && game.station === 1, `station ${game.station}`);
    }
    if (FROM <= 1) {
    // ================= station 1: plate and gate
    const crate = inStation(1, 'crate')[0].body, plate1 = inStation(1, 'plate')[0], gate1 = inStation(1, 'gate')[0], hoist = inStation(1, 'lever')[0];
    await go(bro, hoist.def.x - 15); await tap('ArrowDown');
    check('his hand fits the hatch: the hoist lets the crate down', (await until(() => crate.grounded && up(crate) < 3, 3000)));
    check('she carries the crate onto the green plate', (await carry(sis, crate, plate1.def.x, 1)) && crate.on === plate1.ledge, `crate at ${crate.x.toFixed(0)}`);
    check('the shutter opens and stays open', (await until(() => gate1.state.open >= 1, 3000)));
    check('into station 2', (await go(sis, 4960)) && (await go(bro, 5010)) && game.station === 2 && gate1.state.open >= 1, `station ${game.station}`);
    }
    if (FROM <= 2) {
    // ================= station 2: a box as a step
    const box2 = inStation(2, 'box')[0].body, pup = inStation(2, 'puppy')[0], gate2 = inStation(2, 'gate')[0];
    check('he brings the box under the puppy', await carry(bro, box2, pup.def.x - 20, 1), `box at ${box2.x.toFixed(0)}`);
    await go(sis, box2.x); await hop(sis); check('she steps onto the box', sis.on === box2);
    await go(bro, box2.x + 78);
    check('from the box she lifts him', await liftUp()); await tap('ArrowDown');
    check('and he gets the last piece from the puppy', game.map.got[3] && pup.state.mode !== 'sit');
    await hop(bro); await go(sis, box2.x - 120);
    check('four pieces open the market gate', await until(() => gate2.state.open >= 1, 3000));
    check('into station 3', (await go(sis, 6840)) && (await go(bro, 6900)) && game.station === 3, `station ${game.station}`);
    check('the puppy tags along and stays in the market', pup.state.mode === 'follow' && pup.state.x < 6760 && pup.state.x > pup.def.x, `puppy at ${pup.state.x.toFixed(0)}`);
    }
    if (FROM <= 3) {
    // ================= station 3: the see-saw (and things to play with)
    const fountain = of('fountain')[0], saw = of('seesaw')[0], balcony = inStation(3, 'ledge')[0].def, ladder = of('ladder')[0];
    await go(sis, fountain.def.x - 170); const before = MV.fx.length; await tap('KeyS'); check('she can splash in the fountain', MV.fx.length > before);
    await go(bro, saw.def.x + 150); if (bro.on !== saw.ledge) await hop(bro); check('he gets onto the blue end', bro.on === saw.ledge, `he is at ${bro.x.toFixed(0)}, ${up(bro).toFixed(0)} up; she is at ${sis.x.toFixed(0)}; the screen shows ${camX.toFixed(0)} to ${(camX + VW).toFixed(0)}`);
    await go(sis, saw.def.x - 330); await leap(sis, saw.def.x - 255);
    check('her landing on the green end sends him up to the balcony', (await until(() => bro.grounded && near(up(bro), balcony.h, 3), 4000)), `he is at ${up(bro).toFixed(0)}`);
    await go(bro, ladder.def.x + 40); await tap('ArrowDown'); check('he lets the rope ladder down', await until(() => ladder.state.out >= 1, 2500));
    await go(sis, ladder.def.x); key('KeyW', true);
    check('she climbs up', (await until(() => sis.grounded && near(up(sis), balcony.h, 3), 6000)), `she is at ${up(sis).toFixed(0)}`); key('KeyW', false);
    check('over the wall, into station 4', (await go(sis, 9160)) && (await go(bro, 9210)) && game.station === 4, `station ${game.station}`);
    }
    if (FROM <= 4) {
    // ================= station 4: the canal
    const boats = of('boat'), ferry = of('ferry')[0], fLever = inStation(4, 'lever')[0];
    let wet = false; const w1 = setInterval(() => { wet = wet || !!bro.gone; }, 10);
    const over = await go(bro, fLever.def.x - 12, 14000); clearInterval(w1);
    check('the small boats carry him across', over && !wet && bro.x > CANAL[1]);
    await tap('ArrowDown'); check('his lever sends the ferry over', await until(() => ferry.state.x <= ferry.def.x[0] + 1, 7000));
    await go(sis, ferry.def.x[0]); check('she steps onto the ferry', sis.on === ferry.ledge);
    await tap('ArrowDown'); check('and it carries her across', (await until(() => ferry.state.x >= ferry.def.x[1] - 1, 7000)) && sis.on === ferry.ledge && !sis.gone);
    check('into station 5', (await go(sis, 10560)) && (await go(bro, 10520)) && game.station === 5, `station ${game.station}`);
    }
    if (FROM <= 5) {
    // ================= station 5: the pulley lift
    const lift = of('pulley')[0], boxes5 = inStation(5, 'box').map((o) => o.body), ledge5 = inStation(5, 'ledge')[0].def;
    await go(bro, lift.def.a); check('he stands on the lift', bro.on === lift.a);
    await go(sis, lift.def.rope.x - 20); key('KeyS', true);
    check('she hauls on the rope and he rides up', (await until(() => lift.state.u >= 1, 7000)) && near(up(bro), lift.def.high, 3), `he is at ${up(bro).toFixed(0)}`);
    await go(bro, ledge5.x[1] - 60); key('KeyS', false);
    check('let go, and the lift comes back down', await until(() => lift.state.u === 0, 7000));
    await go(sis, lift.def.a); check('she stands on the lift', sis.on === lift.a);
    check('he puts one box on the other platform: not enough', (await carry(bro, boxes5[0], lift.def.b + 40, -1, 1)) && boxes5[0].on === lift.b && lift.state.u === 0, `box at ${boxes5[0].x.toFixed(0)}`);
    check('a second box on top', await carry(bro, boxes5[1], lift.def.b + 40, -1, 1), `box at ${boxes5[1].x.toFixed(0)}`);
    check('two boxes lift her', (await until(() => lift.state.u >= 1, 7000)) && near(up(sis), lift.def.high, 3), `she is at ${up(sis).toFixed(0)}`);
    check('both walk on along the terrace', (await go(sis, 11520)) && (await go(bro, 11480)) && near(up(sis), 520, 3) && near(up(bro), 520, 3));
    check('down the steps, into station 6', (await go(sis, 12520)) && (await go(bro, 12470)) && game.station === 6, `station ${game.station}`);
    }
    if (FROM <= 6) {
    // ================= station 6: boost and toss, the parasols
    const shelf6 = inStation(6, 'ledge')[0].def, crank = inStation(6, 'lever')[0], paras = of('parasol'), wall6 = inStation(6, 'block')[0].def;
    await go(sis, shelf6.x[0] - 50); await go(bro, shelf6.x[0] + 20);
    check('she lifts him', await liftUp()); key('KeyD', true); await frames(2); await tap('KeyS'); key('KeyD', false);
    check('and tosses him onto the high shelf', (await until(() => bro.grounded, 3000)) && near(up(bro), shelf6.h, 3), `he is at ${up(bro).toFixed(0)}`);
    await go(bro, crank.def.x - 10); await tap('ArrowDown');
    check('he winds the crank and the parasols open', await until(() => paras.every((o) => !o.ledge.off), 4000));
    for (const p of [sis, bro]) {
      await go(p, paras[0].def.x - 50); await hop(p); const on1 = p.on === paras[0].ledge;
      await leap(p, paras[0].def.x + 50); const on2 = p.on === paras[1].ledge; await leap(p, paras[1].def.x + 50); const on3 = p.on === paras[2].ledge; await leap(p, paras[2].def.x + 55);
      check(`${p.who} goes up the parasols`, on1 && on2 && on3, `${on1} ${on2} ${on3}`);
      check(`${p.who} is over the wall`, (await go(p, wall6.x[1] + 150)) && p.x > wall6.x[1], `at ${p.x.toFixed(0)}`);
    }
    check('into station 7', (await go(sis, 14100)) && (await go(bro, 14060)) && game.station === 7, `station ${game.station}`);
    }
    if (FROM <= 7) {
    // ================= station 7: the Old Bridge
    const bridge = of('bridge')[0], [post, hut] = inStation(7, 'lever');
    await go(sis, post.def.x - 15); await go(bro, hut.def.x - 15);
    key('KeyS', true); await wait(1200); check('her lever alone does not move the bridge', sis.holding === post.thing && bridge.state.prog === 0);
    key('ArrowDown', true);
    check('both levers held: the bridge comes down', (await until(() => bridge.state.down, 6000)) && bro.holding === hut.thing); key('KeyS', false); key('ArrowDown', false);
    check('over the bridge to the park gate', (await go(sis, PARK_GATE - 20, 14000)) && (await go(bro, PARK_GATE + 30, 14000)));
    check('the end card', await until(() => game.done, 6000));
    }
    // ================= how long each station took
    const ends = game.entered.slice(1).concat([game.finished || game.time]);
    STATIONS.forEach((s, n) => n >= FROM && log(`time  station ${s.name.split(':')[0]}: ${(ends[n] - game.entered[n]).toFixed(0)} s`));
    log(`time  whole city: ${(game.finished || game.time).toFixed(0)} s   map pieces ${piecesGot()}/4   stars ${starsGot()}/${starsAll}`);
    log(`frame rate: ${game.fps.toFixed(0)} a second, slowest frame ${game.slow.toFixed(0)} ms, canvas ${cv.width}x${cv.height}`);
    log(fails ? `PLAY FAILED ${fails} check${fails > 1 ? 's' : ''}` : 'PLAY PASSED');
  } catch (e) { log('PLAY FAILED ' + (e.stack || e.message)); }
})();
