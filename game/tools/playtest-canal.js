// Plays Level 3 (the canal) from the first section to the end card with simulated key presses, both siblings, and
// reports each step and the time each section took to the dev server.
// Run python tools/dev_server.py 8780 log.txt, open http://127.0.0.1:8780/tools/playtest-canal.html and read log.txt:
// the last line says PLAY PASSED or PLAY FAILED. (?section=3 starts it at section 3; ?fps=30 runs it like a slow device.)
// It presses the same keys a player would and never moves anybody by magic, so if it gets through, the level can be
// finished. tools/playtest-canal.html?solo=1 runs the other test instead (further down): that one sibling alone cannot
// finish any puzzle, that the sister can never cross a light-only surface, and that the brother cannot reach the
// bonus lever without her see-saw launch.
(async () => {
  let sent = Promise.resolve(); // one line at a time: two reports arriving together can overwrite each other in the log file
  const log = (t) => (sent = sent.then(() => fetch('/log', { method: 'POST', body: t }).catch(() => {})));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const tick = () => new Promise((r) => requestAnimationFrame(r));
  while (typeof players === 'undefined' || typeof kit === 'undefined') await wait(50);
  await wait(400);
  try { localStorage.removeItem('treasure-hunt-chapter-1'); } catch (e) { /* no storage: fine */ }
  const frame = async () => { const t = game.time; do { await tick(); } while (game.time === t); }; // one frame of the game
  const frames = async (n) => { for (let i = 0; i < n; i++) await frame(); };
  const secs = async (s) => { const t = game.time + s; while (game.time < t) await frame(); };       // seconds of the game, not of the clock
  const key = (code, on) => dispatchEvent(new KeyboardEvent(on ? 'keydown' : 'keyup', { code }));
  const tap = async (code) => { key(code, true); await frames(3); key(code, false); await frames(2); };
  const until = async (cond, max = 5000) => { const t0 = performance.now(); while (!cond() && performance.now() - t0 < max) await frame(); return !!cond(); };
  const up = (p) => FEET - p.y; // how high the feet are above the quay
  const near = (v, want, tol) => Math.abs(v - want) <= tol;
  const JUMP = { sister: 'KeyW', brother: 'ArrowUp' }, GRAB = { sister: 'KeyS', brother: 'ArrowDown' };
  const KEYS = ['KeyA', 'KeyD', 'KeyW', 'KeyS', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
  // walk to a place, jumping whenever something is in the way
  const go = async (p, x, max = 9000) => {
    const k = p.keys, t0 = performance.now(); let held = 0;
    while (Math.abs(p.x - x) >= 16 && performance.now() - t0 < max) {
      const d = x > p.x ? 1 : -1; key(d > 0 ? k.left : k.right, false); key(d > 0 ? k.right : k.left, true);
      if (held > 0) { if (--held === 0) key(k.up, false); } else if (p.grounded && p.hitSide === d) { key(k.up, true); held = 3; }
      await frame();
    }
    key(k.left, false); key(k.right, false); key(k.up, false); await until(() => !p.gone && p.grounded && Math.abs(p.vx) < 5, 2500); await frames(3); // standing still, not sliding to a stop
    return Math.abs(p.x - x) < 60;
  };
  const face = async (p, d) => { const c = d > 0 ? p.keys.right : p.keys.left; key(c, true); await frames(2); key(c, false); await frames(3); };
  const hop = async (p) => { await tap(JUMP[p.who]); await until(() => p.grounded, 2500); await frames(2); };           // jump on the spot
  const leap = async (p, from, d = 1) => { // run, and jump as they pass a spot
    const c = d > 0 ? p.keys.right : p.keys.left; key(c, true); await until(() => (p.x - from) * d >= 0, 5000); key(p.keys.up, true); await frames(3); key(p.keys.up, false);
    await until(() => !p.grounded, 500); await until(() => p.grounded || p.gone, 2500); key(c, false); await until(() => !p.gone && p.grounded, 3000); await frames(3);
  };
  const run = async (p, d, cond, max = 4000) => { const c = d > 0 ? p.keys.right : p.keys.left; key(c, true); const ok = await until(cond, max); key(c, false); await until(() => !p.gone && p.grounded, 3000); await frames(3); return ok; };
  const carry = async (p, box, toX, d, from = d) => { // fetch a box (standing on its 'from' side) and put it down so that it lands at toX
    await go(p, box.x - from * 84); await face(p, from); await tap(GRAB[p.who]); if (!(await until(() => p.carry === box && box.liftT >= 1, 2500))) return false;
    await go(p, toX - d * ((p.w + box.w) / 2 + 10)); await face(p, d); await tap(GRAB[p.who]); return (await until(() => !box.held && box.grounded, 2500)) && Math.abs(box.x - toX) < 40;
  };
  const climb = async (p, x, h) => { await go(p, x); key(JUMP[p.who], true); const ok = await until(() => p.grounded && near(up(p), h, 4), 6000); key(JUMP[p.who], false); await frames(3); return ok; };
  const highest = async (p, fn) => { let top = 0, on = true; (async () => { while (on) { top = Math.max(top, p.gone ? 0 : up(p)); await tick(); } })(); await fn(); on = false; return top; };
  const inSection = (n, kind, i = 0) => kit.filter((o) => o.section === n && o.def.kind === kind)[i];
  const at = (n) => SECTIONS[n].start;

  let fails = 0;
  const check = (name, ok, info = '') => { if (!ok) fails++; log(`${ok ? 'ok  ' : 'FAIL'} ${name}${info ? '   [' + info + ']' : ''}`); return ok; };
  const pA = inSection(0, 'plate', 0), pB = inSection(0, 'plate', 1), gate1 = inSection(0, 'lockgate');
  const plank2 = inSection(1, 'thinplank'), fb2 = inSection(1, 'footbridge'), pT = inSection(1, 'plate');
  const saw3 = inSection(2, 'launcher'), boatA = inSection(2, 'lightboat', 0), boatB = inSection(2, 'lightboat', 1), raft = inSection(2, 'raft'), lev3 = inSection(2, 'lever');
  const box5 = inSection(4, 'box').body, plank5 = inSection(4, 'thinplank'), p5 = inSection(4, 'plate'), lad5 = inSection(4, 'dropladder'), shelf5 = inSection(4, 'ledge').def, lock = inSection(4, 'lever'), fb5 = inSection(4, 'footbridge'), gate5 = inSection(4, 'lockgate'), bar5 = inSection(4, 'bar').def;
  const box6 = inSection(5, 'box').body, blk = inSection(5, 'block').def, saw6 = inSection(5, 'launcher'), shelf6 = inSection(5, 'ledge').def, lev6 = inSection(5, 'lever'), gate6 = inSection(5, 'lockgate');
  const boats7 = kit.filter((o) => o.section === 6 && o.def.kind === 'lightboat'), bridge7 = inSection(6, 'bridge'), nearL = inSection(6, 'lever', 0), farL = inSection(6, 'lever', 1);
  const step6 = blk.x[0] - 43;

  // ---------- the solo test (?solo=1): one sibling works alone while the other stands still, and every short cut I
  // could think of is tried. Each check passes when the short cut does NOT work. (It puts the siblings and the boxes
  // where a try starts; the tries themselves use the keys.)
  if (QS.get('solo')) {
    const put = (b, x, h = 0) => Object.assign(b, { x, y: FEET - h - 1, vx: 0, vy: 0, grounded: false, on: null, held: false, carrier: null, lost: false });
    const set = async (xs, xb, hs = 0, hb = 0) => { for (const c of KEYS) key(c, false); await until(() => !sis.gone && !bro.gone, 3000); if (MV.duo.state) endRide(); MV.pending = null; for (const p of players) { if (p.carry) putDown(p); Object.assign(p, { crawl: false, h: p.standH, holding: null, climb: null, gravity: 1, flying: false }); } put(sis, xs, hs); put(bro, xb, hb); sis.safe = { x: overWater(xs) ? xb : xs, y: FEET }; bro.safe = { x: overWater(xb) ? xs : xb, y: FEET }; camX = cameraTarget(); await until(() => sis.grounded && bro.grounded, 3000); await frames(4); };
    // (set also moves each one's last safe spot: after a splash they come back to it, and it must not be left over from an earlier try)
    const place = (p, x, rest, h = 0) => (p === sis ? set(x, rest, h, 0) : set(rest, x, 0, h)); // p at x, the other waiting at 'rest'
    const dash = async (p, toX, jump) => { // run right, with a jump on the way if asked, and see where they get to
      key(p.keys.right, true); if (jump) { await frames(2); key(p.keys.up, true); await frames(3); key(p.keys.up, false); }
      await until(() => p.x > toX || (p.grounded && p.hitSide === 1), 4000); await secs(0.5); key(p.keys.right, false); await until(() => !p.gone && p.grounded, 3000); await frames(3); return p.x;
    };
    const liftUp = async () => { await secs(0.8); await tap('ArrowDown'); return until(() => MV.duo.state === 'on', 2500); };
    const bunny = async (p, cond, max = 6000) => { // run right and jump again the moment the feet touch anything
      const t0 = performance.now(); key(p.keys.right, true);
      while (!cond() && performance.now() - t0 < max) { key(p.keys.up, true); await frame(); await frame(); key(p.keys.up, false); await frame(); }
      key(p.keys.right, false); key(p.keys.up, false); await until(() => !p.gone && p.grounded, 3000); await frames(3);
    };
    try {
      for (const p of players) { // ---- section 1: plate and gate
        const rest = SECTIONS[0].start[0], g = gate1.def.x, name = p.who;
        await place(p, pA.def.x, rest); await until(() => gate1.state.open >= 1, 2500);
        check(`1: ${name} cannot step off the plate and dash through`, (await dash(p, g + 100)) < g, `got to ${p.x.toFixed(0)}, gate at ${g}`);
        await place(p, pA.def.x, rest); await until(() => gate1.state.open >= 1, 2500);
        check(`1: nor with a jump`, (await dash(p, g + 100, true)) < g, `got to ${p.x.toFixed(0)}`);
      }
      { // ---- section 2: the thin plank. She can never cross it.
        const a = STREAM_A[0], b = STREAM_A[1], rest = at(1)[0];
        await place(sis, a - 300, rest); const s0 = game.splashes, r0 = plank2.state.refused;
        await run(sis, 1, () => sis.x > b, 3000);
        check('2: she walks onto the plank: it creaks and sends her back, and she does not fall', sis.x < a + 40 && plank2.state.refused > r0 && game.splashes === s0, `she is at ${sis.x.toFixed(0)}, the stream starts at ${a}; sent back ${plank2.state.refused - r0} times`);
        await place(sis, a - 260, rest); await leap(sis, a - 40); await secs(1);
        check('2: she jumps onto the plank: it springs her back to the bank', sis.x < a + 40 && plank2.state.sprung > 0, `she is at ${sis.x.toFixed(0)}`);
        await place(sis, a - 400, rest); await leap(sis, a - 150); await secs(1);
        check('2: a jump from further back does not carry her over either', sis.x < b - 100, `she is at ${sis.x.toFixed(0)}`);
        await place(sis, a - 300, rest); await bunny(sis, () => sis.x > b, 5000); await secs(1);
        check('2: nor by jumping again and again the moment her feet touch it', sis.x < a + 40, `she is at ${sis.x.toFixed(0)}`);
        await set(a - 200, a - 150); const up2 = await liftUp(); await run(sis, 1, () => sis.x > b, 2500);
        check('2: nor with him on her shoulders', up2 && sis.x < a + 40 && bro.x < a + 60, `she is at ${sis.x.toFixed(0)}`);
        await set(rest, rest + 90);
        check('2: the sturdy bridge has not come out by itself', !fb2.state.on && fb2.ledge.off);
        check('2: through all of that she never fell in: the plank covers the stream', game.splashes === s0);
      }
      { // ---- section 3: the see-saw and the boats
        const edge = BASIN[0], rest = at(2)[0], far = BASIN[1];
        await place(bro, boatA.def.x, rest, 10); await until(() => bro.on === boatA.ledge, 1500);
        check('3: the first boat holds him', bro.on === boatA.ledge);
        await leap(bro, boatA.def.x + 40);
        check('3: he cannot jump from the first boat to the middle one', bro.x < boatB.def.x - 100 && !lev3.state.on, `he is at ${bro.x.toFixed(0)}, the middle boat is at ${boatB.def.x}`);
        await place(bro, edge - 500, rest); await leap(bro, edge - 60);
        check('3: nor with a run from the quay', bro.x < boatB.def.x - 100, `he is at ${bro.x.toFixed(0)}`);
        await place(sis, edge - 200, rest); const s0 = game.splashes; await run(sis, 1, () => sis.gone || sis.x > far, 4000);
        check('3: the first boat sinks under her: a splash, and she is back on the quay', game.splashes > s0 && sis.x < edge, `she is at ${sis.x.toFixed(0)}`);
        check('3: and a duck quacks', await until(() => REACT.quacks > 0, 1500));
        await place(sis, edge - 300, rest); await bunny(sis, () => sis.x > far, 6000);
        check('3: she cannot hop from boat to boat either', sis.x < edge, `she is at ${sis.x.toFixed(0)}`);
        await place(sis, saw3.def.x - 400, rest); await leap(sis, saw3.def.x - 255); await secs(0.6);
        check('3: she jumps onto the see-saw alone: nobody flies', saw3.state.launches === 0 && sis.x < edge);
        await place(bro, saw3.def.x - 400, rest); await leap(bro, saw3.def.x - 255); await go(bro, saw3.def.x + 125, 3000); await hop(bro);
        check('3: he jumps on the see-saw alone: nothing happens', saw3.state.launches === 0 && bro.x < edge);
        await set(edge - 120, edge - 70); const up3 = await liftUp(); await run(sis, 1, () => sis.hitSide === 1 || sis.x > edge - 35, 1500); await face(bro, 1); await tap('ArrowUp'); await until(() => !bro.gone && bro.grounded, 4000); await frames(4);
        check('3: lifted to the edge of the quay and hopping off, he still does not reach the middle boat', up3 && bro.x < boatB.def.x - 100, `he is at ${bro.x.toFixed(0)}`);
        check('3: the raft has not moved without the lever', near(raft.state.x, raft.def.x[1], 2) && !lev3.state.on);
      }
      { // ---- section 5: the box over the plank
        const a = STREAM_B[0], b = STREAM_B[1], rest = at(4)[0], home = inSection(4, 'box').def.x;
        await set(home - 84, rest); await face(sis, 1); await tap('KeyS'); await until(() => sis.carry === box5 && box5.liftT >= 1, 2500); await run(sis, 1, () => sis.x > b, 4000);
        check('5: she cannot carry the box over the plank', sis.x < a + 40 && box5.x < a + 60 && !p5.state.on, `she is at ${sis.x.toFixed(0)}, the box at ${box5.x.toFixed(0)}`);
        if (sis.carry) { await tap('KeyS'); await frames(20); } put(box5, home);
        await place(sis, lad5.def.x, rest); const h1 = await highest(sis, async () => { key('KeyW', true); await wait(900); key('KeyW', false); await until(() => sis.grounded, 2000); });
        check('5: without the ladder she cannot get up to the lever', h1 < shelf5.h - 60 && lad5.state.out === 0, `highest ${h1.toFixed(0)}, the ledge is at ${shelf5.h}`);
        put(box5, lad5.def.x + 60); await place(sis, lad5.def.x + 60, rest, 90); await until(() => sis.on === box5, 1500); const h2 = await highest(sis, async () => { await hop(sis); });
        check('5: nor from the box', h2 < shelf5.h - 10 && !lock.state.on, `highest ${h2.toFixed(0)}`);
        put(box5, home); await set(rest, home - 84); await face(bro, 1);
        check('5: he carries the box over the plank and puts it on the plate (this much he can do alone)', (await carry(bro, box5, p5.def.x, 1)) && (await until(() => lad5.state.out >= 1, 2500)));
        check('5: he climbs the ladder himself', await climb(bro, lad5.def.x, shelf5.h), `he is at ${up(bro).toFixed(0)}`);
        await go(bro, lock.def.x - 15, 3000); await tap('ArrowDown'); await frames(8); await hop(bro); key('ArrowUp', true); await frames(3); key('ArrowUp', false); await until(() => bro.vy > -60, 800); await tap('ArrowDown'); await until(() => bro.grounded, 2000);
        check('5: but the high lever is out of his reach, even jumping', !lock.state.on && !fb5.state.on && gate5.state.open === 0, `he reaches ${(FEET - sibReachY(bro)).toFixed(0)}, the lever is at ${lock.def.h}`);
        await go(bro, shelf5.x[0] - 60, 3000); await run(bro, 1, () => bro.x > gate5.def.x, 5000);
        check('5: and the lock gate stays shut for him', bro.x < gate5.def.x && gate5.state.open === 0, `he is at ${bro.x.toFixed(0)}`);
        put(box5, home);
      }
      { // ---- section 6: the see-saw on the ledge
        const rest = at(5)[0], home = inSection(5, 'box').def.x, wall = blk.x[0];
        for (const p of players) {
          await place(p, wall - 200, rest); const h = await highest(p, async () => { await dash(p, wall + 100, true); });
          check(`6: ${p.who} cannot jump onto the ledge without the box`, h < blk.h && p.x < wall, `highest ${h.toFixed(0)}, the ledge is at ${blk.h}`);
        }
        await set(wall - 110, wall - 60); const up6 = await liftUp(); await run(sis, 1, () => sis.hitSide === 1, 1500); await face(bro, 1); await tap('ArrowUp'); await until(() => bro.grounded, 3000); await frames(4);
        check('6: nor does a lift get him up there', up6 && up(bro) < blk.h - 20, `he is ${up(bro).toFixed(0)} up`);
        await set(wall - 110, wall - 60); await liftUp(); await tap('ArrowDown'); await until(() => !MV.duo.state && bro.grounded, 3000);
        check('6: there is no toss in this level: grab just sets him down', up(bro) < 20 && Math.abs(bro.x - sis.x) < 300);
        put(box6, step6); await place(bro, step6, rest, 90); await until(() => bro.on === box6, 1500); await leap(bro, bro.x - 5);
        check('6: with the box as a step he gets up alone (this much he can do)', up(bro) > blk.h - 12 && bro.x > wall, `he is ${up(bro).toFixed(0)} up`);
        const h3 = await highest(bro, async () => { await go(bro, saw6.def.x - 250, 3000); await leap(bro, saw6.def.x - 250); await hop(bro); await go(bro, saw6.def.x + 125, 3000); await hop(bro); await go(bro, shelf6.x[0] - 40, 3000); await hop(bro); });
        check('6: but he cannot reach the high shelf or its lever without her launch', h3 < shelf6.h - 10 && saw6.state.launches === 0 && !lev6.state.on, `highest ${h3.toFixed(0)}, the shelf is at ${shelf6.h}`);
        await go(bro, saw6.def.x - 250, 3000); const h4 = await highest(bro, async () => { key('ArrowRight', true); await until(() => bro.x > saw6.def.x - 255, 2000); await tap('ArrowUp'); await until(() => bro.grounded, 1500); key('ArrowUp', true); await frames(2); key('ArrowUp', false); await until(() => !bro.grounded, 300); await until(() => bro.grounded, 2500); key('ArrowRight', false); await frames(4); });
        check('6: nor with a second jump off the high end of the see-saw', h4 < shelf6.h - 10 && !lev6.state.on, `highest ${h4.toFixed(0)}`);
        await place(sis, step6, rest, 90); await until(() => sis.on === box6, 1500); await leap(sis, sis.x - 5);
        const h5 = await highest(sis, async () => { await go(sis, saw6.def.x - 250, 3000); await leap(sis, saw6.def.x - 255); await hop(sis); await go(sis, shelf6.x[0] - 40, 3000); await hop(sis); });
        check('6: she cannot get up to the shelf alone either', h5 < shelf6.h - 10 && saw6.state.launches === 0 && !lev6.state.on, `highest ${h5.toFixed(0)}`);
        await set(blk.x[0] + 150, blk.x[0] + 200, blk.h, blk.h); const up7 = await liftUp(); await run(sis, 1, () => sis.x > shelf6.x[0] + 30 || sis.hitSide === 1, 3000); const h6 = await highest(bro, async () => { await tap('ArrowUp'); await until(() => bro.grounded, 3000); });
        check('6: and a lift on the ledge does not reach it', up7 && h6 < shelf6.h - 10 && !lev6.state.on, `highest ${h6.toFixed(0)}`);
        check('6: the way to the bridge is still shut', gate6.state.open === 0);
        put(box6, home);
      }
      { // ---- section 7: the Old Bridge
        const a = RIVER[0], b = RIVER[1], rest = at(6)[0];
        await place(sis, a - 200, rest); const s0 = game.splashes; await run(sis, 1, () => sis.gone || sis.x > b, 5000);
        check('7: the boats sink under her: she cannot cross the river', game.splashes > s0 && sis.x < a, `she is at ${sis.x.toFixed(0)}`);
        await place(sis, a - 300, rest); await bunny(sis, () => sis.x > b, 8000);
        check('7: nor by hopping from boat to boat as fast as she can', sis.x < a, `she is at ${sis.x.toFixed(0)}`);
        await place(sis, nearL.def.x - 15, rest + 90); key('KeyS', true); await wait(3200); const held = sis.holding === nearL.thing; key('KeyS', false);
        check('7: her lever alone does not move the bridge', held && bridge7.state.prog === 0);
        await place(bro, nearL.def.x - 15, rest); key('ArrowDown', true); await wait(500); key('ArrowDown', false); await hop(bro);
        check('7: he cannot reach her lever', !bro.holding && bridge7.state.prog === 0);
        check('7: he walks over the boats to the far bank (this much he can do alone)', (await go(bro, farL.def.x - 15, 9000)) && bro.x > b);
        key('ArrowDown', true); await wait(3200); const held2 = bro.holding === farL.thing; key('ArrowDown', false);
        check('7: his lever alone does not move the bridge', held2 && bridge7.state.prog === 0 && !bridge7.state.down);
      }
      check('nothing was solved by one alone: the gates, the bridges and the levers are as they were', gate1.state.open === 0 && !fb2.state.on && !lev3.state.on && !lock.state.on && !fb5.state.on && gate5.state.open === 0 && !lev6.state.on && gate6.state.open === 0 && !bridge7.state.down, // (not game.solved: the tries put both siblings past earlier gates)
        `gate1 ${gate1.state.open} bridge2 ${fb2.state.on} lever3 ${lev3.state.on} lock ${lock.state.on} bridge5 ${fb5.state.on} gate5 ${gate5.state.open} lever6 ${lev6.state.on} gate6 ${gate6.state.open} bridge ${bridge7.state.down}`);
      log(fails ? `PLAY FAILED ${fails} short cut${fails > 1 ? 's' : ''} worked` : 'PLAY PASSED');
    } catch (e) { log('PLAY FAILED ' + (e.stack || e.message)); }
    return;
  }

  // ---------- the play-through. While it plays, it also watches that neither sibling stands still for a whole puzzle.
  const moved = {}; let lastX = { sister: sis.x, brother: bro.x };
  const watch = setInterval(() => { for (const p of players) { const m = (moved[game.section] = moved[game.section] || { sister: 0, brother: 0 }); m[p.who] += Math.abs(p.x - lastX[p.who]); lastX[p.who] = p.x; } }, 30);
  try {
    if (FROM <= 0) { // ================= section 1: warm-up, plate and gate
      const g = gate1.def.x;
      check('the first screen holds only the quay and the first puzzle', kit.filter((o) => o.section === 0).every((o) => o.def.kind === 'plate' || o.def.kind === 'lockgate') && !PROPS.some(([, x]) => x < SECTIONS[0].x[1]));
      check('the gate is shut', gate1.state.open === 0 && !(await go(bro, g + 100, 2500)) && bro.x < g);
      await go(sis, pA.def.x); check('she stands on the plate and the gate opens', (await until(() => gate1.state.open >= 1, 3000)) && sis.on === pA.ledge);
      check('he walks through and stands on the far plate', (await go(bro, pB.def.x)) && bro.x > g && bro.on === pB.ledge);
      check('she walks through: solved, and they cheer', (await go(sis, g + 200)) && (await until(() => game.solved[0], 2000)) && sis.cheer > 0 && bro.cheer > 0);
      check('the gate wobbled as it opened', REACT.wobbles > 0);
      check('into section 2', (await go(sis, at(1)[0] + 20)) && (await go(bro, at(1)[1] + 10)) && game.section === 1, `section ${game.section + 1}`);
    }
    if (FROM <= 1) { // ================= section 2: teach, the thin plank
      const a = STREAM_A[0], b = STREAM_A[1], s0 = game.splashes;
      await run(sis, 1, () => sis.x > b, 2200);
      check('she tries the plank: it creaks and bends, and she steps back (no fall)', sis.x < a + 40 && plank2.state.refused > 0 && game.splashes === s0, `she is at ${sis.x.toFixed(0)}`);
      let sag = 0; const w = setInterval(() => { sag = Math.max(sag, plank2.state.sag); }, 20);
      check('he walks across: it holds him and bends a little', (await go(bro, b + 60)) && game.splashes === s0); clearInterval(w);
      check('the plank bent under him, but only a little', sag > 2 && sag < 9, `it sagged ${sag.toFixed(1)}`); game.sagLight = sag;
      await go(bro, pT.def.x); check('he steps on the plate: the sturdy bridge slides out', (await until(() => fb2.state.out >= 1 && !fb2.ledge.off, 3000)));
      await go(bro, pT.def.x + 150); check('and it stays out when he steps off', fb2.state.out >= 1 && !KIT_SIG.t1);
      check('she walks over the bridge: solved', (await go(sis, b + 150)) && game.splashes === s0 && (await until(() => game.solved[1], 2000)));
      check('into section 3', (await go(sis, at(2)[0] + 20)) && (await go(bro, at(2)[1] + 10)) && game.section === 2, `section ${game.section + 1}`);
    }
    if (FROM <= 2) { // ================= section 3: practise, the see-saw and the boats
      const far = BASIN[1];
      await go(bro, saw3.def.x + 110); await hop(bro); check('he hops onto the blue end of the see-saw', bro.on === saw3.ledge && bro.x > saw3.def.x);
      await go(sis, saw3.def.x - 420); await leap(sis, saw3.def.x - 255);
      check('she jumps onto the green end: he flies', saw3.state.launches === 1);
      check('and lands on the middle boat, without steering', (await until(() => bro.grounded && !bro.gone, 4000)) && bro.on === boatB.ledge, `he is at ${bro.x.toFixed(0)}, the boat at ${boatB.def.x}`);
      await frames(4); check('the boat dipped under him', REACT.dips > 0 && boatB.state.dip !== 0);
      check('over the raft to the far quay, to the lever', (await go(bro, lev3.def.x - 40)) && bro.x > far);
      await face(bro, 1); await tap('ArrowDown'); check('he pulls it: the raft goes over to her side', lev3.state.on && (await until(() => near(raft.state.x, raft.def.x[0], 2), 8000)));
      await go(sis, raft.def.x[0]); check('she steps onto the raft', sis.on === raft.ledge);
      check('and it brings her over by itself', (await until(() => near(raft.state.x, raft.def.x[1], 2), 8000)) && sis.on === raft.ledge && !sis.gone);
      check('she steps off: solved', (await go(sis, far + 150)) && (await until(() => game.solved[2], 2000)));
      check('into section 4', (await go(sis, at(3)[0] + 20)) && (await go(bro, at(3)[1] + 10)) && game.section === 3, `section ${game.section + 1}`);
    }
    if (FROM <= 3) { // ================= section 4: a calm moment. Nothing has to be done, and nothing can be used.
      await go(sis, 6000); await tap('KeyS'); await go(bro, 6100);
      check('nothing here can be used or picked up, and no hint appears', !kit.some((o) => o.section === 3 && (o.thing || o.body)) && !hint.step && !SECTIONS[3].goal);
      await until(() => sis.cheer <= 0, 2500);
      check('into section 5', (await go(sis, at(4)[0] + 20)) && (await go(bro, at(4)[1] + 10)) && game.section === 4, `section ${game.section + 1}`);
    }
    if (FROM <= 4) { // ================= section 5: twist, the box over the plank
      const g = gate5.def.x;
      check('the ladder is rolled up and the lock gate is shut', lad5.state.out === 0 && gate5.state.open === 0 && fb5.ledge.off);
      let sag = 0; const w = setInterval(() => { sag = Math.max(sag, plank5.state.sag); }, 20);
      check('he carries the box over the thin plank and puts it on the plate', await carry(bro, box5, p5.def.x, 1), `box at ${box5.x.toFixed(0)}, plate at ${p5.def.x}`); clearInterval(w);
      if (game.sagLight) check('with the box the plank bent a little more', sag > game.sagLight + 2 && sag < 16, `it sagged ${sag.toFixed(1)}, without the box ${game.sagLight.toFixed(1)}`);
      check('the ladder comes down on her side', await until(() => lad5.state.out >= 1, 2500));
      check('she climbs it', await climb(sis, lad5.def.x, shelf5.h), `she is at ${up(sis).toFixed(0)}`);
      await go(sis, lock.def.x - 15); await face(sis, 1); await tap('KeyS');
      check('and pulls the high lever: the lock bridge slides out and the lock gate opens', lock.state.on && (await until(() => fb5.state.out >= 1 && gate5.state.open >= 1, 4000)));
      check('both go through: solved', (await go(bro, g + 120)) && (await go(sis, g + 200, 12000)) && (await until(() => game.solved[4], 2000)));
      check('the box stays behind', box5.x < bar5.x);
      check('into section 6', (await go(sis, at(5)[0] + 20)) && (await go(bro, at(5)[1] + 10)) && game.section === 5, `section ${game.section + 1}`);
    }
    if (FROM <= 5) { // ================= section 6: bonus, the see-saw on the ledge
      const g = gate6.def.x;
      check('she puts the box against the ledge', await carry(sis, box6, step6, 1), `box at ${box6.x.toFixed(0)}, wanted ${step6}`);
      await go(sis, box6.x); await hop(sis); check('she hops onto the box', sis.on === box6);
      await leap(sis, sis.x - 5); check('and from it onto the ledge', near(up(sis), blk.h, 4) && sis.x > blk.x[0], `she is ${up(sis).toFixed(0)} up`);
      await go(sis, blk.x[0] + 60); await go(bro, box6.x); await hop(bro); await leap(bro, bro.x - 5);
      check('he follows', near(up(bro), blk.h, 4) && bro.x > blk.x[0], `he is ${up(bro).toFixed(0)} up`);
      await go(bro, saw6.def.x + 110); await hop(bro); check('he hops onto the blue end', bro.on === saw6.ledge && bro.x > saw6.def.x);
      await go(sis, saw6.def.x - 300); await leap(sis, saw6.def.x - 255);
      check('she jumps onto the green end: he flies up to the high shelf', saw6.state.launches === 1 && (await until(() => bro.grounded && near(up(bro), shelf6.h, 4), 4000)), `he is ${up(bro).toFixed(0)} up`);
      await go(bro, lev6.def.x - 40); await face(bro, 1); await tap('ArrowDown');
      check('he pulls the lever: the way to the bridge opens', lev6.state.on && (await until(() => gate6.state.open >= 1, 3000)));
      check('both go on: solved', (await go(bro, g + 120, 12000)) && (await go(sis, g + 200, 12000)) && (await until(() => game.solved[5], 2000)));
      check('into section 7', (await go(sis, at(6)[0] + 20)) && (await go(bro, at(6)[1] + 10)) && game.section === 6, `section ${game.section + 1}`);
    }
    if (FROM <= 6) { // ================= section 7: the Old Bridge, the end of Chapter 1
      const s0 = game.splashes;
      check('he walks over the small boats to the far bank', (await go(bro, farL.def.x - 15, 12000)) && bro.x > RIVER[1] && game.splashes === s0);
      await go(sis, nearL.def.x - 15); key('KeyS', true); await wait(1200);
      check('her lever alone does not move the bridge', sis.holding === nearL.thing && bridge7.state.prog === 0);
      key('ArrowDown', true);
      check('both levers held, one on each bank: the bridge comes down', (await until(() => bridge7.state.down, 6000)) && game.solved[6]); key('KeyS', false); key('ArrowDown', false);
      check('confetti: the one big celebration, at the end of the chapter', REACT.confetti.length > 0);
      check('she walks over the bridge to him: a high five', (await go(sis, bro.x - 110, 14000)) && (await until(() => game.five, 3000)) && MV.highFives > 0);
      await secs(1.2);
      check('to the forest path', (await go(sis, CANAL.exit - 30, 14000)) && (await go(bro, CANAL.exit + 30, 14000)));
      check('the end card', await until(() => game.done, 6000));
      const page = CANAL.next.split('?')[0]; let there = false; try { there = (await fetch(page, { method: 'HEAD' })).ok; } catch (e) { /* not there */ }
      check('the end card leads on to a page that is there: ' + page, there);
      if (typeof CHAPTER !== 'undefined') check('the level is saved as finished', CHAPTER.done('canal'));
    }
    clearInterval(watch);
    // ================= how long each section took, and how far each sibling walked in it
    const ends = game.entered.slice(1).concat([game.finished || game.time]), took = SECTIONS.map((s, n) => ends[n] - game.entered[n]);
    SECTIONS.forEach((s, n) => { if (n < FROM) return; const m = moved[n] || { sister: 0, brother: 0 }; log(`time  section ${s.name}: ${took[n].toFixed(0)} s   (she walked ${m.sister.toFixed(0)}, he walked ${m.brother.toFixed(0)})`); });
    [0, 1, 2, 4, 5, 6].forEach((n) => { if (n >= FROM) { const m = moved[n] || { sister: 0, brother: 0 }; check(`neither only waits in section ${n + 1}`, m.sister > 200 && m.brother > 200); } });
    check('no sticker, dog or ball anywhere in the level', !kit.some((o) => o.star || ['sticker', 'star', 'dog', 'ball'].includes(o.def.kind)));
    if (FROM <= 0) {
      check('the warm-up is quicker than the last puzzle of Level 2 (the Old Bridge there takes this script 18 s)', took[0] < 18, `${took[0].toFixed(0)} s`);
      check('the calm moment is the shortest section', took[3] <= Math.min(took[0], took[1], took[2], took[4], took[5], took[6]));
    }
    log(`time  whole canal: ${(game.finished || game.time).toFixed(0)} s   splashes ${game.splashes}`);
    log(`frame rate: ${game.fps.toFixed(0)} a second, slowest frame ${game.slow.toFixed(0)} ms, canvas ${cv.width}x${cv.height}`);
    log(fails ? `PLAY FAILED ${fails} check${fails > 1 ? 's' : ''}` : 'PLAY PASSED');
  } catch (e) { log('PLAY FAILED ' + (e.stack || e.message)); }
})();
