// Plays Chapter Two start to finish with simulated key presses and reports each step to the dev server.
// Run python tools/dev_server.py 8780 log.txt, open http://127.0.0.1:8780/tools/playtest-city.html?skip=1 and read log.txt:
// the last line says PLAY PASSED or PLAY FAILED. It takes a few minutes, because it waits for lights, the ferry and buses.
(async () => {
  const log = (t) => fetch('/log', { method: 'POST', body: t });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const key = (code, on) => dispatchEvent(new KeyboardEvent(on ? 'keydown' : 'keyup', { code }));
  const tap = async (code) => { key(code, true); await wait(90); key(code, false); await wait(90); };
  const until = async (cond, max = 30000) => { const t0 = performance.now(); while (!cond() && performance.now() - t0 < max) await wait(16); return !!cond(); };
  const holdUntil = async (code, cond, max = 20000) => { key(code, true); const ok = await until(cond, max); key(code, false); await wait(60); return ok; };
  const both = async (codes, cond, max = 20000) => { codes.forEach((c) => key(c, true)); const ok = await until(cond, max); codes.forEach((c) => key(c, false)); await wait(60); return ok; };
  const R2 = ['KeyD', 'ArrowRight'];
  // walk one sibling to a spot (within 12 units)
  const goTo = async (p, x, max = 15000) => { const k = p.keys, t0 = performance.now(); while (Math.abs(p.x - x) > 12 && performance.now() - t0 < max) { const d = x > p.x ? k.right : k.left, o = x > p.x ? k.left : k.right; key(o, false); key(d, true); await wait(16); } key(k.left, false); key(k.right, false); await wait(60); return Math.abs(p.x - x) <= 12; };
  const goBoth = async (xs, xb, max) => { const r = await Promise.all([goTo(sis, xs, max), goTo(bro, xb, max)]); return r[0] && r[1]; };
  while (typeof players === 'undefined' || typeof game === 'undefined') await wait(50);
  let hits = 0; const stunWatch = setInterval(() => { for (const p of players) if (p.stun > 0.85) hits++; }, 16);
  const check = (name, ok) => { log(`${ok ? 'ok  ' : 'FAIL'} ${name} | sis=${sis.x.toFixed(0)} ${sis.plane} bro=${bro.x.toFixed(0)} ${bro.plane} goal="${game.objective}"`); if (!ok) throw new Error(name); };
  try {
    await until(() => game.chapter <= 0);
    // 0. The torn map: three pieces on Maple Street
    await goBoth(PIECES.gust + 60, PIECES.gust - 20, 10000);
    check('the wind tears the map', await until(() => game.pieces.gust && game.pieces.fly.every((f) => f.u >= 1), 6000));
    await goTo(sis, PIECES.spots[0].x); await tap('KeyW');
    await goTo(bro, PIECES.spots[1].x); await tap('ArrowDown');
    await goTo(bro, PIECES.spots[2].x); await tap('ArrowUp');
    check('three map pieces found', piecesGot() === 3);
    // 1. Maple Street crossing
    check('walk to the crossing', await goBoth(CROSSING.button, CROSSING.button - 70, 20000)); await tap('KeyW');
    check('button pressed', game.cross.phase === 'wait');
    check('green man', await until(() => game.cross.phase === 'walk', 6000));
    check('crossed Maple Street', await both(R2, () => sis.x > 2400 && bro.x > 2400, 8000));
    // 2. Baker's Alley
    await goBoth(A.buttonOut, A.shutter, 10000);
    key('KeyW', true); check('shutter opens', await until(() => game.shutter > 0.8, 4000));
    await tap('ArrowUp'); check('brother in the yard', bro.plane === 'yard'); key('KeyW', false);
    await goTo(bro, A.buttonIn); key('ArrowUp', true);
    await until(() => game.shutter > 0.8, 4000); await goTo(sis, A.shutter); await tap('KeyW');
    check('sister in the yard', sis.plane === 'yard'); key('ArrowUp', false);
    await holdUntil('ArrowRight', () => bro.x >= A.gate - 20, 5000); await tap('ArrowDown');
    check('brother under the gate', bro.x > A.gate);
    await goTo(bro, A.gateButton); await tap('ArrowUp');
    check('gate open', game.gateOpen);
    await goBoth(A.arch, A.arch - 20); await tap('KeyW'); await tap('ArrowUp');
    check('out through the arch', sis.plane === 'street' && bro.plane === 'street' && sis.x > A.barrier[1]);
    // 2b. The market puppy: one sibling heads it off on the far side, the other drives it towards them
    await goBoth(PUPPY.area[0] + 80, PUPPY.area[0] + 140, 10000);
    const pup = game.pup, t0 = performance.now();
    while (pup.mode !== 'trapped' && performance.now() - t0 < 60000) {
      const bt = bro.x < pup.x ? PUPPY.area[1] + 30 : pup.x + 150, st = Math.min(pup.x - 150, PUPPY.area[1]);
      await Promise.all([goTo(bro, bt, 250), goTo(sis, st, 250)]);
    }
    check('puppy cornered from both sides', pup.mode === 'trapped');
    await tap(Math.abs(sis.x - pup.x) < Math.abs(bro.x - pup.x) ? 'KeyW' : 'ArrowUp');
    check('last map piece back', game.pup.caught && piecesGot() === 4);
    // 3. The canal ferry: sister rides over, sends it back, then calls it for her brother
    await goBoth(F.canal[0] + 100, F.buttonNear, 20000);
    await tap('ArrowUp'); check('ferry sent with sister', game.ferry.moving > 0);
    check('ferry across', (await until(() => !game.ferry.moving, 12000)) && game.ferry.side === 'far');
    await goTo(sis, F.buttonFar); await tap('KeyW');
    check('ferry back to brother', (await until(() => !game.ferry.moving, 12000)) && game.ferry.side === 'near');
    await goTo(bro, F.canal[0] + 100); await tap('KeyW');
    check('ferry brings brother', (await until(() => !game.ferry.moving, 12000)) && game.ferry.side === 'far');
    await both(R2, () => sis.x > 6300 && bro.x > 6300, 8000);
    check('canal crossed', sis.x > F.canal[1] && bro.x > F.canal[1]);
    // 4. Grand Avenue: wait for each green man
    const [ra, rb] = AVENUE.roads, hitsBefore = hits;
    await goBoth(ra[0] - 30, ra[0] - 60);
    check('first green man', await until(() => avenuePhase(0).walk === 'walk', 20000));
    await goBoth(AVENUE.island[1] - 40, AVENUE.island[1] - 90, 6000);
    check('second green man', await until(() => avenuePhase(1).walk === 'walk', 20000));
    await both(R2, () => sis.x > rb[1] + 40 && bro.x > rb[1] + 40, 6000);
    check('avenue crossed without a bump', hits === hitsBefore && sis.x > rb[1]);
    // 5. The metro: take a wrong train on purpose (to the end of the line), then Blue line to Central, Green line to Old Town
    await goBoth(METRO.entrance - 20, METRO.entrance + 40, 8000); await tap('ArrowDown');
    check('down into the metro', inMetro() && game.metro.station === METRO.start);
    const ride = async (line, dir, getOff) => {
      for (let n = 0; n < 8; n++) {
        await until(() => game.metro.train && game.metro.train.state === 'open', 60000);
        const tr = game.metro.train;
        if (tr.line === line && tr.dir === dir) {
          await goBoth(TRAIN_STOP - 230, TRAIN_STOP - 190, 5000); await tap('KeyW'); await tap('ArrowUp');
          if (!game.metro.ride) continue;
          log(`riding ${line} line to ${terminus(line, dir)} from ${game.metro.station}`);
          if (getOff) { await until(() => game.metro.ride && game.metro.ride.state === 'stopped' && game.metro.ride.at === getOff, 60000); await tap('ArrowDown'); }
          await until(() => !game.metro.ride, 60000); return game.metro.station;
        }
        await until(() => !game.metro.train || game.metro.train.state !== 'open', 15000);
      }
      return null;
    };
    check('wrong way: to the end of the line', (await ride('Blue', -1, null)) === 'Market Square');
    check('Blue line back past Grand Avenue to Central', (await ride('Blue', 1, 'Central')) === 'Central');
    check('Green line to Old Town', (await ride('Green', 1, 'Old Town')) === METRO.goal);
    await goTo(sis, METRO.stairs + 20); await tap('KeyW');
    check('up into Old Town', sis.plane === 'street' && bro.plane === 'street' && sis.x > METRO.closed[1]);
    // 5. The bus: take one wrong bus on purpose, then the right one
    await goBoth(BUS.stop + 30, BUS.stop - 40, 15000);
    let triedWrong = false;
    for (let n = 0; n < 10 && !game.bus.arrived; n++) {
      await until(() => game.bus.state === 'waiting' && game.bus.t > 3, 40000);
      const right = busNow().place === 0;
      if (right || !triedWrong) {
        const line = busNow().line; await tap('KeyW'); await tap('ArrowUp');
        if (right) { log('boarded bus ' + line + ' (the right one)'); await until(() => game.bus.arrived, 30000); }
        else { triedWrong = true; log('boarded bus ' + line + ' (a wrong one)'); check('wrong bus brings them back', (await until(() => game.fade, 15000)) && (await until(() => !game.fade && sis.plane === 'street', 10000))); }
      } else await until(() => game.bus.state !== 'waiting', 15000);
      if (!game.bus.arrived) await goBoth(BUS.stop + 30, BUS.stop - 40, 8000);
    }
    check('bus ride to the Old Bridge', game.bus.arrived && sis.plane === 'street' && sis.x > 10500);
    // 6. The Old Bridge: power on (sister), controls in the hut (brother)
    await goTo(sis, BRIDGE.power); await tap('KeyW');
    check('power on', game.bridge.power);
    await goTo(bro, BRIDGE.hut - 48); await tap('ArrowDown');
    check('brother in the hut', bro.plane === 'hut'); await tap('ArrowUp');
    check('bridge lowered', await until(() => game.bridge.down, 10000));
    check('into Forest Park', await both(R2, () => game.exitT >= 0, 15000));
    check('chapter complete', await until(() => game.done, 5000));
    log(`bumps by cars: ${hits}   game time: ${game.time.toFixed(0)} s (${(game.time / 60).toFixed(1)} min)`);
    log('PLAY PASSED');
  } catch (e) { log('PLAY FAILED ' + e.message); }
  clearInterval(stunWatch);
})();
