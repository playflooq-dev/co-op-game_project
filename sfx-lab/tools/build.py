"""Writes SOUND_LIST.md and sounds.js (what index.html reads) from tools/scenarios.py, sound-log.json and
sound-analysis.json. Run it after tools/generate.py and tools/analyze.py:   python tools/build.py
With --zip it also makes ../sfx-lab-share.zip (the page, the sounds and two pieces of game music) for sending privately.
"""
import datetime
import json
import os
import statistics
import sys
import zipfile

import scenarios as SC

LAB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(LAB)
# the game's own music, for "Play over game music" (CC0, from the game's folders). In the zip they sit in music/.
MUSIC = [
    {'name': 'Park, city and canal ("Quaint Town")', 'file': 'quaint-town.mp3', 'game': 'game/worlds/city/assets/music/quaint-town.mp3', 'vol': 0.6},
    {'name': 'Evening, by the Old Bridge ("Magic Town")', 'file': 'magic-town.mp3', 'game': 'game/worlds/city/assets/music/magic-town.mp3', 'vol': 0.5},
]
CREDIT = 'Sounds generated with ElevenLabs (elevenlabs.io), free plan, private testing only'


def load(name, default):
    try:
        with open(os.path.join(LAB, name), encoding='utf-8') as f:
            return json.load(f)
    except (OSError, ValueError):
        return default


def main():
    log = load('sound-log.json', {'files': [], 'credits': {}})
    ana = load('sound-analysis.json', {})
    by = {(e['id'], e['take']): e for e in log['files']}
    # loudness: every sound is played at the level of the quieter ones (a browser can turn a sound down, not up)
    levels = [v['rms'] for v in ana.values() if v.get('rms')]
    target = statistics.quantiles(levels, n=4)[0] if len(levels) >= 4 else 0.08
    out, rows = [], []
    for s in SC.S:
        takes = []
        for i, (flavour, prompt) in enumerate(s['takes']):
            t = 'ABC'[i]
            e = by.get((s['id'], t), {})
            a = ana.get(e.get('file') or '', {})
            status = 'missing' if not e else ('failed' if not e.get('file') else ('silent' if a.get('silent') else e.get('result', 'ok')))
            takes.append({'take': t, 'flavour': flavour, 'prompt': e.get('prompt', prompt), 'file': e.get('file'), 'status': status,
                          'seconds': round(a.get('end', e.get('seconds', 0)) - a.get('start', 0), 2) if e.get('file') else None,
                          'start': round(a.get('start', 0), 2), 'end': round(a['end'], 2) if a.get('end') else None,
                          'gain': round(min(1.0, target / a['rms']), 2) if a.get('rms') else 1.0})
        playable = sum(1 for t in takes if t['file'] and t['status'] != 'silent')
        out.append({'id': s['id'], 'cat': s['cat'], 'name': s['name'], 'when': s['when'], 'pri': s['pri'], 'takes': takes, 'playable': playable})
        for t in takes:
            rows.append(f"| `{s['id']}` | {s['cat']} | {s['name']} | {s['when']} | {t['take']} ({t['flavour']}) | {t['prompt']} | {s['dur']} s | {s['pri']} | {t['status']} |")
    data = {'credit': CREDIT, 'made': datetime.date.today().isoformat(), 'categories': [{'id': c, 'name': n} for c, n in SC.CATEGORIES],
            'music': [{'name': m['name'], 'files': ['music/' + m['file'], '../' + m['game']], 'vol': m['vol']} for m in MUSIC],
            'scenarios': out}
    with open(os.path.join(LAB, 'sounds.js'), 'w', encoding='utf-8') as f:
        f.write('// Written by tools/build.py: the Sound Lab\'s list of sounds. ' + CREDIT + '.\n')
        f.write('window.SOUND_LAB = ' + json.dumps(data, ensure_ascii=False, indent=0) + ';\n')
    files = sum(1 for s in out for t in s['takes'] if t['file'])
    with open(os.path.join(LAB, 'SOUND_LIST.md'), 'w', encoding='utf-8') as f:
        f.write('# Sound list\n\n' + CREDIT + '.\n\n'
                f'{len(out)} scenarios, three takes each (A, B, C); {files} sound files made. Written by `tools/build.py` from '
                '`tools/scenarios.py` (where the list and the prompts are kept) and `sound-log.json`.\n\n'
                'Priority: 1 = needed first, 2 = wanted, 3 = nice to have. Status: ok, retried (made at the second try), '
                'failed, silent (made but nearly silent), missing (not made: the credits ran out first).\n\n'
                '| id | category | sound | when it plays | take | prompt | length | priority | status |\n|---|---|---|---|---|---|---|---|---|\n'
                + '\n'.join(rows) + '\n')
    short = [s['id'] for s in out if s['playable'] < 3]
    print(f'{len(out)} scenarios, {files} files; fewer than three playable: {len(short)} {short[:12]}')
    if '--zip' in sys.argv:
        z = os.path.join(ROOT, 'sfx-lab-share.zip')
        with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
            for name in ('index.html', 'sounds.js', 'README.md'):
                zf.write(os.path.join(LAB, name), 'sound-lab/' + name)
            for s in out:
                for t in s['takes']:
                    if t['file']:
                        zf.write(os.path.join(LAB, t['file']), 'sound-lab/' + t['file'], compress_type=zipfile.ZIP_STORED)
            for m in MUSIC:
                zf.write(os.path.join(ROOT, m['game']), 'sound-lab/music/' + m['file'], compress_type=zipfile.ZIP_STORED)
            zf.writestr('sound-lab/music/CREDITS.txt', 'Music from the game, CC0 (public domain), from OpenGameArt.org:\n'
                        '"Quaint Town" by neonarkade, https://opengameart.org/node/31877\n'
                        '"Magic Town" by controllerhead, https://opengameart.org/content/magic-town\n')
        print('zip:', z, round(os.path.getsize(z) / 1e6, 1), 'MB')


if __name__ == '__main__':
    main()
