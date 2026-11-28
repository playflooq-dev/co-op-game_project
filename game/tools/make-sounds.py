"""Makes new sound effects with ElevenLabs, for listening to before any of them goes into the game.

A tool for whoever works on the game: the game itself never talks to ElevenLabs. It needs
    pip install -r tools/requirements-sounds.txt
and a key in the file .env one folder above game/ (made by `npx -y @elevenlabs/cli@latest onboard init`; the file is
not stored in git). Each sound made uses credits on the ElevenLabs account.

From the game folder:
    python tools/make-sounds.py --list              what would be made (nothing is sent, nothing is spent)
    python tools/make-sounds.py                     three versions of every sound below
    python tools/make-sounds.py splash quack        only these
    python tools/make-sounds.py splash --takes 5    more versions

The files go to tools/_eval/sounds/ (not stored in git), with listen.html there to play the old and the new side by
side: open it through the dev server, http://127.0.0.1:8780/tools/_eval/sounds/listen.html
"""
import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ENV = os.path.join(HERE, '..', '..', '.env')
OUT = os.path.join(HERE, '_eval', 'sounds')
MODEL = 'eleven_text_to_sound_v3'
STYLE = ' Warm, soft, friendly sound for a children\'s storybook puzzle game. No music, no voice, no background noise.'

# name (as the game calls it in sfx('name')): (seconds, description)
SOUNDS = {
    'jump': (0.5, 'A child making one small light jump: a soft springy cloth whoosh.'),
    'step': (0.5, 'One single soft footstep of a small boot on a stone path.'),
    'splash': (1.2, 'A small playful splash of a child hopping into a calm shallow canal.'),
    'pick': (0.6, 'Picking up a small hollow wooden box: a light wooden knock and scrape.'),
    'put': (0.6, 'Setting a small wooden box down on cobblestones: one soft wooden thud.'),
    'rattle': (1.0, 'A small old iron garden gate sliding open with a gentle metal rattle.'),
    'great': (1.4, 'A short happy success chime on glockenspiel and soft bells, rising notes.'),
    'quack': (0.8, 'A friendly little duck quacking twice.'),
}


def load_key():
    """Puts ELEVENLABS_API_KEY from .env into the environment. The key is never printed."""
    if os.environ.get('ELEVENLABS_API_KEY'):
        return True
    try:
        with open(ENV, encoding='utf-8-sig') as f:
            for line in f:
                name, eq, value = line.strip().partition('=')
                if eq and name.replace('export ', '').strip() == 'ELEVENLABS_API_KEY':
                    os.environ['ELEVENLABS_API_KEY'] = value.strip().strip('"\'')
    except OSError:
        pass
    return bool(os.environ.get('ELEVENLABS_API_KEY'))


PAGE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>New sounds</title>
<base href="../../../">
<style>body{margin:0;padding:24px;background:#1c120a;color:#f6ead0;font:18px Georgia,serif}
h2{margin:26px 0 8px}p{margin:4px 0;opacity:.75;font-size:15px}
button{font:16px Georgia,serif;margin:4px 8px 4px 0;padding:12px 18px;border:0;border-radius:12px;background:#7aa84e;color:#1c120a;cursor:pointer}
button.old{background:#e9c98a}</style></head><body>
<h1>New sounds</h1><p>"Now" is what the game plays today. The numbered buttons are the new versions.</p><div id="list"></div>
<script src="shared/sound.js"></script>
<script>
// the sounds the game keeps in other files, copied from them when this page was written, so that "Now" plays them
%s
</script>
<script>
const SOUNDS = %s;
const list = document.getElementById('list');
const button = (box, text, cls, play) => { const b = document.createElement('button'); b.textContent = text; b.className = cls; b.onclick = play; box.appendChild(b); };
for (const s of SOUNDS) {
  const box = document.createElement('div'); list.appendChild(box);
  box.innerHTML = '<h2></h2><p></p>'; box.querySelector('h2').textContent = s.name; box.querySelector('p').textContent = s.text;
  button(box, 'Now', 'old', () => { wakeSound(); setTimeout(() => sfx(s.name), 60); });
  s.files.forEach((f, i) => button(box, 'New ' + (i + 1), '', () => new Audio('tools/_eval/sounds/' + f).play()));
}
</script>
</body></html>
"""


def other_sounds():
    """The sound lines that live outside shared/sound.js, as they are in the game now."""
    def read(path):
        with open(os.path.join(HERE, '..', path), encoding='utf-8') as f:
            return f.read()  # (reading as text turns Windows line endings into plain ones)
    moves = read('shared/movement.js')
    start = moves.index("if (typeof SAMPLES !== 'undefined') Object.assign(SAMPLES, {")
    end = moves.index('});', moves.index('bell:', start)) + 3
    quack = next(line for line in read('worlds/canal/react.js').splitlines() if line.startswith("if (typeof SFX !== 'undefined' && !SFX.quack)"))
    return moves[start:end] + chr(10) + quack


def write_page():
    found = []
    for name, (_, text) in SOUNDS.items():
        files = sorted(f for f in os.listdir(OUT) if f.startswith(name + '-') and f.endswith('.mp3'))
        if files:
            found.append({'name': name, 'text': text, 'files': files})
    with open(os.path.join(OUT, 'listen.html'), 'w', encoding='utf-8') as f:
        f.write(PAGE % (other_sounds(), json.dumps(found)))


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('names', nargs='*', help='which sounds (default: all)')
    p.add_argument('--takes', type=int, default=3, help='versions of each (default 3)')
    p.add_argument('--list', action='store_true', help='show what would be made, and stop')
    a = p.parse_args()
    names = a.names or list(SOUNDS)
    unknown = [n for n in names if n not in SOUNDS]
    if unknown:
        sys.exit('Unknown sound: %s. Known: %s' % (', '.join(unknown), ', '.join(SOUNDS)))
    seconds = sum(SOUNDS[n][0] for n in names) * a.takes
    for n in names:
        print('%-7s %.1f s  x%d  %s' % (n, SOUNDS[n][0], a.takes, SOUNDS[n][1]))
    print('%d files, %.1f seconds of sound' % (len(names) * a.takes, seconds))
    if a.list:
        return
    if not load_key():
        sys.exit('No key. Run: npx -y @elevenlabs/cli@latest onboard init   (in the project folder)')
    from elevenlabs import ElevenLabs  # after the key is in the environment
    client = ElevenLabs()
    os.makedirs(OUT, exist_ok=True)
    for n in names:
        length, text = SOUNDS[n]
        for _ in range(a.takes):
            i = 1
            while os.path.exists(os.path.join(OUT, '%s-%d.mp3' % (n, i))):  # never overwrite an earlier version
                i += 1
            audio = client.text_to_sound_effects.convert(text=text + STYLE, model_id=MODEL, duration_seconds=length, prompt_influence=0.5)
            data = b''.join(audio)
            with open(os.path.join(OUT, '%s-%d.mp3' % (n, i)), 'wb') as f:
                f.write(data)
            print('made %s-%d.mp3 (%d KB)' % (n, i, len(data) // 1024))
            write_page()
    print('Listen: http://127.0.0.1:8780/tools/_eval/sounds/listen.html')


if __name__ == '__main__':
    main()
