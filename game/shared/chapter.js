'use strict';
// Chapter 1: the levels in the order they are played, and what the browser remembers about them.
// Each level's page loads this file; so do the chapter map (map.html, shared/chaptermap.js) and index.html.
//   CHAPTER.LEVELS          the levels, in order: { id, page, icon, names, resume(n) }
//   CHAPTER.mark(id)        a level has been finished (called when its end card comes up)
//   CHAPTER.note(id, n)     the furthest part of a level reached so far (its section or station number, from 0),
//                           so that players who stop in the middle go on from there
//   CHAPTER.done(id)        has it been finished?          CHAPTER.state()   everything, for the map
//   CHAPTER.next()          the level to play next, or null when the chapter is complete
//   CHAPTER.find(name)      the level called that in an address (index.html?level=seesaw), or null
//   CHAPTER.address(level)  the page to open for a level: from the start, or from where they stopped
//   CHAPTER.reset()         forget everything (map.html?reset=1 does this, for testing)
// What is kept is only this, under one name in the browser's own storage (localStorage) on this device: which of the
// levels are finished, how far into an unfinished one they got, and whether the chapter's ending has been shown.
// No names, no accounts, nothing is sent anywhere. If the browser will not store anything (private windows, some
// settings), every call still works and the game simply starts from the beginning next time.
const CHAPTER = (() => {
  const KEY = 'treasure-hunt-chapter-1';
  const LEVELS = [
    // The house was put in front of the park on 2026-11-27. Saves made before that have the park finished and no
    // house: `added` says such a save is not sent back to it (the house is there to play, but it is not "next").
    // The same goes for a save that stopped part-way through the park.
    { id: 'house', page: 'house.html', icon: 'house', names: ['house', 'home'], added: true, resume: () => '' },                    // the opening: the house, "Home Alone"
    { id: 'park', page: 'park.html', icon: 'tree', names: ['park'], resume: (n) => '?section=' + (n + 1) },                         // Level 1: the park
    { id: 'city', page: 'city.html', icon: 'seesaw', names: ['seesaw', 'see-saw', 'city'], resume: (n) => '?station=' + n },        // Level 2: the see-saw level (the city, to the Old Bridge)
    { id: 'canal', page: 'canal.html', icon: 'boat', names: ['canal'], resume: (n) => '?section=' + (n + 1) },                      // Level 3: the canal
  ];
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } };
  const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const state = () => { const v = read(); return { done: Object.assign({}, v.done), at: Object.assign({}, v.at), ended: !!v.ended }; };
  const done = (id) => !!state().done[id];
  const passed = (v, i) => !!v.done[LEVELS[i].id] || (LEVELS[i].added && LEVELS.slice(i + 1).some((l) => v.done[l.id] || v.at[l.id] > 0)); // finished, or put in later behind a save that is already past it (a later level finished, or stopped part-way)
  return { KEY, LEVELS, state, done,
    mark(id) { const v = state(); v.done[id] = true; delete v.at[id]; write(v); },
    note(id, n) { const v = state(); if (v.done[id] || v.at[id] >= n) return; v.at[id] = n; write(v); },
    ended(yes) { const v = state(); if (yes === undefined) return v.ended; v.ended = !!yes; write(v); return v.ended; },
    next() { const v = state(); return LEVELS.find((l, i) => !passed(v, i)) || null; },
    started() { const v = state(); return LEVELS.some((l) => v.done[l.id] || v.at[l.id] > 0); },
    find(name) { const n = String(name || '').toLowerCase(); return LEVELS.find((l) => l.id === n || l.names.includes(n)) || null; },
    address(l, fresh) { const v = state(), n = v.at[l.id]; return l.page + (!fresh && !v.done[l.id] && n > 0 ? l.resume(n) : ''); },
    reset() { try { localStorage.removeItem(KEY); } catch (e) { /* nothing stored: nothing to forget */ } },
  };
})();
