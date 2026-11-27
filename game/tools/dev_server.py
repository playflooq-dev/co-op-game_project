"""Small local server for working on the game.

Serves the game folder, and lets tools/export.html save the images it paints into each world's assets folder.
Usage: python tools/dev_server.py [port] [log file]
It only listens on this computer (127.0.0.1) and only writes inside worlds/<world>/assets/ and shared/characters/.
"""
import http.server
import os
import sys
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8780
LOG = sys.argv[2] if len(sys.argv) > 2 else None


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def log_message(self, *a):
        pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_POST(self):
        url = urllib.parse.urlparse(self.path)
        body = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        if url.path == '/log':  # test pages report results here
            if LOG:
                with open(LOG, 'ab') as f:
                    f.write(body + b'\n')
        elif url.path == '/save':
            rel = urllib.parse.parse_qs(url.query).get('path', [''])[0]
            dest = os.path.normpath(os.path.join(ROOT, rel))
            parts = os.path.relpath(dest, ROOT).split(os.sep)
            ok = (len(parts) >= 4 and parts[0] == 'worlds' and parts[2] == 'assets' and '..' not in parts) or                  (len(parts) == 3 and parts[:2] == ['shared', 'characters'] and parts[2].endswith('.png'))
            if not ok:
                self.send_error(403, 'can only save inside worlds/<world>/assets/ or shared/characters/')
                return
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with open(dest, 'wb') as f:
                f.write(body)
        else:
            self.send_error(404)
            return
        self.send_response(200)
        self.send_header('Content-Length', '0')
        self.end_headers()


class Server(http.server.ThreadingHTTPServer):
    # A test page that opens one level right after another asks for dozens of files at once. The usual queue of 5
    # waiting connections is too short for that on Windows: now and then one was refused, and a page never finished
    # loading (seen on 2026-11-27 as a chapter test that failed once in six runs).
    request_queue_size = 128
    daemon_threads = True


if __name__ == '__main__':
    print(f'Serving {ROOT} at http://127.0.0.1:{PORT}/', flush=True)
    Server(('127.0.0.1', PORT), Handler).serve_forever()
