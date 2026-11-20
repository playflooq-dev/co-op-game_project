// Test helper: after ?snapwait= milliseconds (default 4000), sends a picture of the game canvas to the dev server's /log.
// ?run=<javascript> is run first, once the game has started: it sets up what the picture should show,
// for example run=game.canal.tight=1 . (wait(ms) is available inside it.)
(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  while (typeof players === 'undefined') await wait(50);
  const q = new URLSearchParams(location.search), run = q.get('run');
  if (run) { await wait(600); try { await new Function('wait', 'return (async () => {' + run + '})()')(wait); } catch (e) { fetch('/log', { method: 'POST', body: 'PLAY FAILED run: ' + e.message }); } }
  await wait(+q.get('snapwait') || 4000);
  fetch('/log', { method: 'POST', body: 'SNAP ' + cv.toDataURL('image/png') });
})();
