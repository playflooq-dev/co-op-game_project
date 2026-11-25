// Plays Chapter Two start to finish with simulated key presses and reports each step to the dev server.
// Run python tools/dev_server.py 8780 log.txt, open http://127.0.0.1:8780/tools/playtest-city.html?skip=1 and read log.txt:
// the last line says PLAY PASSED or PLAY FAILED. It takes a few minutes. It also collects all eight stickers.
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
  const boost = async (x, done) => { await goBoth(x - 10, x + 40, 8000); await tap('KeyW'); return (await until(() => game.boost, 1500)) && (await until(() => !game.boost && done(), 5000)); };
  while (typeof players === 'undefined' || typeof game === 'undefined') await wait(50);
  let hits = 0; const stunWatch = setInterval(() => { for (const p of players) if (p.stun > 0.85) hits++; }, 16);
  const check = (name, ok) => { log(`${ok ? 'ok  ' : 'FAIL'} ${name} | sis=${sis.x.toFixed(0)} ${sis.plane} bro=${bro.x.toFixed(0)} ${bro.plane} goal="${game.objective}"`); if (!ok) throw new Error(name); };
  try {
    await until(() => game.chapter <= 0);
    // 0. The torn map: three pieces on Maple Street (reach, small hands, and a boost), and two stickers on the way
    await goBoth(PIECES.gust + 60, PIECES.gust - 20, 10000);
    check('the wind tears the map', await until(() => game.pieces.gust && game.pieces.fly.every((f) => f.u >= 1), 6000));
    await tap('KeyS'); check('the treasure map opens', game.panel && game.panel.kind === 'treasure'); await tap('KeyS');
    await goTo(bro, 700); await tap('ArrowDown'); check('sticker under the bench', game.stickers.has('bench'));
    await goTo(bro, PIECES.spots[1].x); await tap('ArrowDown');
    await goTo(sis, PIECES.spots[0].x); await tap('KeyW');
    check('two map pieces found', piecesGot() === 2);
    await goTo(sis, PIECES.spots[2].x); await tap('KeyW');
    check('the window box is too high for one', !game.boost && !game.pieces.got[2]);
    check('boost: third map piece', await boost(PIECES.spots[2].x, () => game.pieces.got[2]));
    await goTo(sis, 1745); await tap('KeyW'); check('sticker on the shop sign', game.stickers.has('awning'));
    // 1. Maple Street crossing
    check('walk to the crossing', await goBoth(CROSSING.button, CROSSING.button - 70, 20000)); await tap('KeyW');
    check('button pressed', game.cross.phase === 'wait');
    check('green man', await until(() => game.cross.phase === 'walk', 6000));
    check('crossed Maple Street', await both(R2, () => sis.x > 2400 && bro.x > 2400, 8000));
    // 2. The mill yard. First the wrong way round: the brother goes in, and cannot reach the chain.
    await goBoth(A.buttonOut, A.shutter, 10000);
    key('KeyW', true); check('shutter opens', await until(() => game.shutter > 0.8, 4000));
    await tap('ArrowUp'); check('brother in the yard', bro.plane === 'yard'); key('KeyW', false);
    await goTo(bro, A.chain); await tap('ArrowUp');
    check('brother cannot reach the chain', !game.shutterLocked);
    await goTo(bro, A.shutter); key('KeyW', true); await until(() => game.shutter > 0.8, 4000); await tap('ArrowUp'); key('KeyW', false);
    check('brother back outside', bro.plane === 'street');
    // then the right way: she goes in first and hooks the shutter open
    await goBoth(A.shutter, A.buttonOut, 8000);
    key('ArrowUp', true); await until(() => game.shutter > 0.8, 4000); await tap('KeyW'); key('ArrowUp', false);
    check('sister in the yard', sis.plane === 'yard');
    await goTo(sis, A.chain); await tap('KeyW');
    check('chain hooks the shutter open', game.shutterLocked && (await until(() => game.shutter > 0.8, 4000)));
    await goTo(bro, A.shutter); await tap('ArrowUp'); check('both in the yard', bro.plane === 'yard');
    check('boost: the odd sock sticker', await boost(A.sock[0], () => game.stickers.has('sock')));
    await goTo(bro, A.gate - 30, 5000); await tap('ArrowDown');
    check('brother under the gate', bro.x > A.gate);
    await goTo(bro, A.gateButton); await tap('ArrowUp');
    check('gate open', game.gateOpen);
    await goBoth(A.arch, A.arch - 20); await tap('KeyW'); await tap('ArrowUp');
    check('out through the arch', sis.plane === 'street' && bro.plane === 'street' && sis.x > A.barrier[1]);
    // 3. The market puppy: it hides under a stall; she waits on one side, he crawls in from the other
    await goBoth(PUPPY.area[0] + 80, PUPPY.area[0] + 140, 10000);
    const pup = game.pup;
    for (let n = 0; n < 6 && pup.mode !== 'trapped'; n++) {
      if (!(await until(() => pup.mode === 'hide' || pup.mode === 'trapped', 4000))) { await goTo(bro, pup.x + (bro.x < pup.x ? -100 : 100), 3000); continue; }
      if (pup.mode === 'trapped') break;
      const s = pup.stall, side = s + 300 <= PUPPY.area[1] + 30 ? 1 : -1;
      if (n === 0) { await goTo(bro, s - side * 150, 8000); await tap('ArrowDown'); check('flushed with nobody waiting: it runs off again', pup.mode !== 'trapped' && !pup.caught); continue; }
      await goBoth(s + side * 290, s - side * 150, 8000); await tap('ArrowDown');
    }
    check('puppy stopped by the sister', pup.mode === 'trapped');
    await tap('KeyW');
    check('last map piece back', game.pup.caught && piecesGot() === 4);
    await wait(300); await tap('KeyW'); check('sticker for petting the puppy', game.stickers.has('paw'));
    // 4. The canal: she holds the rope, he crosses the boats and sends the ferry back for her
    await goBoth(F.post, F.canal[0] - 40, 20000);
    await holdUntil('ArrowRight', () => false, 700); check('boats are too wobbly without the rope', bro.plane === 'street');
    key('KeyW', true); check('rope pulled tight', await until(() => game.canal.tight > 0.95, 4000));
    await goTo(bro, boatHome(2), 12000); check('brother on the boats', bro.plane === 'boats');
    key('KeyW', false); await wait(1500); await holdUntil('ArrowRight', () => false, 800);
    check('rope slack: he is stuck on his boat', bro.plane === 'boats' && Math.abs(bro.x - boatHome(2)) < 120);
    key('KeyW', true); await until(() => game.canal.tight > 0.95, 4000);
    await goTo(bro, boatHome(2), 3000); await tap('ArrowDown'); check('sticker in the boat', game.stickers.has('boat'));
    check('brother across the boats', await holdUntil('ArrowRight', () => bro.plane === 'street' && bro.x > F.canal[1], 12000)); key('KeyW', false);
    await goTo(bro, F.buttonFar); await tap('ArrowUp'); check('ferry sent over', game.ferry.moving < 0);
    check('ferry at the near side', (await until(() => !game.ferry.moving, 12000)) && game.ferry.side === 'near');
    await goTo(sis, F.canal[0] + 100); await tap('ArrowUp');
    check('ferry brings sister', (await until(() => !game.ferry.moving, 12000)) && game.ferry.side === 'far');
    await both(R2, () => sis.x > 6300 && bro.x > 6300, 8000);
    check('canal crossed', sis.x > F.canal[1] && bro.x > F.canal[1]);
    // 5. Fountain Square: nothing has to be done here, but there are two stickers
    await goTo(bro, SQUARE.splash, 15000); await tap('ArrowUp');
    check('boost: sticker on the fountain', await boost(SQUARE.fountain, () => game.stickers.has('drop')));
    await goTo(sis, SQUARE.striker, 8000);
    for (let n = 0; n < 5 && !game.stickers.has('bell'); n++) {
      await until(() => game.striker.phase === 'idle', 4000); await tap('KeyW');
      let before = 0; await until(() => { const k = game.striker, rising = k.pos > before; before = k.pos; return k.phase === 'aim' && rising && k.pos > 0.9; }, 5000);
      await tap('KeyW'); await until(() => game.striker.phase === 'idle', 4000);
    }
    check('bell rung (sticker)', game.stickers.has('bell'));
    // 6. The metro: play a duet, take a wrong train on purpose (to the end of the line), then Blue line to Central, Green line to Old Town
    await goBoth(METRO.entrance - 20, METRO.entrance + 40, 12000); await tap('ArrowDown');
    check('down into the metro', inMetro() && game.metro.station === METRO.start);
    await goBoth(METRO.piano - 40, METRO.piano + 40, 10000);
    for (let n = 0; n < 4; n++) { await tap('KeyW'); await tap('ArrowUp'); }
    check('piano duet (sticker)', game.stickers.has('note'));
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
    check('Blue line back to Central', (await ride('Blue', 1, 'Central')) === 'Central');
    check('Green line to Old Town', (await ride('Green', 1, 'Old Town')) === METRO.goal);
    await goTo(sis, METRO.stairs + 20); await tap('KeyW');
    check('up into Old Town', sis.plane === 'street' && bro.plane === 'street' && sis.x > METRO.closed[1]);
    // 7a. Old Town, the picture game: one wrong answer on purpose, then three right rounds win the first ticket
    const O = OLDTOWN, es = game.easel;
    await goTo(sis, O.board, 8000); await tap('KeyW');
    check('picture game started', es.phase === 'show');
    let triedWrong = false;
    for (let n = 0; n < 8 && !es.won; n++) {
      await until(() => es.phase === 'pick' || es.won, 9000); if (es.won) break;
      const swap = !triedWrong; triedWrong = true;
      await goBoth(O.easels[es.want[swap ? 1 : 0]], O.easels[es.want[swap ? 0 : 1]], 8000); await tap('KeyW'); await tap('ArrowUp');
      await until(() => es.phase === 'wrong' || es.phase === 'right' || es.won, 3000);
      if (swap) check('wrong paintings: they are shown again', es.phase === 'wrong');
    }
    check('picture game won: first ticket', es.won && game.tickets === 1);
    // 7b. The ladder on wheels: one cannot push it; together they push it past the water jets
    const ct = game.cart, soaksBefore = game.soaks;
    await goTo(sis, ct.x - 50, 8000); await holdUntil('KeyD', () => false, 700);
    check('too heavy for one', ct.x === O.cartStart);
    { // both walk and push whenever the next jet leaves enough time to get through it
      const t0 = performance.now();
      while (!ct.docked && performance.now() - t0 < 90000) {
        const back = Math.min(sis.x, bro.x), front = Math.max(sis.x, bro.x), i = O.jets.findIndex((jx) => jx + 44 > back);
        const near = i >= 0 && front > O.jets[i] - 44 - 25, inside = i >= 0 && back > O.jets[i] - 44;
        const go = !near || (inside ? jetSafe(i) > 0.15 : jetSafe(i) > 1.7);
        R2.forEach((c) => key(c, go)); await wait(16);
      }
      R2.forEach((c) => key(c, false));
    }
    check('ladder pushed to the cafe', ct.docked);
    log('soaked by the jets: ' + (game.soaks - soaksBefore));
    await both(R2, () => sis.x > O.dock + 20 && bro.x > O.dock + 20, 5000);
    // 7c. The parasols: he winds each one open, she steps across them to the second ticket
    await goTo(bro, O.dock - 6, 5000); await tap('ArrowUp'); check('brother cannot reach from the ladder', bro.plane === 'street');
    await goTo(sis, O.dock - 6, 5000); await tap('KeyW'); check('no parasol open: nothing to step onto', sis.plane === 'street');
    for (let i = 0; i < O.parasols.length; i++) {
      await goTo(bro, O.parasols[i], 6000); key('ArrowUp', true);
      check('parasol ' + (i + 1) + ' wound open', await until(() => game.para.open[i] > 0.95, 4000));
      if (i === 0) { await tap('KeyW'); check('sister on the first parasol', sis.plane === 'tops'); } else check('sister steps to parasol ' + (i + 1), await goTo(sis, O.parasols[i], 6000));
      key('ArrowUp', false); await wait(1600);
      check('it stays open under her', game.para.open[i] === 1 && (i === 0 || game.para.open[i - 1] < 0.5));
    }
    await goTo(sis, O.parasols[2] + 70, 4000); await tap('KeyW');
    check('second ticket', game.tickets === 2 && game.para.got);
    await tap('KeyS'); check('sister back on the street', sis.plane === 'street');
    // 7d. The bus: ask for a wrong number on purpose, then the right one
    const right = game.routes.findIndex((r) => r.place === 0), wrong = (right + 1) % game.routes.length;
    const takeBus = async (want) => {
      await goBoth(BUS.dial, BUS.dial - 60, 15000);
      for (let n = 0; n < 8 && game.bus.want !== want; n++) await tap('KeyW');
      if (!(await until(() => game.bus.state === 'waiting' && game.bus.cur === want, 20000))) return false;
      await goBoth(BUS.stop + 30, BUS.stop - 40, 8000); await tap('KeyW'); await tap('ArrowUp'); return game.bus.riders.length === 2;
    };
    check('wrong bus boarded', await takeBus(wrong));
    check('wrong bus brings them back', (await until(() => game.fade, 15000)) && (await until(() => !game.fade && sis.plane === 'street', 10000)));
    check('right bus boarded', await takeBus(right));
    check('bus ride to the Old Bridge', (await until(() => game.bus.arrived, 30000)) && sis.plane === 'street' && sis.x > 10500);
    // 8. The Old Bridge: power (sister), the picture code in the hut (brother), then lever and brake together
    await goTo(bro, BRIDGE.power); await tap('ArrowUp'); check('brother cannot reach the switch', !game.bridge.power);
    await goTo(sis, BRIDGE.power); await tap('KeyW');
    check('power on', game.bridge.power);
    await goTo(bro, BRIDGE.hut - 48); await tap('ArrowDown');
    check('brother in the hut', bro.plane === 'hut');
    const br = game.bridge;
    for (let i = 0; i < 4; i++) { for (let n = 0; n < 6 && br.sel !== i; n++) await tap('ArrowRight'); for (let n = 0; n < 9 && br.dial[i] !== game.stamps[i]; n++) await tap('ArrowUp'); }
    check('code set from the map pictures', br.solved);
    key('ArrowUp', true);
    check('the brake catches the bridge halfway', await until(() => br.jammed, 8000));
    await wait(800); check('the lever alone does not free it', br.jammed && !br.down);
    key('KeyW', true); check('lever and brake together free it', await until(() => !br.jammed, 4000)); key('KeyW', false);
    check('bridge lowered', await until(() => br.down, 10000)); key('ArrowUp', false);
    check('all eight stickers', game.stickers.size === STICKERS.length);
    check('into Forest Park', await both(R2, () => game.exitT >= 0, 20000));
    check('chapter complete', await until(() => game.done, 5000));
    log(`bumps by cars: ${hits}   game time: ${game.time.toFixed(0)} s (${(game.time / 60).toFixed(1)} min)   stickers: ${game.stickers.size}`);
    log('PLAY PASSED');
  } catch (e) { log('PLAY FAILED ' + e.message); }
  clearInterval(stunWatch);
})();
