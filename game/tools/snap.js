// Test helper: after ?snapwait= milliseconds (default 4000), sends a picture of the game canvas to the dev server's /log.
(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  while (typeof players === 'undefined') await wait(50);
  await wait(+new URLSearchParams(location.search).get('snapwait') || 4000);
  fetch('/log', { method: 'POST', body: 'SNAP ' + cv.toDataURL('image/png') });
})();
