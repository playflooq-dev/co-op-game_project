// Tests the city lab with simulated key presses and reports each check to the dev server.
// Run python tools/dev_server.py 8780 log.txt, open http://127.0.0.1:8780/tools/playtest-city.html and read log.txt:
// the last line says PLAY PASSED or PLAY FAILED.
// Phase 1 (this version) checks the movement and the abilities on the test street, one at a time: it puts the siblings
// where a check starts, then presses the same keys a player would. (The first city level's play-through test is in
// the git history, at the tag checkpoint-2026-11-20-city-music.)
(async () => {
  let sent = Promise.resolve(); // one line at a time: two reports arriving together can overwrite each other in the log file
  const log = (t) => (sent = sent.then(() => fetch('/log', { method: 'POST', body: t }).catch(() => {})));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const tick = () => new Promise((r) => requestAnimationFrame(r));
  const frame = async () => { const t = game.time; do { await tick(); } while (game.time === t); }; // one frame of the game (it may draw fewer than the screen does: ?fps=30)
  const frames = async (n) => { for (let i = 0; i < n; i++) await frame(); };
  const key = (code, on) => dispatchEvent(new KeyboardEvent(on ? 'keydown' : 'keyup', { code }));
  const tap = async (code) => { key(code, true); await frames(3); key(code, false); await frames(2); };
  const until = async (cond, max = 5000) => { const t0 = performance.now(); while (!cond() && performance.now() - t0 < max) await frame(); return !!cond(); };
  while (typeof players === 'undefined' || typeof kit === 'undefined') await wait(50);
  await wait(400);

  const KEYS = ['KeyA', 'KeyD', 'KeyW', 'KeyS', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
  const up = (p) => FEET - p.y; // how high the feet are above the pavement
  const view = () => { camX = clamp((sis.x + bro.x) / 2 - VW / 2, 0, Math.max(0, LAB.street[1] + 240 - VW)); };
  const drop = (b, x, h = 0) => Object.assign(b, { x, y: FEET - h - 1, vx: 0, vy: 0, grounded: false, on: null, held: false, carrier: null });
  const reset = () => { // let go of everything and stand up
    for (const c of KEYS) key(c, false);
    if (MV.duo.state) endRide(); MV.pending = null;
    for (const p of players) { if (p.carry) putDown(p); Object.assign(p, { crawl: false, h: p.standH, strain: 0, cheer: 0, flying: false, tossed: false }); }
  };
  const both = async (xs, xb, hs = 0, hb = 0) => { reset(); drop(sis, xs, hs); drop(bro, xb, hb); view(); await until(() => sis.grounded && bro.grounded, 3000); await frames(4); };
  // walk to a place, jumping whenever something is in the way
  const go = async (p, x, max = 7000) => {
    const k = p.keys, t0 = performance.now(); let held = 0;
    while (Math.abs(p.x - x) >= 16 && performance.now() - t0 < max) {
      const d = x > p.x ? 1 : -1; key(d > 0 ? k.left : k.right, false); key(d > 0 ? k.right : k.left, true);
      if (held > 0) { if (--held === 0) key(k.up, false); } else if (p.grounded && p.hitSide === d && !p.crawl) { key(k.up, true); held = 3; }
      await frame();
    }
    key(k.left, false); key(k.right, false); key(k.up, false); await until(() => p.grounded, 2500); await frames(3);
    return Math.abs(p.x - x) < 60;
  };
  const jumpTop = async (p, hold = 3) => { // press jump, and say how high the feet got
    const k = p.keys, base = up(p); let top = 0, n = 0; key(k.up, true);
    do { await frame(); if (++n === hold) key(k.up, false); top = Math.max(top, up(p) - base); } while (!(p.grounded && n > 5) && n < 500);
    key(k.up, false); await frames(3); return top;
  };
  const boxes = kit.filter((o) => o.body && !o.body.heavy).map((o) => o.body), crate = kit.find((o) => o.body && o.body.heavy).body;
  const plank = kit.find((o) => o.def.kind === 'plank'), seesaw = kit.find((o) => o.def.kind === 'seesaw'), bell = kit.find((o) => o.def.kind === 'bell');
  const stars = kit.filter((o) => o.star), ledges = kit.filter((o) => o.def.kind === 'ledge').map((o) => o.def), tunnel = kit.find((o) => o.def.kind === 'tunnel').def;
  const [shelf, balcony, high] = ledges, wall = kit.find((o) => o.def.look === 'wall').def;

  let fails = 0;
  const check = (name, ok, info = '') => { if (!ok) fails++; log(`${ok ? 'ok  ' : 'FAIL'} ${name}${info ? '   [' + info + ']' : ''}`); };
  const near = (v, want, tol) => Math.abs(v - want) <= tol;
  try {
    const H = MOVE.jumpHeight * broHeight();
    // ---- jumping
    await both(400, 560);
    const js = await jumpTop(sis), jb = await jumpTop(bro);
    check(`jump height is ${MOVE.jumpHeight} brother-heights for both`, near(js, H, H * 0.03) && near(jb, H, H * 0.03), `wanted ${H.toFixed(0)}, sister ${js.toFixed(0)}, brother ${jb.toFixed(0)}`);
    const jl = await jumpTop(sis, 40);
    check('holding the key does not change the height', near(jl, js, 3), `tap ${js.toFixed(0)}, held ${jl.toFixed(0)}`);
    // coyote time: a jump pressed just after walking off an edge still works; pressed much later it does not
    await both(balcony.x[0] + 60, balcony.x[1] - 30, 0, balcony.h);
    key('ArrowRight', true); await until(() => !bro.grounded, 3000); key('ArrowUp', true); await frames(4); key('ArrowUp', false); key('ArrowRight', false);
    check('coyote time: jump just after leaving an edge', bro.vy < 0 || up(bro) > balcony.h + 20, `vy ${bro.vy.toFixed(0)} height ${up(bro).toFixed(0)}`);
    await both(balcony.x[0] + 60, balcony.x[1] - 30, 0, balcony.h);
    key('ArrowRight', true); await until(() => !bro.grounded, 3000); key('ArrowRight', false); await wait(200); const before = up(bro); key('ArrowUp', true); await frames(2); key('ArrowUp', false);
    check('no jump long after leaving the edge', bro.vy > 0 && up(bro) < before && up(bro) > 5, `vy ${bro.vy.toFixed(0)} height ${up(bro).toFixed(0)}`);
    await until(() => bro.grounded, 3000); await wait(300);
    // jump buffer: a press just before landing jumps on landing; a press long before does not
    await both(400, 560); drop(bro, 560, 330);
    await until(() => bro.vy > 0 && up(bro) / bro.vy < 0.09, 3000); const pressedAt = up(bro); key('ArrowUp', true);
    let landed = false, rebound = 0; for (let i = 0; i < 70; i++) { await frame(); if (i === 2) key('ArrowUp', false); if (bro.grounded || up(bro) < 2) landed = true; else if (landed || bro.vy < 0) { landed = true; rebound = Math.max(rebound, up(bro)); } }
    check('(the press came before he landed)', pressedAt > 5, `pressed ${pressedAt.toFixed(0)} above the ground`);
    check('jump buffer: a press just before landing still jumps', rebound > H * 0.6, `rose ${rebound.toFixed(0)}`);
    await both(400, 560); drop(bro, 560, 600);
    await until(() => bro.vy > 0 && up(bro) < 570, 3000); key('ArrowUp', true); await frames(3); key('ArrowUp', false);
    await until(() => bro.grounded, 3000); await frames(8);
    check('no jump from a press long before landing', bro.grounded && up(bro) < 5, `height ${up(bro).toFixed(0)}`);
    // no fall damage, and a long fall just ends in a landing
    await both(400, 560, 700, 700); check('a long fall ends standing', sis.grounded && bro.grounded && !sis.gone && !bro.gone);

    // ---- steps, the thin plank, the low wall
    await both(540, 470);
    check('up the steps', (await go(sis, 930)) && near(up(sis), 186, 3), `height ${up(sis).toFixed(0)}`);
    await both(560, 930, 0, 186);
    let low = 999; const watch = setInterval(() => { low = Math.min(low, up(bro)); }, 10);
    const crossed = await go(bro, 1380); clearInterval(watch);
    check('the thin plank holds the brother', crossed && low > 180, `lowest ${low.toFixed(0)}`);
    check('star on the plank', stars[0].star.got);
    await both(930, 1380, 186, 186);
    key('KeyD', true); const fell = await until(() => up(sis) < 60, 4000); key('KeyD', false);
    check('the plank snaps under the sister', fell && plank.state.gone > 0, `x ${sis.x.toFixed(0)} height ${up(sis).toFixed(0)}`);
    check('she can jump back out', (await go(sis, 880)) && near(up(sis), 186, 3));
    check('the plank comes back', await until(() => plank.state.gone <= 0, (MOVE.plankBack + 1.5) * 1000));
    await both(1725, 1690);
    check('over the low wall', (await go(sis, wall.x[1] + 80)) && (await go(bro, wall.x[1] + 150)) && sis.x > wall.x[1] && bro.x > wall.x[1]);

    // ---- carrying
    drop(boxes[0], 2440); drop(boxes[1], 2560); drop(crate, 2700); await both(2300, 2370);
    await tap('ArrowDown'); await until(() => boxes[0].liftT >= 1, 2000); await frames(3);
    check('the brother picks up a light box', bro.carry === boxes[0] && boxes[0].held);
    check('it rides on his head', near(boxes[0].x, bro.x, 4) && boxes[0].y < bro.y - bro.h + 20, `box bottom ${up(boxes[0]).toFixed(0)}`);
    const jc = await jumpTop(bro); check('he can jump with it', near(jc, H, H * 0.04), `rose ${jc.toFixed(0)}`);
    await tap('ArrowDown'); await until(() => boxes[0].grounded, 2000);
    check('he puts it down in front of him', !bro.carry && !boxes[0].held && near(up(boxes[0]), 0, 2) && Math.abs(boxes[0].x - bro.x) > 50, `box at ${boxes[0].x.toFixed(0)}, he at ${bro.x.toFixed(0)}`);
    await both(2300, crate.x - 90); await tap('ArrowDown'); await frames(6);
    check('the heavy crate is too heavy for him', !bro.carry && !crate.held && bro.strain > 0);
    await both(crate.x - 95, 2300); await tap('KeyS'); await frames(12);
    check('the sister picks up the heavy crate', sis.carry === crate);
    const jh = await jumpTop(sis); check('she jumps lower with it', near(jh, H * MOVE.crateJump, H * 0.05), `rose ${jh.toFixed(0)}`);
    await tap('KeyS'); await until(() => crate.grounded, 2000); check('and puts it down', !sis.carry && near(up(crate), 0, 2));
    // stacking, and standing on boxes
    drop(boxes[0], 2440); drop(boxes[1], 2700); drop(crate, 2100); await both(2300, 2700 - 85); await tap('ArrowDown'); await frames(12);
    await go(bro, 2440 - 88); key('ArrowRight', true); await frames(2); key('ArrowRight', false); await frames(4); await tap('ArrowDown'); await until(() => boxes[1].grounded, 2000);
    check('a box put down against another lands on top of it', boxes[1].on === boxes[0] && near(up(boxes[1]), 86, 2) && near(boxes[1].x, boxes[0].x, 3), `box at ${boxes[1].x.toFixed(0)} height ${up(boxes[1]).toFixed(0)}`);
    await both(2300, 2440, 0, 300); check('he can stand on the pile', bro.on === boxes[1] && near(up(bro), 172, 2), `height ${up(bro).toFixed(0)}`);
    await both(2300, 2440 - 85); await tap('ArrowDown'); await frames(12); check('he takes the top box, not the bottom one', bro.carry === boxes[1]);
    // a box as a step up to the shelf
    drop(boxes[0], 2000); drop(boxes[1], 2100); drop(crate, 2200); await both(2300, shelf.x[0] - 120);
    key('ArrowRight', true); const reach0 = await jumpTop(bro); key('ArrowRight', false); await until(() => bro.grounded, 2000);
    check('the shelf is too high to jump onto', up(bro) < 5, `height ${up(bro).toFixed(0)}`);
    drop(boxes[0], shelf.x[0] - 50); await both(2300, shelf.x[0] - 50, 0, 200);
    key('ArrowRight', true); await jumpTop(bro); key('ArrowRight', false); await until(() => bro.grounded, 2000);
    check('with a box as a step he gets up', near(up(bro), shelf.h, 3), `height ${up(bro).toFixed(0)}`);
    await go(bro, 2900); check('star on the shelf', stars[1].star.got);

    // ---- reach: the bell
    drop(boxes[0], 2000); await both(2300, bell.def.x - 10); await tap('ArrowDown'); await frames(4);
    check('the brother cannot reach the bell from the ground', bell.state.rings === 0);
    await both(bell.def.x - 10, 2300); await tap('KeyS'); await frames(4);
    check('the sister can', bell.state.rings === 1);

    // ---- together: high five, lift, hop off, toss
    await both(3300, 3380); key('KeyS', true); key('ArrowDown', true); await frames(4); key('KeyS', false); key('ArrowDown', false); await wait(500);
    check('both press grab together: a high five, no lift', MV.highFives === 1 && !MV.duo.state);
    await wait(900); await both(bell.def.x - 150, bell.def.x - 80); await tap('KeyS');
    check('grab next to the partner: she lifts him', (await until(() => MV.duo.state === 'on', 2000)) && near(sis.y - bro.y, MOVE.liftHeight, 12), `he is ${(sis.y - bro.y).toFixed(0)} up`);
    await go(sis, bell.def.x); await frames(4); const rings = bell.state.rings; await tap('ArrowDown'); await frames(4);
    check('from her shoulders he can ring the bell', bell.state.rings === rings + 1 && MV.duo.state === 'on');
    key('KeyD', true); await wait(600); key('KeyD', false); check('she can walk with him up there', MV.duo.state === 'on' && near(bro.x, sis.x, 12));
    await tap('ArrowUp'); check('jump: he hops down', !MV.duo.state && (await until(() => bro.grounded, 2000)) && up(bro) < 5);
    await both(balcony.x[0] + 40, balcony.x[0] + 110);
    const jr = await jumpTop(bro); check('the balcony is far too high to jump to', jr < balcony.h - 100);
    await both(balcony.x[0] + 40, balcony.x[0] + 110); await tap('ArrowDown'); await until(() => MV.duo.state === 'on', 2000); await frames(6);
    key('KeyD', true); await frames(2); await tap('KeyS'); key('KeyD', false);
    check('grab again: she tosses him onto the balcony', (await until(() => bro.grounded, 3000)) && near(up(bro), balcony.h, 3), `height ${up(bro).toFixed(0)} x ${bro.x.toFixed(0)}`);
    await go(bro, 3375); check('star on the balcony', stars[2].star.got);

    // ---- the see-saw
    await both(seesaw.def.x - 320, seesaw.def.x + 240); const walkedOn = await go(bro, seesaw.def.x + 130); await frames(10);
    check('he walks onto the low end', walkedOn && bro.on === seesaw.ledge && up(bro) < 40, `height ${up(bro).toFixed(0)}`);
    key('KeyD', true); await until(() => sis.x > seesaw.def.x - 255, 3000); key('KeyW', true); await frames(3); key('KeyW', false);
    const flew = await until(() => up(bro) > high.h + 20, 3000); key('KeyD', false);
    check('her landing on the high end launches him', flew, `he reached ${up(bro).toFixed(0)}, she landed at ${sis.x.toFixed(0)}`);
    check('he lands on the high balcony', (await until(() => bro.grounded, 3000)) && near(up(bro), high.h, 3), `height ${up(bro).toFixed(0)}`);
    await go(bro, 3990); check('star on the high balcony', stars[3].star.got);
    await both(seesaw.def.x - 130, seesaw.def.x - 300, 160, 0); await frames(20); // she drops onto one end, which tips down under her
    drop(bro, seesaw.def.x + 100, 400); await until(() => bro.grounded, 3000); await frames(20); // then he drops onto the other, high end
    check('he is too light to launch her', sis.grounded && sis.on === seesaw.ledge && bro.on === seesaw.ledge && up(sis) < 60, `she is at ${up(sis).toFixed(0)}, he at ${up(bro).toFixed(0)}`);

    // ---- small: the low tunnel
    await both(tunnel.x[0] - 200, tunnel.x[0] - 120);
    let ducked = false; const w2 = setInterval(() => { ducked = ducked || bro.crawl; }, 10);
    const through = await go(bro, tunnel.x[1] + 70); clearInterval(w2);
    check('the brother ducks through the tunnel by himself', through && ducked && !bro.crawl && bro.x > tunnel.x[1]);
    check('star behind the tunnel', stars[4].star.got);
    key('KeyD', true); await wait(1500); key('KeyD', false);
    check('the sister does not fit', sis.x < tunnel.x[0], `she is at ${sis.x.toFixed(0)}`);
    drop(boxes[0], tunnel.x[0] - 120); await both(tunnel.x[0] - 290, tunnel.x[0] - 205); await tap('ArrowDown'); await frames(12);
    check('(he is carrying a box to the tunnel)', bro.carry === boxes[0]);
    await go(bro, tunnel.x[1] + 60);
    check('a carried box is knocked off at the tunnel', !bro.carry && boxes[0].x < tunnel.x[0] + 10 && bro.x > tunnel.x[1], `box at ${boxes[0].x.toFixed(0)}`);

    // ---- falling out of the picture
    await both(3300, 3400); sis.y = VH + 900; sis.grounded = false; sis.on = null; const t0 = performance.now();
    const back = await until(() => !sis.gone && sis.alpha === 1 && sis.y < FEET + 5 && performance.now() - t0 > 100, 3000), took = (performance.now() - t0) / 1000;
    check('a sibling who falls out is back beside the partner within a second', back && took < 1.05 && Math.abs(sis.x - bro.x) < 140, `${took.toFixed(2)} s, ${Math.abs(sis.x - bro.x).toFixed(0)} away`);
    drop(boxes[1], 3000); boxes[1].y = VH + 900; await wait(600); check('a box that falls out goes back to where it started', near(boxes[1].x, 2560, 2) && boxes[1].y <= FEET + 1);

    check('all five stars of the movement street', stars.slice(0, 5).every((o) => o.star.got));

    // ================= Phase 2: the object kit
    const of = (kind) => kit.filter((o) => o.def.kind === kind);
    const [gateA, gateB, door] = of('gate'), [green, blue] = of('plate'), crate2 = of('crate')[1].body, box3 = boxes[2];
    const boats = of('boat'), ferry = of('ferry')[0], [fLever, lLever, rLever] = of('lever'), lift = of('pulley')[0], ladder = of('ladder')[0], branch = of('branch')[0], [, , , liftLedge, ladderLedge] = ledges;
    const faceRight = async (p) => { key(p.keys.right, true); await frames(2); key(p.keys.right, false); await frames(3); };
    // ---- plates and gates
    drop(crate2, 4480); drop(box3, 4915); await both(4400, green.def.x); await wait(600);
    check('the brother is too light for the big green plate', !green.state.on && gateA.state.open === 0);
    await both(green.def.x, 4400);
    check('the sister presses it and the gate opens', (await until(() => gateA.state.open >= 1, 2500)) && green.state.on);
    await go(sis, 4420); check('the gate shuts again when she steps off', await until(() => gateA.state.open === 0, 3000));
    await both(4480 - 96, 4560); await tap('KeyS'); await until(() => crate2.liftT >= 1, 2000); await go(sis, green.def.x - 92); await faceRight(sis); await tap('KeyS'); await until(() => crate2.grounded, 2000); await go(sis, 4420);
    check('the heavy crate holds the green plate down', crate2.on === green.ledge && (await until(() => gateA.state.open >= 1, 2500)), `crate at ${crate2.x.toFixed(0)}`);
    check('both walk through the gate', (await go(sis, 4905)) && (await go(bro, 4960)) && sis.x > gateA.def.x && bro.x > gateA.def.x);
    await both(4400, gateA.def.x); drop(crate2, 4330 + 60, 181); await until(() => gateA.state.open === 0, 3000); await frames(5);
    check('a closing gate nudges him aside, it never traps him', world.fits(bro) && Math.abs(bro.x - gateA.def.x) > 40 && !bro.gone, `he is at ${bro.x.toFixed(0)}`);
    drop(crate2, green.def.x, 20); await both(4900, blue.def.x);
    check('the small blue plate works for the brother', (await until(() => gateB.state.open >= 1, 2500)) && blue.state.on);
    await go(bro, 4890); check('and lets go when he steps off', await until(() => gateB.state.open === 0, 3000));
    await both(4900, box3.x - 84); await tap('ArrowDown'); await until(() => box3.liftT >= 1, 2000); await go(bro, blue.def.x - 82); await faceRight(bro); await tap('ArrowDown'); await until(() => box3.grounded, 2000);
    check('a light box holds the blue plate down', box3.on === blue.ledge && (await until(() => gateB.state.open >= 1, 2500)), `box at ${box3.x.toFixed(0)}`);
    check('both walk through the second gate', (await go(sis, 5190)) && (await go(bro, 5215)) && sis.x > gateB.def.x && bro.x > gateB.def.x);
    // ---- the canal: small boats for him, the ferry for her
    let wet = false; const w3 = setInterval(() => { wet = wet || !!bro.gone; }, 10);
    const over = await go(bro, 6200, 14000); clearInterval(w3);
    check('the small boats carry the brother across', over && !wet && bro.x > 6140, `he is at ${bro.x.toFixed(0)}`);
    key('KeyD', true); const sank = await until(() => sis.gone, 5000); key('KeyD', false);
    check('a boat sinks under the sister', sank && boats[0].state.sink > 0);
    check('she comes back on her own bank, not his', (await until(() => !sis.gone && sis.grounded, 3000)) && sis.x < 5240, `she is at ${sis.x.toFixed(0)}`);
    check('the boat comes back up', await until(() => boats[0].state.sink === 0, 6000));
    await go(bro, fLever.def.x - 12); await tap('ArrowDown');
    check('his lever brings the ferry over', await until(() => ferry.state.x <= ferry.def.x[0] + 1, 6000));
    await go(sis, ferry.def.x[0]); check('she steps onto the ferry', sis.on === ferry.ledge, `she is at ${sis.x.toFixed(0)}`);
    await tap('ArrowDown'); check('and it carries her across', (await until(() => ferry.state.x >= ferry.def.x[1] - 1, 6000)) && sis.on === ferry.ledge && !sis.gone);
    check('star on the far bank', (await go(sis, 6290)) && stars[5].star.got);
    // ---- the pulley lift
    await both(lift.def.rope.x - 20, lift.def.a); await frames(6);
    check('he stands on the lift', bro.on === lift.a);
    key('KeyS', true);
    check('she hauls on the rope and he rides up', (await until(() => lift.state.u >= 1, 6000)) && near(up(bro), lift.def.high, 3), `height ${up(bro).toFixed(0)}`);
    check('star on the high ledge', (await go(bro, 6600)) && stars[6].star.got); key('KeyS', false);
    check('let go, and the lift comes back down', await until(() => lift.state.u === 0, 6000));
    await both(lift.def.a, lift.def.rope.x - 20); await frames(6); key('ArrowDown', true); await wait(1200); key('ArrowDown', false);
    check('he is too light to haul her up', lift.state.u === 0 && sis.on === lift.a);
    for (const [i, x] of [[3, 6960], [4, 7020], [5, 6990]]) drop(boxes[i], x, i === 5 ? 470 : 381);
    reset(); drop(bro, 6860, 381); await until(() => bro.grounded, 3000); await wait(900); // she stays where she is, on the lift
    check('three boxes on the other platform are not quite enough', lift.state.u === 0 && near(world.loadOn(lift.b), 3, 0.01), `load ${world.loadOn(lift.b)}`);
    await go(bro, lift.def.b);
    check('with him on top as well, she rides up', (await until(() => lift.state.u >= 1, 6000)) && near(up(sis), lift.def.high, 3), `she is at ${up(sis).toFixed(0)}`);
    // ---- the rope ladder and the branch
    await both(ladderLedge.x[0] + 60, ladderLedge.x[0] + 130); await tap('ArrowDown'); await until(() => MV.duo.state === 'on', 2000); await frames(6);
    key('KeyD', true); await frames(2); await tap('KeyS'); key('KeyD', false);
    check('tossed up to the ladder balcony', (await until(() => bro.grounded, 3000)) && near(up(bro), ladderLedge.h, 3), `height ${up(bro).toFixed(0)}`);
    await go(bro, ladder.def.x + 40); await tap('ArrowDown');
    check('he lets the rope ladder down', await until(() => ladder.state.out >= 1, 2500));
    await go(sis, ladder.def.x); key('KeyW', true);
    check('she climbs it', (await until(() => sis.grounded && near(up(sis), ladderLedge.h, 3), 6000)), `height ${up(sis).toFixed(0)}`); key('KeyW', false);
    check('the branch holds the brother', (await go(bro, 7600)) && near(up(bro), branch.def.h, 3) && stars[7].star.got, `height ${up(bro).toFixed(0)}`);
    await go(bro, 7300); key('KeyD', true); const snapped = await until(() => up(sis) < 120, 5000); key('KeyD', false);
    check('and snaps under the sister', snapped && branch.state.gone > 0);
    // ---- the two-switch door
    await both(lLever.def.x, rLever.def.x - 10); key('KeyS', true); await wait(900);
    check('one lever is not enough', sis.holding === lLever.thing && door.state.open === 0);
    key('ArrowDown', true);
    check('both held together: the door opens', await until(() => door.state.latched, 3000));
    key('KeyS', false); key('ArrowDown', false); await wait(1200);
    check('and stays open when they let go', door.state.open >= 1);
    check('star behind the door', (await go(bro, 7945)) && (await go(sis, 7930)) && stars[8].star.got);
    await both(rLever.def.x + 60, lLever.def.x); await tap('ArrowDown'); await frames(4);
    check('the high lever is out of his reach', !bro.holding);
    check('every star', stars.every((o) => o.star.got), `${stars.filter((o) => o.star.got).length} of ${stars.length}`);
    log(`frame rate: ${game.fps.toFixed(0)} a second, slowest frame ${game.slow.toFixed(0)} ms, canvas ${cv.width}x${cv.height}`);
    log(fails ? `PLAY FAILED ${fails} check${fails > 1 ? 's' : ''}` : 'PLAY PASSED');
  } catch (e) { log('PLAY FAILED ' + (e.stack || e.message)); }
})();
