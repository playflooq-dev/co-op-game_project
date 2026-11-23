// Plays Level 1 (the park) from the first section to the end card with simulated key presses, both siblings, and
// reports each step and the time each section took to the dev server.
// Run python tools/dev_server.py 8780 log.txt, open http://127.0.0.1:8780/tools/playtest-park.html and read log.txt:
// the last line says PLAY PASSED or PLAY FAILED. (?section=3 starts it at section 3; ?fps=30 runs it like a slow device.)
// It presses the same keys a player would and never moves anybody by magic, so if it gets through, the level can be
// finished. tools/playtest-park.html?solo=1 runs the other test instead (further down): that one sibling alone cannot
// finish any of the puzzles.
(async () => {
  let sent = Promise.resolve(); // one line at a time: two reports arriving together can overwrite each other in the log file
  const log = (t) => (sent = sent.then(() => fetch('/log', { method: 'POST', body: t }).catch(() => {})));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const tick = () => new Promise((r) => requestAnimationFrame(r));
  while (typeof players === 'undefined' || typeof kit === 'undefined') await wait(50);
  await wait(400);
  const frame = async () => { const t = game.time; do { await tick(); } while (game.time === t); }; // one frame of the game
  const frames = async (n) => { for (let i = 0; i < n; i++) await frame(); };
  const secs = async (s) => { const t = game.time + s; while (game.time < t) await frame(); };       // seconds of the game, not of the clock
  const key = (code, on) => dispatchEvent(new KeyboardEvent(on ? 'keydown' : 'keyup', { code }));
  const tap = async (code) => { key(code, true); await frames(3); key(code, false); await frames(2); };
  const until = async (cond, max = 5000) => { const t0 = performance.now(); while (!cond() && performance.now() - t0 < max) await frame(); return !!cond(); };
  const up = (p) => FEET - p.y; // how high the feet are above the path
  const near = (v, want, tol) => Math.abs(v - want) <= tol;
  const JUMP = { sister: 'KeyW', brother: 'ArrowUp' }, GRAB = { sister: 'KeyS', brother: 'ArrowDown' };
  // walk to a place, jumping whenever something is in the way
  const go = async (p, x, max = 9000) => {
    const k = p.keys, t0 = performance.now(); let held = 0;
    while (Math.abs(p.x - x) >= 16 && performance.now() - t0 < max) {
      const d = x > p.x ? 1 : -1; key(d > 0 ? k.left : k.right, false); key(d > 0 ? k.right : k.left, true);
      if (held > 0) { if (--held === 0) key(k.up, false); } else if (p.grounded && p.hitSide === d) { key(k.up, true); held = 3; }
      await frame();
    }
    key(k.left, false); key(k.right, false); key(k.up, false); await until(() => p.grounded && Math.abs(p.vx) < 5, 2500); await frames(3); // standing still, not sliding to a stop
    return Math.abs(p.x - x) < 60;
  };
  const face = async (p, d) => { const c = d > 0 ? p.keys.right : p.keys.left; key(c, true); await frames(2); key(c, false); await frames(3); };
  const hop = async (p) => { await tap(JUMP[p.who]); await until(() => p.grounded, 2500); await frames(2); };           // jump on the spot
  const carry = async (p, box, toX, d, from = d) => { // fetch a box (standing on its 'from' side) and put it down so that it lands at toX
    await go(p, box.x - from * 84); await face(p, from); await tap(GRAB[p.who]); if (!(await until(() => p.carry === box && box.liftT >= 1, 2500))) return false;
    await go(p, toX - d * ((p.w + box.w) / 2 + 10)); await face(p, d); await tap(GRAB[p.who]); return (await until(() => !box.held && box.grounded, 2500)) && Math.abs(box.x - toX) < 40;
  };
  const liftUp = async () => { await tap('ArrowDown'); return until(() => MV.duo.state === 'on', 2500); };               // he asks, she lifts
  const inSection = (n, kind, i = 0) => kit.filter((o) => o.section === n && o.def.kind === kind)[i];
  const other = (p) => (p === sis ? bro : sis);

  let fails = 0;
  const check = (name, ok, info = '') => { if (!ok) fails++; log(`${ok ? 'ok  ' : 'FAIL'} ${name}${info ? '   [' + info + ']' : ''}`); return ok; };
  const plateA = inSection(1, 'plate', 0), plateB = inSection(1, 'plate', 1), gate1 = inSection(1, 'parkgate');
  const plateC = inSection(2, 'plate'), gate2 = inSection(2, 'parkgate'), box = inSection(2, 'parkbox').body, bar = inSection(2, 'bar').def;
  const pond = inSection(3, 'pond'), tree = inSection(4, 'balloon'), gate4 = inSection(4, 'parkgate');
  const e1 = inSection(5, 'plate', 0), e2 = inSection(5, 'plate', 1), gate5 = inSection(5, 'parkgate');

  // ---------- the solo test (?solo=1): one sibling works alone while the other stands still at the start of the
  // section, and every short cut I could think of is tried. Each check passes when the short cut does NOT work.
  // (It puts the siblings and the box where a try starts; the tries themselves use the keys.)
  if (QS.get('solo')) {
    const KEYS = ['KeyA', 'KeyD', 'KeyW', 'KeyS', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    const put = (b, x, h = 0) => Object.assign(b, { x, y: FEET - h - 1, vx: 0, vy: 0, grounded: false, on: null, held: false, carrier: null });
    const set = async (xs, xb, hs = 0, hb = 0) => { for (const c of KEYS) key(c, false); if (MV.duo.state) endRide(); MV.pending = null; for (const p of players) if (p.carry) putDown(p); put(sis, xs, hs); put(bro, xb, hb); camX = cameraTarget(); await until(() => sis.grounded && bro.grounded, 3000); await frames(4); };
    const place = (p, x, rest, h = 0) => (p === sis ? set(x, rest, h, 0) : set(rest, x, 0, h)); // p at x, the other waiting at 'rest'
    const jumpGrab = async (p) => { key(JUMP[p.who], true); await frames(2); key(JUMP[p.who], false); await until(() => p.vy > -80, 1500); await tap(GRAB[p.who]); await until(() => p.grounded, 2500); await frames(3); }; // grab at the top of a jump
    const run = async (p, d, cond, max = 4000) => { const c = d > 0 ? p.keys.right : p.keys.left; key(c, true); const ok = await until(cond, max); key(c, false); return ok; };
    const dash = async (p, toX, jump) => { // run right, with a jump on the way if asked, and see where they get to
      key(p.keys.right, true); if (jump) { await frames(2); key(p.keys.up, true); await frames(3); key(p.keys.up, false); }
      await until(() => p.x > toX || (p.grounded && p.hitSide === 1), 4000); await secs(0.5); key(p.keys.right, false); await until(() => p.grounded, 2000); await frames(3); return p.x;
    };
    try {
      for (const p of players) { // ---- section 2: plate and gate
        const rest = 3400, g = gate1.def.x, name = p.who;
        await place(p, plateA.def.x, rest); await until(() => gate1.state.open >= 1, 2500);
        check(`2: ${name} on the plate opens the gate`, gate1.state.open >= 1);
        check(`2: ${name} cannot step off the plate and dash through`, (await dash(p, g + 100)) < g, `got to ${p.x.toFixed(0)}, gate at ${g}`);
        await place(p, plateA.def.x, rest); await until(() => gate1.state.open >= 1, 2500);
        check(`2: nor with a jump off the plate`, (await dash(p, g + 100, true)) < g, `got to ${p.x.toFixed(0)}`);
        await place(p, plateA.def.x - 420, rest);
        check(`2: nor with a running start over the plate`, (await dash(p, g + 100)) < g, `got to ${p.x.toFixed(0)}`);
        await secs(1.2); check(`2: the gate is shut again behind ${name}`, gate1.state.open === 0 && !game.solved[1]);
      }
      for (const p of players) { // ---- section 3: the box on the plate
        const rest = 4800, g = gate2.def.x, name = p.who;
        await place(p, plateC.def.x, rest); await until(() => gate2.state.open >= 1, 2500);
        check(`3: ${name} cannot step off the plate and dash through`, (await dash(p, g + 100)) < g, `got to ${p.x.toFixed(0)}, gate at ${g}`);
        await place(p, plateC.def.x, rest); await until(() => gate2.state.open >= 1, 2500);
        check(`3: nor with a jump`, (await dash(p, g + 100, true)) < g, `got to ${p.x.toFixed(0)}`);
        await go(p, box.x - 84, 3000); await tap(GRAB[p.who]); await frames(10);
        check(`3: ${name} cannot get to the box alone`, !p.carry && p.x < g && box.x > g && !game.solved[2], `${name} at ${p.x.toFixed(0)}, box at ${box.x.toFixed(0)}`);
      }
      for (const p of players) { // the bar keeps the box out of the balloon's section (where it could be a step)
        put(box, bar.x - 260); await place(p, bar.x - 345, bar.x - 600); await tap(GRAB[p.who]); await until(() => box.liftT >= 1, 2000); await go(p, bar.x + 200, 5000);
        check(`3: the bar stops ${p.who} carrying the box on`, !p.carry && box.x < bar.x && p.x > bar.x, `box at ${box.x.toFixed(0)}`);
      }
      put(box, inSection(2, 'parkbox').def.x); await set(4800, 4880);
      const bx = tree.def.x; // ---- section 5: the balloon
      for (const p of players) {
        await place(p, bx - 20, 7400); await tap(GRAB[p.who]); await frames(6);
        check(`5: ${p.who} cannot reach the balloon from the path`, !tree.state.got);
        await jumpGrab(p); check(`5: nor by jumping`, !tree.state.got);
        check(`5: and the little gate stays shut for ${p.who}`, (await dash(p, gate4.def.x + 100)) < gate4.def.x && gate4.state.open === 0, `got to ${p.x.toFixed(0)}`);
      }
      put(box, bx - 10); await set(bx - 10, 7400, 90); await until(() => sis.on === box, 2000); await tap('KeyS'); await frames(6); await jumpGrab(sis);
      check('5: even standing on the box (which cannot get there) she cannot reach it', !tree.state.got, `she reaches ${(FEET - sibReachY(sis)).toFixed(0)} from the box, the balloon is at ${tree.def.h}`);
      put(box, inSection(2, 'parkbox').def.x);
      for (const p of players) { // ---- section 6: the two plates. (The balloon gate is in the way, so they are put past it.)
        const rest = 8580, name = p.who;
        await place(p, e1.def.x, rest); await secs(1.5);
        check(`6: ${name} on one plate does not open the way out`, gate5.state.open === 0 && KIT_SIG.e1 && !KIT_SIG.e2);
        await place(p, (e1.def.x + e2.def.x) / 2, rest); await secs(1.5);
        check(`6: standing between the plates presses at most one`, gate5.state.open === 0 && !(KIT_SIG.e1 && KIT_SIG.e2));
        await place(p, e1.def.x - 300, rest); const got = await dash(p, gate5.def.x + 100);
        check(`6: running over both plates does not open it`, got < gate5.def.x && !gate5.state.latched && gate5.state.open < 0.2, `got to ${got.toFixed(0)}, gate ${gate5.state.open.toFixed(2)} open`);
        await place(p, e1.def.x, rest); await hop(p); key(p.keys.right, true); await tap(JUMP[p.who]); await until(() => p.grounded && p.x > e2.def.x - 40, 2500); key(p.keys.right, false); await secs(1);
        check(`6: nor hopping from one plate to the other`, !gate5.state.latched, `${name} at ${p.x.toFixed(0)}`);
      }
      check('the balloon is still in the tree and the way out is still shut', !tree.state.got && !game.solved[4] && !gate5.state.latched && !game.solved[5]); // (the two gate puzzles were checked above, before anybody was put past them)
      log(fails ? `PLAY FAILED ${fails} short cut${fails > 1 ? 's' : ''} worked` : 'PLAY PASSED');
    } catch (e) { log('PLAY FAILED ' + (e.stack || e.message)); }
    return;
  }

  // ---------- the play-through. While it plays, it also watches that neither sibling stands still for a whole puzzle.
  const moved = {}; let lastX = { sister: sis.x, brother: bro.x };
  const watch = setInterval(() => { for (const p of players) { const m = (moved[game.section] = moved[game.section] || { sister: 0, brother: 0 }); m[p.who] += Math.abs(p.x - lastX[p.who]); lastX[p.who] = p.x; } }, 30);
  try {
    const H = MOVE.jumpHeight * broHeight();
    if (FROM <= 0) { // ================= section 1: learn to move. Nothing to solve.
      let top = 0; key('KeyW', true); for (let i = 0; i < 80; i++) { await frame(); if (i === 2) key('KeyW', false); top = Math.max(top, up(sis)); if (i > 6 && sis.grounded) break; }
      check(`a jump is ${MOVE.jumpHeight} brother-heights`, near(top, H, H * 0.03), `wanted ${H.toFixed(0)}, got ${top.toFixed(0)}`);
      const ball = inSection(0, 'ball'), puddle = inSection(0, 'puddle'), log1 = inSection(0, 'log').def, apple = inSection(0, 'sticker');
      const dog = inSection(0, 'dog'), flock = inSection(0, 'birds'), patch = inSection(0, 'flowers'), paw = inSection(0, 'sticker', 1);
      check('the dog waits by the path, and the birds sit on the grass', dog.state.mode === 'wait' && flock.birds.every((b) => b.mode === 'sit'));
      await go(bro, dog.def.x - 70); check('the dog comes up to him', dog.state.mode === 'follow' && (await until(() => !dog.state.run, 2500)) && Math.abs(dog.state.x - bro.x) < 130);
      await face(bro, 1); await tap('ArrowDown'); check('he pets it: a sticker', dog.state.pats === 1 && (await until(() => paw.star.got, 1500)));
      check('she gets up and down the steps', (await go(sis, 1500)) && up(sis) < 3);
      check('the birds flew up as she ran past', flock.state.flown > 0 && flock.birds.every((b) => b.mode !== 'sit'));
      check('the flowers bounced', patch.state.bounced > 0, `${patch.state.bounced} times`);
      check('he gets over them too', (await go(bro, 1460)) && up(bro) < 3);
      const b0 = ball.state.x; await go(bro, 1760); check('the ball rolls away when he runs into it', Math.abs(ball.state.x - b0) > 40, `it moved ${(ball.state.x - b0).toFixed(0)}`);
      check('both hop the low fence', (await go(sis, 2080)) && (await go(bro, 2030)));
      const fx0 = MV.fx.length; await go(sis, puddle.def.x); check('the puddle splashes', MV.fx.length > fx0 || puddle.state.t < 1);
      await go(bro, log1.x); check('he hops onto the log and finds the sticker', near(up(bro), log1.h, 3) && apple.star.got, `he is ${up(bro).toFixed(0)} up`);
      check('nothing in section 1 needs a hint', !hint.step && game.section === 0);
      check('the dog has come along, over the steps, the fence and the log', dog.state.x > 2400 && Math.min(Math.abs(dog.state.x - sis.x), Math.abs(dog.state.x - bro.x)) < 200, `dog at ${dog.state.x.toFixed(0)}`);
      check('over the log, into section 2', (await go(sis, 3400)) && (await go(bro, 3480)) && game.section === 1, `section ${game.section + 1}`);
      check('the dog stays at the end of its stretch', dog.state.x <= dog.def.to + 1, `dog at ${dog.state.x.toFixed(0)}`);
    }
    if (FROM <= 1) { // ================= section 2: plate and gate (teach)
      const g = gate1.def.x;
      check('the gate is shut', gate1.state.open === 0 && !(await go(bro, g + 100, 2500)) && bro.x < g);
      await go(sis, plateA.def.x); check('she stands on the plate and the gate opens', (await until(() => gate1.state.open >= 1, 3000)) && sis.on === plateA.ledge);
      check('he walks through', (await go(bro, plateB.def.x)) && bro.x > g);
      check('he stands on the plate on the far side', bro.on === plateB.ledge && KIT_SIG.b);
      check('they cheered when the gate opened', LIFE.cheers > 0);
      const w0 = LIFE.waves; let arm = 0; const seen = await until(() => LIFE.waves > w0, 6000); for (let i = 0; i < 40; i++) { await frame(); arm = Math.max(arm, sis.ex.arm, bro.ex.arm); }
      check('apart and standing still, they wave to each other', seen && arm > 0.5, `arm ${arm.toFixed(2)}`);
      await go(sis, g - 150); await secs(1.2); check('she steps off hers and the gate stays open', gate1.state.open >= 1 && !KIT_SIG.a);
      check('she walks through: solved, and they cheer', (await go(sis, g + 200)) && (await until(() => game.solved[1], 2000)) && sis.cheer > 0 && bro.cheer > 0);
      check('into section 3', (await go(sis, 4800)) && (await go(bro, 4880)) && game.section === 2, `section ${game.section + 1}`);
      check('the gate shuts behind them', await until(() => gate1.state.open === 0, 3000));
    }
    if (FROM <= 2) { // ================= section 3: the box on the plate (practise)
      const g = gate2.def.x;
      await go(bro, plateC.def.x); check('he stands on the plate and the gate opens', (await until(() => gate2.state.open >= 1, 3000)));
      check('she walks through to the box', (await go(sis, box.x - 84)) && sis.x > g);
      const boxKit = inSection(2, 'parkbox'), cat = boxKit.state.cat; check('the cat sits on the box', cat.mode === 'box');
      await face(sis, 1); await tap('KeyS'); check('she picks it up', await until(() => sis.carry === box && box.liftT >= 1, 2500));
      check('and the cat hops off', cat.hops === 1 && (await until(() => cat.mode === 'sit', 2000)));
      check('and carries it back under the open gate', (await go(sis, plateC.def.x + 140)) && sis.carry === box && sis.x < g);
      await go(bro, plateC.def.x - 130); await go(sis, plateC.def.x + (sis.w + box.w) / 2 + 10); await face(sis, -1); await tap('KeyS');
      check('she puts the box on the plate as he steps off: the gate is open', (await until(() => !box.held && box.grounded, 2500)) && box.on === plateC.ledge && (await until(() => gate2.state.open >= 1, 3000)), `box at ${box.x.toFixed(0)}, plate at ${plateC.def.x}`);
      check('the box landed with a squash', boxKit.state.landed > 0);
      check('both walk through: solved', (await go(sis, g + 200)) && (await go(bro, g + 120)) && (await until(() => game.solved[2], 2000)));
      check('left alone, the cat goes back onto its box', await until(() => cat.mode === 'box', 8000));
      check('the box stays behind and the gate stays open', gate2.state.open >= 1 && box.on === plateC.ledge);
      check('under the bar, into section 4', (await go(sis, 6200)) && (await go(bro, 6280)) && game.section === 3, `section ${game.section + 1}`);
    }
    if (FROM <= 3) { // ================= section 4: the pond. Nothing has to be done.
      const drop = inSection(3, 'sticker');
      await go(bro, pond.pond.cx - 60); await tap('ArrowDown'); check('he splashes in the pond: a sticker', pond.state.n > 0 && (await until(() => drop.star.got, 1500)));
      check('the ducks swim away from the splash', pond.state.fled > 0 && pond.ducks.every((k) => k.flee > 0));
      await go(sis, pond.pond.cx + 80); const n0 = pond.state.n; await tap('KeyS'); check('she can splash too', pond.state.n > n0);
      check('into section 5', (await go(sis, 7400)) && (await go(bro, 7480)) && game.section === 4, `section ${game.section + 1}`);
    }
    if (FROM <= 4) { // ================= section 5: the balloon (twist: the lift)
      const bx = tree.def.x;
      check('the little gate is shut', gate4.state.open === 0);
      await go(sis, bx - 20); await tap('KeyS'); await frames(6); check('she cannot reach the balloon alone', !tree.state.got);
      await go(bro, bx + 50); check('she lifts him, and he giggles', (await liftUp()) && LIFE.giggles > 0 && bro.giggle > 0);
      await tap('ArrowDown'); check('and he takes the balloon: solved', tree.state.got && tree.state.holder === bro && (await until(() => game.solved[4], 1500)));
      check('she looks proud', LIFE.proud > 0 && (await until(() => sis.ex.happy > 0.6, 1500)));
      await tap('ArrowDown'); check('grab again just sets him down (no toss in Level 1)', (await until(() => !MV.duo.state && bro.grounded, 2500)) && up(bro) < 3 && Math.abs(bro.x - sis.x) < 260, `he landed ${Math.abs(bro.x - sis.x).toFixed(0)} away`);
      check('the balloon opens the little gate', await until(() => gate4.state.open >= 1, 3000));
      check('into section 6, the balloon with him', (await go(sis, 8600)) && (await go(bro, 8680)) && game.section === 5 && Math.abs(tree.state.x - bro.x) < 200, `section ${game.section + 1}`);
    }
    if (FROM <= 5) { // ================= section 6: the way out, together
      await go(sis, e1.def.x); await secs(1); check('one plate is not enough', gate5.state.open === 0 && KIT_SIG.e1);
      const fives = MV.highFives;
      await go(bro, e2.def.x); check('both plates at once: the gate opens and stays open', (await until(() => gate5.state.latched, 3000)));
      check('confetti', LIFE.confetti.length > 0);
      check('a high five', (await until(() => MV.highFives > fives, 4000)));
      await secs(1.5);
      check('to the way out', (await go(sis, PARK.exit - 30, 14000)) && (await go(bro, PARK.exit + 30, 14000)));
      check('the end card', await until(() => game.done, 6000));
      check('the end card leads on to a page that is there: ' + PARK.next, (await fetch(PARK.next, { method: 'HEAD' })).ok);
    }
    clearInterval(watch);
    // ================= how long each section took, and how far each sibling walked in it
    const ends = game.entered.slice(1).concat([game.finished || game.time]);
    SECTIONS.forEach((s, n) => { if (n < FROM) return; const m = moved[n] || { sister: 0, brother: 0 }; log(`time  section ${s.name}: ${(ends[n] - game.entered[n]).toFixed(0)} s   (she walked ${m.sister.toFixed(0)}, he walked ${m.brother.toFixed(0)})`); });
    [1, 2, 4, 5].forEach((n) => { if (n >= FROM) { const m = moved[n] || { sister: 0, brother: 0 }; check(`neither only waits in section ${n + 1}`, m.sister > 200 && m.brother > 200); } });
    log(`time  whole park: ${(game.finished || game.time).toFixed(0)} s   stickers ${stickersGot()}/${stickers.length}`);
    log(`frame rate: ${game.fps.toFixed(0)} a second, slowest frame ${game.slow.toFixed(0)} ms, canvas ${cv.width}x${cv.height}`);
    log(fails ? `PLAY FAILED ${fails} check${fails > 1 ? 's' : ''}` : 'PLAY PASSED');
  } catch (e) { log('PLAY FAILED ' + (e.stack || e.message)); }
})();
