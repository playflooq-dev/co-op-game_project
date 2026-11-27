// Plays Level 1 start to finish with simulated key presses and reports each step to the dev server.
// Run python tools/dev_server.py 8780 log.txt, open http://127.0.0.1:8780/tools/playtest-house.html?skip=1 and read log.txt: the last line says PLAY PASSED or PLAY FAILED.
(async () => {
  const log = (t) => fetch('/log', { method: 'POST', body: t });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const key = (code, on) => dispatchEvent(new KeyboardEvent(on ? 'keydown' : 'keyup', { code }));
  const tap = async (code) => { key(code, true); await wait(90); key(code, false); await wait(90); };
  const holdUntil = async (code, cond, max = 15000) => { key(code, true); const t0 = performance.now(); while (!cond() && performance.now() - t0 < max) await wait(16); key(code, false); await wait(60); return cond(); };
  while (typeof players === 'undefined' || typeof game === 'undefined') await wait(50);
  try {
    CHAPTER.reset();
    while (game.chapter > 0) await wait(50);
    log(`start sis=${sis.x.toFixed(0)},f${sis.floor} bro=${bro.x.toFixed(0)},f${bro.floor} code=${game.code}`);
    // Brother: into the cupboard, walk to the cord and pull on the light
    await holdUntil('ArrowRight', () => bro.x >= 1450); await tap('ArrowDown');
    log(`bro inside=${bro.inside}`);
    await holdUntil('ArrowLeft', () => Math.abs(bro.x - BULB.x) < 20); await tap('ArrowUp'); await wait(1200);
    log(`bulb=${game.bulb} bro still inside=${bro.inside}`);
    log(`codeSeen=${game.codeSeen} objective="${game.objective}"`);
    await tap('ArrowUp'); log(`bro out=${!bro.inside} x=${bro.x.toFixed(0)}`);
    // Sister: upstairs, take the box
    await holdUntil('KeyD', () => sis.x >= 1110); await tap('KeyW'); await wait(2100);
    log(`sis floor=${sis.floor} x=${sis.x.toFixed(0)}`);
    await holdUntil('KeyD', () => sis.x >= 1700); await tap('KeyW'); await wait(300);
    log(`box=${game.box}`);
    await tap('KeyW'); log(`lock open=${!!game.lock}`);
    for (let i = 0; i < 3; i++) { if (i) await tap('KeyD'); for (let n = 0; n < game.code[i]; n++) await tap('KeyW'); }
    await wait(2300); log(`after lock: box=${game.box} keyHolder=${game.keyHolder} lock=${!!game.lock}`);
    // Sister: downstairs to the door, unlock it
    await holdUntil('KeyA', () => sis.x <= 1575); await tap('KeyS'); await wait(2100);
    log(`sis floor=${sis.floor} x=${sis.x.toFixed(0)}`);
    await holdUntil('KeyD', () => sis.x >= 1745); await tap('KeyW'); await wait(1600);
    log(`doorOpen=${game.doorOpen.toFixed(2)} keyHolder=${game.keyHolder}`);
    // Brother joins her at the door: out they go
    await holdUntil('ArrowRight', () => bro.x >= 1712 || game.exitT >= 0); await wait(3500);
    log(`exitT=${game.exitT.toFixed(2)} done=${game.done}`);
    await wait(300); log(`saved as finished=${CHAPTER.done('house')} next=${CHAPTER.next() && CHAPTER.next().id}`);
    log('PLAY ' + (game.done && CHAPTER.done('house') && CHAPTER.next().id === 'park' ? 'PASSED' : 'FAILED'));
  } catch (e) { log('PLAY FAILED ' + e.stack); }
})();
