"""Measures every sound in sounds/ (ffmpeg is not installed, so the browser decodes them): its length, how loud it is,
where the sound really starts and ends, and whether it is (nearly) silent. Writes sound-analysis.json, which
tools/build.py uses so that the page plays each sound trimmed and at an even loudness. The files are not changed.

From the sfx-lab folder:   python tools/analyze.py
It starts a small server on this computer only (127.0.0.1), opens the measuring page in a headless Edge or Chrome, and
waits for the result.
"""
import http.server
import json
import os
import shutil
import subprocess
import sys
import tempfile
import threading
import time

LAB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(LAB, 'sound-analysis.json')
PORT = 8791
BROWSERS = [r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', r'C:\Program Files\Google\Chrome\Application\chrome.exe']

PAGE = """<!doctype html><meta charset="utf-8"><script>
(async () => {
  const files = %s, out = {}, ac = new OfflineAudioContext(1, 44100, 44100);
  for (const f of files) {
    try {
      const buf = await ac.decodeAudioData(await (await fetch(f)).arrayBuffer());
      const d = buf.getChannelData(0), n = d.length, sr = buf.sampleRate, win = Math.round(sr * 0.01);
      let peak = 0; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(d[i]));
      // loudness of each 10 ms window; the sound starts at the first window above -45 dB of full scale and ends at the last
      const rms = []; for (let i = 0; i < n; i += win) { let s = 0, m = Math.min(n, i + win); for (let j = i; j < m; j++) s += d[j] * d[j]; rms.push(Math.sqrt(s / (m - i))); }
      const thr = 0.0056, first = rms.findIndex((r) => r > thr), last = rms.length - 1 - [...rms].reverse().findIndex((r) => r > thr);
      let sum = 0, cnt = 0; for (let i = Math.max(0, first); i <= last; i++) { sum += rms[i] * rms[i]; cnt++; }
      out[f] = { seconds: +buf.duration.toFixed(3), peak: +peak.toFixed(4), rms: cnt ? +Math.sqrt(sum / cnt).toFixed(4) : 0,
        start: first < 0 ? 0 : Math.max(0, first * 0.01 - 0.02), end: first < 0 ? buf.duration : Math.min(buf.duration, (last + 1) * 0.01 + 0.08), silent: peak < 0.02, quiet: peak < 0.08 };  // (silent: nothing to hear; quiet: below 8 in 100 of full scale, faint)
    } catch (e) { out[f] = { error: String(e) }; }
  }
  await fetch('/done', { method: 'POST', body: JSON.stringify(out) });
})();
</script>"""


def main():
    files = []
    for root, _, names in os.walk(os.path.join(LAB, 'sounds')):
        for n in sorted(names):
            if n.endswith('.mp3'):
                files.append(os.path.relpath(os.path.join(root, n), LAB).replace(os.sep, '/'))
    result = {}

    class H(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **k):
            super().__init__(*a, directory=LAB, **k)

        def log_message(self, *a):
            pass

        def do_GET(self):
            if self.path.startswith('/analyze'):
                body = (PAGE % json.dumps(files)).encode()
                self.send_response(200); self.send_header('Content-Type', 'text/html'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)
            else:
                super().do_GET()

        def do_POST(self):
            result.update(json.loads(self.rfile.read(int(self.headers['Content-Length']))))
            self.send_response(200); self.send_header('Content-Length', '0'); self.end_headers()

    srv = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    exe = next((b for b in BROWSERS if os.path.exists(b)), None)
    if not exe:
        sys.exit('No Edge or Chrome found.')
    prof = tempfile.mkdtemp(prefix='sfx-analyze-')
    br = subprocess.Popen([exe, '--headless=new', '--user-data-dir=' + prof, '--no-first-run', '--mute-audio', f'http://127.0.0.1:{PORT}/analyze'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    t0 = time.time()
    while not result and time.time() - t0 < 300:
        time.sleep(0.5)
    br.kill(); srv.shutdown(); time.sleep(1); shutil.rmtree(prof, ignore_errors=True)
    if not result:
        sys.exit('No result from the browser.')
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=1)
    silent = [k for k, v in result.items() if v.get('silent') or v.get('error')]
    quiet = [k for k, v in result.items() if v.get('quiet') and not v.get('silent')]
    print(f'{len(result)} files measured; silent or unreadable: {silent or "none"}; very quiet: {quiet or "none"}')


if __name__ == '__main__':
    main()
