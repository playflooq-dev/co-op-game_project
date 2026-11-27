// Checks the chapter flow: what index.html opens, what the map shows and where its stops lead, with nothing saved,
// part-way through a level, after each level, and after the whole chapter; a save from before the house was added;
// the test options (?unlock=all, ?level=...); and that the save copes with a browser that will not store anything.
// Run python tools/dev_server.py 8780 log.txt and open
// http://127.0.0.1:8780/tools/playtest-chapter.html : the last line of log.txt says PLAY PASSED or PLAY FAILED.
// (Each level's own play-through checks that finishing it is saved: tools/playtest-house, -park, -city and -canal.)
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
  const open5 = () => win().eval('[0, 1, 2, 3, 4].map(playable).map(Number).join("")'); // which of the five stops can be played: the house, the park, the city, the canal, the forest
  const key = async (code) => { const w = win(); w.dispatchEvent(new w.KeyboardEvent('keydown', { code })); await wait(90); w.dispatchEvent(new w.KeyboardEvent('keyup', { code })); await wait(90); };
  const tap = async (i) => { const w = win(), s = w.eval('stops()')[i], k = w.eval('S / DPR'); w.document.getElementById('c').dispatchEvent(new w.PointerEvent('pointerdown', { clientX: s.x * k, clientY: s.y * k, bubbles: true })); await wait(120); };
  const saved = () => localStorage.getItem(CHAPTER.KEY), save = (v) => localStorage.setItem(CHAPTER.KEY, JSON.stringify(v));
  const L = CHAPTER.LEVELS, HOUSE = 0, PARK = 1, CITY = 2, CANAL = 3, FOREST = 4;
  try {
    check('the levels, in order: the house, the park, the city, the canal', L.map((l) => l.id).join(',') === 'house,park,city,canal');
    // ---------- 1. nothing saved: the very first visit
    CHAPTER.reset();
    check('with nothing saved, no game has been started and the next level is the house', !CHAPTER.started() && CHAPTER.next().id === 'house' && !CHAPTER.done('house'));
    await open('../index.html'); check('index.html opens the house the first time', await until(() => page() === 'house.html'), page());
    await open('../index.html?section=3'); check('index.html?section=3 still opens that section of the park', await until(() => page() === 'park.html?section=3'), page());
    CHAPTER.reset(); // (the park in the frame noted that somebody reached section 3)
    check('the map with nothing saved: only the house can be played', (await map('../map.html')) && open5() === '10000' && M().next === HOUSE && M().sel === HOUSE && M().mode === 'idle' && !M().done.some(Boolean), open5());
    await tap(PARK); await tap(CITY); await tap(CANAL); await wait(300); check('tapping a stop with a padlock does nothing', page() === 'map.html' && M().going === null);
    await key('ArrowRight'); check('nor can a later stop be chosen with the keys', M().sel === HOUSE);
    check('nothing has been saved by looking at the map', saved() === null, saved());
    await key('Enter'); check('jump on the map starts the house', await until(() => page() === 'house.html'), page());
    // ---------- 2. the house finished (its end card, by the shortcut house.html?stage=end), and on down the chain
    CHAPTER.reset(); await open('../house.html?stage=end');
    check('when the house\'s end card comes up, the house is saved as finished', await until(() => CHAPTER.done('house'), 30000), saved());
    check('and the next level is the park', CHAPTER.next().id === 'park');
    await wait(400); await key('Enter');
    check('jump on the end card goes back to the map', await until(() => page() === 'map.html?from=house', 8000), page());
    check('coming from the house, the map shows its tick and the siblings set off', (await until(() => win().eval('typeof MAP !== "undefined" && typeof sibs !== "undefined"'), 15000)) && M().done[HOUSE] && !M().done[PARK] && M().pop === HOUSE);
    check('they walk on to the park, which is now the one to play', (await until(() => M().mode === 'idle' && Math.abs(M().pos - PARK) < 0.01, 9000)) && M().sel === PARK && M().next === PARK && open5() === '11000', open5());
    await key('ArrowLeft'); check('left chooses the finished house again', M().sel === HOUSE);
    await key('Enter'); check('and jump plays it again', await until(() => page() === 'house.html'), page());
    await map('../map.html'); await tap(CITY); await tap(CANAL); await wait(250); check('the city and the canal still have their padlocks', page() === 'map.html' && M().going === null);
    await tap(PARK); check('a tap on the park starts Level 1', await until(() => page() === 'park.html'), page());
    // stopped in the middle of the park
    CHAPTER.note('park', 2); CHAPTER.note('park', 1);
    check('stopping part-way is remembered, and the furthest point counts', CHAPTER.started() && CHAPTER.state().at.park === 2 && CHAPTER.address(L[PARK]) === 'park.html?section=3');
    await open('../index.html'); check('index.html now opens the chapter map', await until(() => page() === 'map.html'), page());
    await until(() => win().eval('typeof MAP !== "undefined" && typeof sibs !== "undefined"'), 15000); await wait(500); await key('Enter');
    check('jump on the map goes on where they stopped', await until(() => page() === 'park.html?section=3'), page());
    // the park finished
    CHAPTER.mark('park');
    check('finishing the park is saved, and the next level is the city', CHAPTER.done('park') && CHAPTER.next().id === 'city' && CHAPTER.state().at.park === undefined);
    check('coming from the park, the map shows its tick and the siblings set off', (await map('../map.html?from=park')) && M().mode === 'arrive' && M().done[PARK] && !M().done[CITY] && M().pop === PARK);
    check('they walk on to the city, which is now the one to play', (await until(() => M().mode === 'idle' && Math.abs(M().pos - CITY) < 0.01, 9000)) && M().sel === CITY && M().next === CITY && open5() === '11100', open5());
    await key('ArrowLeft'); check('left chooses the finished park again', M().sel === PARK);
    await key('Enter'); check('and jump plays it again, from its start', await until(() => page() === 'park.html'), page());
    await map('../map.html'); await tap(CANAL); await wait(250); check('the canal still has its padlock', page() === 'map.html' && M().going === null);
    await tap(CITY); check('a tap on the city starts Level 2', await until(() => page() === 'city.html'), page());
    // stopped in the city, then the city finished
    CHAPTER.note('city', 4); check('part-way through the city', CHAPTER.address(L[CITY]) === 'city.html?station=4');
    CHAPTER.mark('city');
    check('coming from the city, they walk on to the canal', (await map('../map.html?from=city')) && (await until(() => M().mode === 'idle' && Math.abs(M().pos - CANAL) < 0.01, 9000)) && M().sel === CANAL && M().done[CITY] && open5() === '11110', open5());
    await key('Enter'); check('jump starts Level 3, the canal', await until(() => page() === 'canal.html'), page());
    await map('../map.html'); await tap(PARK); check('a tap on a finished stop plays it again', await until(() => page() === 'park.html'), page());
    // the canal finished: the end of the chapter
    CHAPTER.mark('canal');
    check('all four finished: nothing is next, and the ending has not been shown yet', CHAPTER.next() === null && !CHAPTER.ended());
    check('coming from the canal, its tick pops and then the chapter card comes up', (await map('../map.html?from=canal')) && (await until(() => M().mode === 'card', 6000)) && M().confetti.length > 0 && M().tease === 0);
    await wait(1500); await key('Enter');
    check('jump goes on from the card: the mist lifts from the forest', (await until(() => M().mode === 'tease' || M().tease > 0, 3000)) && (await until(() => M().tease >= 1 && M().mode === 'idle', 9000)) && CHAPTER.ended());
    await tap(FOREST); await wait(250); check('the forest has a padlock: Chapter 2 cannot be played yet', page() === 'map.html?from=canal' && M().going === null && open5() === '11110', open5());
    check('the next visit shows the map with the forest, without the card again', (await map('../map.html')) && M().mode === 'idle' && M().tease === 1 && M().done.every(Boolean));
    await key('ArrowLeft'); await key('ArrowLeft'); await key('ArrowLeft'); await key('Enter'); check('any level can be played again from the map', await until(() => page() === 'house.html'), page());
    await open('../index.html'); check('index.html opens the map once the chapter is finished', await until(() => page() === 'map.html'), page());

    // ---------- 3. a save from before the house was added (2026-11-27): nobody is sent back
    save({ done: { park: true, city: true, canal: true }, at: {}, ended: true }); let before = saved();
    check('an older save with Chapter 1 finished: nothing is next', CHAPTER.next() === null && CHAPTER.started());
    check('its map: the park, the city and the canal still have their ticks, and no card comes up again', (await map('../map.html')) && M().mode === 'idle' && M().tease === 1 && M().done.map(Number).join('') === '0111', M().done.map(Number).join(''));
    check('and the house can be played (no padlock), without being marked finished', open5() === '11110' && !M().done[HOUSE] && M().sel === CANAL, open5());
    check('looking at the map did not change that save', saved() === before, saved());
    await open('../index.html'); check('index.html opens the map for that save, not the house', await until(() => page() === 'map.html'), page());
    await map('../map.html'); await tap(HOUSE); check('a tap on the house plays it', await until(() => page() === 'house.html'), page());
    save({ done: { park: true }, at: { city: 3 }, ended: false });
    check('an older save with only the park finished: the city is still next, and the house is open', CHAPTER.next().id === 'city' && (await map('../map.html')) && M().next === CITY && M().sel === CITY && open5() === '11100' && !M().done[HOUSE], open5());
    await key('Enter'); check('and jump goes on in the city where they stopped', await until(() => page() === 'city.html?station=3'), page());
    save({ done: {}, at: { park: 2 }, ended: false });
    check('an older save stopped in the middle of the park: the park is still next, and the house is open', CHAPTER.next().id === 'park' && (await map('../map.html')) && M().next === PARK && open5() === '11000', open5());
    save({ done: { park: true, city: true, canal: true }, at: {}, ended: true }); await open('../house.html?stage=end'); await until(() => CHAPTER.done('house'), 30000); await wait(400); await key('Enter');
    check('finishing the house with an older, finished save: its tick, no card again, and everything still finished', (await until(() => page() === 'map.html?from=house', 8000)) && (await until(() => win().eval('typeof MAP !== "undefined" && MAP.mode === "idle"'), 20000)) && M().done.every(Boolean) && M().tease === 1 && CHAPTER.ended(), saved());

    // ---------- 4. the test view: map.html?unlock=all
    save({ done: { house: true }, at: { park: 2 }, ended: false }); before = saved();
    check('?unlock=all: every level can be played, and the forest stays locked', (await map('../map.html?unlock=all')) && win().eval('UNLOCK') === true && open5() === '11110' && M().mode === 'idle', open5());
    check('the ticks are still only on what was really finished', M().done.map(Number).join('') === '1000' && M().next === PARK);
    await key('ArrowRight'); await key('ArrowRight'); check('any level can be chosen with the keys', M().sel === CANAL);
    await tap(FOREST); await wait(250); check('a tap on the forest does nothing', page() === 'map.html?unlock=all' && M().going === null);
    await wait(600); check('the test view saved nothing: the save is the same as before', saved() === before, saved());
    await tap(CANAL); check('a tap on a level that is not finished plays it straight away', await until(() => page() === 'canal.html'), page());
    save({ done: { house: true }, at: { park: 2 }, ended: false }); await map('../map.html?unlock=all'); await tap(PARK);
    check('in the test view a level starts from its beginning', await until(() => page() === 'park.html'), page());
    save({ done: { house: true, park: true, city: true, canal: true }, at: {}, ended: false }); before = saved();
    check('the test view does not play or record the chapter\'s ending', (await map('../map.html?unlock=all&from=canal')) && (await until(() => M().mode === 'idle', 9000)) && M().tease === 0 && (await wait(1200), true) && M().mode === 'idle' && saved() === before, saved());
    check('without ?unlock=all the same save shows the ending as usual', (await map('../map.html')) && M().mode === 'card' && win().eval('UNLOCK') === false);
    CHAPTER.reset(); await open('../index.html?unlock=all'); check('index.html?unlock=all opens the test view of the map', await until(() => page() === 'map.html?unlock=all'), page());
    check('with nothing saved, the test view still opens every level', (await until(() => win().eval('typeof MAP !== "undefined" && typeof sibs !== "undefined"'), 15000)) && open5() === '11110' && saved() === null, open5() + ' ' + saved());

    // ---------- 5. the test links: index.html?level=...
    for (const [name, want] of [['house', 'house.html'], ['park', 'park.html'], ['seesaw', 'city.html'], ['canal', 'canal.html'], ['city', 'city.html'], ['canal&section=4', 'canal.html?section=4'], ['nowhere', 'map.html']]) {
      CHAPTER.reset(); await open('../index.html?level=' + name); check(`index.html?level=${name} opens ${want}`, await until(() => page() === want), page());
    }

    // ---------- a browser that will not store anything
    const keep = Storage.prototype.setItem, keepGet = Storage.prototype.getItem;
    Storage.prototype.setItem = () => { throw new Error('no storage'); }; Storage.prototype.getItem = () => { throw new Error('no storage'); };
    let threw = false, fresh = false; try { CHAPTER.mark('park'); CHAPTER.note('city', 2); CHAPTER.ended(true); fresh = !CHAPTER.started() && CHAPTER.next().id === 'house' && CHAPTER.address(L[HOUSE]) === 'house.html'; } catch (e) { threw = true; }
    Storage.prototype.setItem = keep; Storage.prototype.getItem = keepGet;
    check('when the browser refuses to store anything, nothing breaks: the game just starts from the beginning', !threw && fresh);
    CHAPTER.reset(); CHAPTER.mark('house'); CHAPTER.note('park', 1); CHAPTER.ended(false);
    check('only one small entry is kept, with no personal data', Object.keys(JSON.parse(saved())).sort().join(',') === 'at,done,ended', saved());
    await map('../map.html?reset=1'); check('map.html?reset=1 forgets everything', !CHAPTER.started() && M().next === HOUSE && saved() === null);
    log(fails ? `PLAY FAILED ${fails} check${fails > 1 ? 's' : ''}` : 'PLAY PASSED');
  } catch (e) { log('PLAY FAILED ' + (e.stack || e.message)); }
})();
