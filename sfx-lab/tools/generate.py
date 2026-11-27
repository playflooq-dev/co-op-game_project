"""Makes the Sound Lab's sounds with ElevenLabs, breadth first: take A of every scenario, then B of every scenario, then
C. So if the credits run out, every scenario still has at least one sound.

From the sfx-lab folder:
    python tools/generate.py --dry          what would be made, in order (nothing is sent)
    python tools/generate.py                make everything not made yet (it can be stopped and run again)
    python tools/generate.py --only bro-yay --take B     one sound (it replaces an earlier one)

Needs: pip install elevenlabs mutagen, and the key in the project's .env (made by
`npx -y @elevenlabs/cli@latest onboard init`). The key is read into this process only; it is never printed or saved.
Every result is written to sound-log.json. Files are written to a temporary name first and renamed when complete.
"""
import argparse
import datetime
import json
import os
import sys
import time

import scenarios as SC

LAB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV = os.path.join(LAB, '..', '.env')
LOG = os.path.join(LAB, 'sound-log.json')
MODEL = 'eleven_text_to_sound_v3'
TAKES = 'ABC'
RESERVE = 60          # stop when fewer credits than this are left after the next sound
CHECK_EVERY = 10


def load_key():
    if os.environ.get('ELEVENLABS_API_KEY'):
        return True
    try:
        with open(ENV, encoding='utf-8-sig') as f:
            for line in f:
                k, eq, v = line.strip().partition('=')
                if eq and k.replace('export ', '').strip() == 'ELEVENLABS_API_KEY':
                    os.environ['ELEVENLABS_API_KEY'] = v.strip().strip('"\'')
    except OSError:
        pass
    return bool(os.environ.get('ELEVENLABS_API_KEY'))


def read_log():
    try:
        with open(LOG, encoding='utf-8') as f:
            return json.load(f)
    except (OSError, ValueError):
        return {'credits': {}, 'files': []}


def write_log(log):
    tmp = LOG + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(log, f, indent=1, ensure_ascii=False)
    os.replace(tmp, LOG)


def entry(log, sid, take):
    return next((e for e in log['files'] if e['id'] == sid and e['take'] == take), None)


def plan():
    """(scenario, take) in the order they are made."""
    order = []
    for take in TAKES:
        for cat in SC.ORDER:
            for s in sorted((s for s in SC.S if s['cat'] == cat), key=lambda s: s['pri']):
                order.append((s, take))
    return order


def safer(prompt):
    """A rewrite for a second try: no ages, described as a cartoon sound."""
    p = prompt.replace(SC.SIS, SC.SIS_SAFE).replace(SC.BRO, SC.BRO_SAFE).replace(SC.BRO.lower(), SC.BRO_SAFE.lower())
    p = p.replace('a little boy', 'a cartoon boy').replace('An older girl', 'A cartoon girl').replace('Two children', 'Two cartoon characters').replace('two children', 'two cartoon characters')
    p = p.replace('A child', 'A cartoon character').replace("A child's", "A cartoon character's")
    return p if p != prompt else 'Cartoon sound effect: ' + prompt


def length_of(path):
    from mutagen.mp3 import MP3
    try:
        return MP3(path).info.length
    except Exception:
        return 0.0


class OutOfCredits(Exception):
    pass


def make(client, s, take, log, prompt=None):
    """One sound. Returns 'ok', 'retried' or 'failed'."""
    i = TAKES.index(take)
    flavour, base = s['takes'][i]
    folder = os.path.join(LAB, 'sounds', s['cat'])
    os.makedirs(folder, exist_ok=True)
    name = f"{s['id']}-{take}.mp3"
    path = os.path.join(folder, name)
    tries = [prompt or base, safer(prompt or base)]
    result, used, problems = 'failed', None, []
    for n, p in enumerate(tries):
        for check in range(2):  # a file that is empty or the wrong length is made once more with the same prompt
            try:
                audio = SC_convert(client, p, s['dur'])
            except Exception as e:
                text = str(getattr(e, 'body', None) or e)  # (the reason ElevenLabs gives, not the reply's headers)
                if 'quota' in text.lower() or 'credits' in text.lower() or '402' in text or 'insufficient' in text.lower():
                    raise OutOfCredits(text[:200])
                problems.append(f'try {n + 1}: ' + text[:200].replace(os.environ.get('ELEVENLABS_API_KEY', '\0'), '***'))
                break  # refused or failed: rewrite the prompt
            tmp = path + '.part'
            with open(tmp, 'wb') as f:
                f.write(audio)
            got = length_of(tmp)
            if len(audio) < 2000 or got < 0.25 or abs(got - s['dur']) > max(0.6, s['dur'] * 0.5):
                problems.append(f'try {n + 1}: file not right ({len(audio)} bytes, {got:.2f} s), made again')
                os.remove(tmp)
                continue
            os.replace(tmp, path)
            result, used = ('ok' if n == 0 and not problems else 'retried'), p
            break
        if used:
            break
    e = entry(log, s['id'], take)
    if e:
        log['files'].remove(e)
    log['files'].append({
        'id': s['id'], 'category': s['cat'], 'take': take, 'flavour': flavour, 'prompt': used or tries[-1],
        'duration': s['dur'], 'seconds': round(length_of(path), 2) if used else 0, 'file': f"sounds/{s['cat']}/{name}" if used else None,
        'model': MODEL, 'date': datetime.date.today().isoformat(), 'result': result, 'problems': problems,
        'license': 'elevenlabs-free-testing'})
    write_log(log)
    return result


SPENT = {'credits': 0}


def SC_convert(client, prompt, dur):
    """One request. ElevenLabs says in its reply what it cost (the header character-cost): that is added to SPENT."""
    with client.text_to_sound_effects.with_raw_response.convert(text=prompt, model_id=MODEL, duration_seconds=dur, prompt_influence=0.5,
                                                                output_format='mp3_44100_128',
                                                                request_options={'timeout_in_seconds': 60, 'max_retries': 1}) as resp:
        data = b''.join(resp.data)
        SPENT['credits'] += int(resp.headers.get('character-cost') or round(dur * 20))
    return data


def credits(client):
    s = client.user.subscription.get(request_options={'timeout_in_seconds': 30, 'max_retries': 2})
    return s.character_limit - s.character_count, s.character_count, s.character_limit


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--dry', action='store_true')
    ap.add_argument('--only', help='one scenario id')
    ap.add_argument('--take', default='A')
    ap.add_argument('--max', type=int, default=10 ** 6, help='stop after this many sounds')
    ap.add_argument('--add', default='', help='with --only: words added to the prompt, e.g. "close-up and clearly audible"')
    a = ap.parse_args()
    log = read_log()
    todo = [(SC.BY_ID[a.only], a.take)] if a.only else [(s, t) for s, t in plan() if not (entry(log, s['id'], t) or {}).get('file')
                                                         and (entry(log, s['id'], t) or {}).get('result') != 'failed']
    if a.dry:
        for s, t in todo:
            print(t, s['cat'], s['id'], s['dur'])
        print(len(todo), 'to make,', round(sum(s['dur'] for s, _ in todo), 1), 'seconds')
        return
    if not load_key():
        sys.exit('No ElevenLabs key: run `npx -y @elevenlabs/cli@latest onboard init` in the project folder.')
    from elevenlabs import ElevenLabs
    client = ElevenLabs()
    left, used, limit = credits(client)
    log['credits'].setdefault('at_start', {'used': used, 'limit': limit, 'date': datetime.date.today().isoformat()})
    spent0 = log['credits'].get('spent_by_lab', 0)
    left = min(left, limit - log['credits']['at_start']['used'] - spent0)  # (the account's own count can lag behind)
    per_second = log['credits'].get('per_second') or 20
    print(f'credits left: about {left} of {limit} (used by the lab so far: {spent0})')
    done = 0
    for s, t in todo[:a.max]:
        cost = per_second * s['dur'] * 1.2  # (room for one retry of a short sound)
        if left - cost < RESERVE:
            print(f'stopping: {left} credits left, the next sound needs about {cost:.0f}')
            break
        try:
            r = make(client, s, t, log, prompt=(s['takes']['ABC'.index(t)][1].rstrip('.') + ', ' + a.add + '.') if a.add else None)
        except OutOfCredits as e:
            print('stopping: ElevenLabs says the credits have run out:', e)
            break
        done += 1
        log['credits']['spent_by_lab'] = spent0 + SPENT['credits']
        left = limit - log['credits']['at_start']['used'] - log['credits']['spent_by_lab']
        if done % CHECK_EVERY == 0:  # every 10 sounds: also ask the account (the lower of the two counts is used)
            sub_left, _, _ = credits(client)
            left = min(left, sub_left)
        log['credits']['last_check'] = {'left': left, 'date': datetime.datetime.now().isoformat(timespec='seconds')}
        write_log(log)
        print(f"{t} {s['id']:15} {r:8} (about {left:.0f} credits left)", flush=True)
        time.sleep(0.3)
    sub_left, used, limit = credits(client)
    left = min(sub_left, limit - log['credits']['at_start']['used'] - log['credits'].get('spent_by_lab', 0))
    log['credits']['last_check'] = {'left': left, 'account_says_used': used, 'limit': limit, 'date': datetime.datetime.now().isoformat(timespec='seconds')}
    write_log(log)
    print(f'made {done}; credits left: {left} of {limit}')


if __name__ == '__main__':
    main()
