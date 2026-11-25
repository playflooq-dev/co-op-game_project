'use strict';
// Chapter 1: three levels in the city, played one after the other, and what the browser remembers about them.
// Each level's page loads this file; so does the chapter map (map.html, shared/chaptermap.js).
//   CHAPTER.LEVELS          the three levels, in order: { id, page, icon, resume(n) }
//   CHAPTER.mark(id)        a level has been finished (called when its end card comes up)
//   CHAPTER.note(id, n)     the furthest part of a level reached so far (its section or station number, from 0),
//                           so that players who stop in the middle go on from there
//   CHAPTER.done(id)        has it been finished?          CHAPTER.state()   everything, for the map
//   CHAPTER.next()          the first level not finished yet, or null when the chapter is complete
//   CHAPTER.address(level)  the page to open for a level: from the start, or from where they stopped
//   CHAPTER.reset()         forget everything (map.html?reset=1 does this, for testing)
// What is kept is only this, under one name in the browser's own storage (localStorage) on this device: which of the
// three levels are finished, how far into an unfinished one they got, and whether the chapter's ending has been shown.
// No names, no accounts, nothing is sent anywhere. If the browser will not store anything (private windows, some
// settings), every call still works and the game simply starts from the beginning next time.
const CHAPTER = (() => {
  const KEY = 'treasure-hunt-chapter-1';
  const LEVELS = [
    { id: 'park', page: 'park.html', icon: 'tree', resume: (n) => '?section=' + (n + 1) },    // Level 1: the park
    { id: 'city', page: 'city.html', icon: 'seesaw', resume: (n) => '?station=' + n },         // Level 2: across the city, to the Old Bridge
    { id: 'canal', page: 'canal.html', icon: 'boat', resume: (n) => '?section=' + (n + 1) },   // Level 3: the canal
  ];
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } };
  const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const state = () => { const v = read(); return { done: Object.assign({}, v.done), at: Object.assign({}, v.at), ended: !!v.ended }; };
  const done = (id) => !!state().done[id];
  return { KEY, LEVELS, state, done,
    mark(id) { const v = state(); v.done[id] = true; delete v.at[id]; write(v); },
    note(id, n) { const v = state(); if (v.done[id] || v.at[id] >= n) return; v.at[id] = n; write(v); },
    ended(yes) { const v = state(); if (yes === undefined) return v.ended; v.ended = !!yes; write(v); return v.ended; },
    next() { const v = state(); return LEVELS.find((l) => !v.done[l.id]) || null; },
    started() { const v = state(); return LEVELS.some((l) => v.done[l.id] || v.at[l.id] > 0); },
    address(l, fresh) { const v = state(), n = v.at[l.id]; return l.page + (!fresh && !v.done[l.id] && n > 0 ? l.resume(n) : ''); },
    reset() { try { localStorage.removeItem(KEY); } catch (e) { /* nothing stored: nothing to forget */ } },
  };
})();
