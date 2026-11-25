// Checks the chapter flow: what index.html opens, what the map shows and where its stops lead, with nothing saved,
// part-way through a level, after each level, and after the whole chapter; and that the save copes with a browser
// that will not store anything. Run python tools/dev_server.py 8780 log.txt and open
// http://127.0.0.1:8780/tools/playtest-chapter.html : the last line of log.txt says PLAY PASSED or PLAY FAILED.
// (Each level's own play-through checks that finishing it is saved: tools/playtest-park, -city and -canal.)
(async () => {
  let sent = Promise.resolve(), fails = 0;
  const log = (t) => (sent = sent.then(() => fetch('/log', { method: 'POST', body: t }).catch(() => {})));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const check = (name, ok, info = '') => { if (!ok) fails++; log(`${ok ? 'ok  ' : 'FAIL'} ${name}${info ? '   [' + info + ']' : ''}`); return ok; };
  const until = async (cond, max = 8000) => { const t0 = performance.now(); while (performance.now() - t0 < max) { try { if (cond()) return true; } catch (e) { /* the frame is between pages */ } await wait(40); } return false; };
  let frame = null;
  const open = async (url) => { if (frame) frame.remove(); frame = document.createElement('iframe'); frame.src = url; document.body.appendChild(frame); await new Promise((r) => { frame.onload = r; }); return frame; };
  const win = () => frame.contentWindow, page = () => win().location.pathname.split('/').pop() + win().location.search;
  const map = async (url) => { await open(url); return until(() => win().eval('typeof MAP !== "undefined" && typeof sibs !== "undefined" && !!SP.trees && SP.trees.length > 0'), 15000); };
  const M = () => win().eval('MAP'); // (the map's state is a script-level const of that page, so it is asked for by name)
  const key = async (code) => { const w = win(); w.dispatchEvent(new w.KeyboardEvent('keydown', { code })); await wait(90); w.dispatchEvent(new w.KeyboardEvent('keyup', { code })); await wait(90); };
  const tap = async (i) => { const w = win(), s = w.eval('stops()')[i], k = w.eval('S / DPR'); w.document.getElementById('c').dispatchEvent(new w.PointerEvent('pointerdown', { clientX: s.x * k, clientY: s.y * k, bubbles: true })); await wait(120); };
  const L = CHAPTER.LEVELS;
  try {
    // ---------- nothing saved: the very first visit
    CHAPTER.reset();
    check('with nothing saved, no game has been started and the next level is the park', !CHAPTER.started() && CHAPTER.next().id === 'park' && !CHAPTER.done('park'));
    await open('../index.html'); check('index.html opens Level 1 the first time', await until(() => page() === 'park.html'), page());
    await open('../index.html?section=3'); check('index.html?section=3 still opens that section of the park', await until(() => page() === 'park.html?section=3'), page());
    CHAPTER.reset(); // (the park in the frame noted that somebody reached section 3)
    check('the map with nothing saved: only the park can be played', (await map('../map.html')) && M().next === 0 && M().sel === 0 && M().mode === 'idle' && !M().done.some(Boolean));
    await tap(1); await tap(2); await wait(300); check('tapping a stop with a padlock does nothing', page() === 'map.html' && M().going === null);
    await key('ArrowRight'); check('nor can a later stop be chosen with the keys', M().sel === 0);
    // ---------- stopped in the middle of the park
    CHAPTER.note('park', 2); CHAPTER.note('park', 1);
    check('stopping part-way is remembered, and the furthest point counts', CHAPTER.started() && CHAPTER.state().at.park === 2 && CHAPTER.address(L[0]) === 'park.html?section=3');
    await open('../index.html'); check('index.html now opens the chapter map', await until(() => page() === 'map.html'), page());
    await until(() => win().eval('typeof MAP !== "undefined" && typeof sibs !== "undefined"'), 15000); await wait(500); await key('Enter');
    check('jump on the map goes on where they stopped', await until(() => page() === 'park.html?section=3'), page());
    // ---------- the park finished
    CHAPTER.mark('park');
    check('finishing the park is saved, and the next level is the city', CHAPTER.done('park') && CHAPTER.next().id === 'city' && CHAPTER.state().at.park === undefined);
    check('coming from the park, the map shows its tick and the siblings set off', (await map('../map.html?from=park')) && M().mode === 'arrive' && M().done[0] && !M().done[1] && M().pop === 0);
    check('they walk on to the second stop, which is now the one to play', (await until(() => M().mode === 'idle' && Math.abs(M().pos - 1) < 0.01, 9000)) && M().sel === 1 && M().next === 1);
    await key('ArrowLeft'); check('left chooses the finished park again', M().sel === 0);
    await key('Enter'); check('and jump plays it again, from its start', await until(() => page() === 'park.html'), page());
    await map('../map.html'); await tap(2); await wait(250); check('the canal still has its padlock', page() === 'map.html' && M().going === null);
    await tap(1); check('a tap on the second stop starts Level 2, the city', await until(() => page() === 'city.html'), page());
    // ---------- stopped in the city, then the city finished
    CHAPTER.note('city', 4); check('part-way through the city', CHAPTER.address(L[1]) === 'city.html?station=4');
    CHAPTER.mark('city');
    check('coming from the city, they walk on to the canal', (await map('../map.html?from=city')) && (await until(() => M().mode === 'idle' && Math.abs(M().pos - 2) < 0.01, 9000)) && M().sel === 2 && M().done[1]);
    await key('Enter'); check('jump starts Level 3, the canal', await until(() => page() === 'canal.html'), page());
    await map('../map.html'); await tap(0); check('a tap on a finished stop plays it again', await until(() => page() === 'park.html'), page());
    // ---------- the canal finished: the end of the chapter
    CHAPTER.mark('canal');
    check('all three finished: nothing is next, and the ending has not been shown yet', CHAPTER.next() === null && !CHAPTER.ended());
    check('coming from the canal, its tick pops and then the chapter card comes up', (await map('../map.html?from=canal')) && (await until(() => M().mode === 'card', 6000)) && M().confetti.length > 0 && M().tease === 0);
    await wait(1500); await key('Enter');
    check('jump goes on from the card: the mist lifts from the forest', (await until(() => M().mode === 'tease' || M().tease > 0, 3000)) && (await until(() => M().tease >= 1 && M().mode === 'idle', 9000)) && CHAPTER.ended());
    await tap(3); await wait(250); check('the forest has a padlock: Chapter 2 cannot be played yet', page() === 'map.html?from=canal' && M().going === null);
    check('the next visit shows the map with the forest, without the card again', (await map('../map.html')) && M().mode === 'idle' && M().tease === 1 && M().done.every(Boolean));
    await key('ArrowLeft'); await key('ArrowLeft'); await key('Enter'); check('any level can be played again from the map', await until(() => page() === 'park.html'), page());
    await open('../index.html'); check('index.html opens the map once the chapter is finished', await until(() => page() === 'map.html'), page());
    // ---------- a browser that will not store anything
    const keep = Storage.prototype.setItem, keepGet = Storage.prototype.getItem;
    Storage.prototype.setItem = () => { throw new Error('no storage'); }; Storage.prototype.getItem = () => { throw new Error('no storage'); };
    let threw = false, fresh = false; try { CHAPTER.mark('park'); CHAPTER.note('city', 2); CHAPTER.ended(true); fresh = !CHAPTER.started() && CHAPTER.next().id === 'park' && CHAPTER.address(L[0]) === 'park.html'; } catch (e) { threw = true; }
    Storage.prototype.setItem = keep; Storage.prototype.getItem = keepGet;
    check('when the browser refuses to store anything, nothing breaks: the game just starts from the beginning', !threw && fresh);
    check('only one small entry is kept, with no personal data', Object.keys(JSON.parse(localStorage.getItem(CHAPTER.KEY))).sort().join(',') === 'at,done,ended', localStorage.getItem(CHAPTER.KEY));
    await map('../map.html?reset=1'); check('map.html?reset=1 forgets everything', !CHAPTER.started() && M().next === 0);
    log(fails ? `PLAY FAILED ${fails} check${fails > 1 ? 's' : ''}` : 'PLAY PASSED');
  } catch (e) { log('PLAY FAILED ' + (e.stack || e.message)); }
})();
