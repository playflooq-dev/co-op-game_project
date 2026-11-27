# Sound Lab

A private page for listening to new sound effects for the game and choosing the best version of each.

**Sounds generated with ElevenLabs (elevenlabs.io), free plan, private testing only.** They are not part of the game,
and they must not be published, uploaded or put on a web address: the free plan does not cover that. The game's own
sounds have not changed.

## Opening it

- **From the zip** (`sfx-lab-share.zip`): unzip it anywhere, open the `sound-lab` folder and double-click
  `index.html`. Nothing needs installing, and no internet connection is needed.
- **From the project**: double-click `sfx-lab/index.html`.

Use an up-to-date Chrome, Edge, Firefox or Safari. It works on a phone too: send the zip, unzip it in the phone's
files app and open `index.html`. Some phones will not open web pages from files; then use a laptop.

## Choosing

Each sound the game needs has a card with up to three versions, **A**, **B** and **C**, each a different take (for
example "soft", "bright", "cartoony"). On each card:

- **▶ A, B, C**: tap to hear that version, tap again to stop. **Play all** plays them one after another.
- **★**: your favourite. One per sound; tapping another star moves it.
- **✕**: not good. Mark every version you would not want.
- **Notes**: anything to change ("softer", "too long", "more giggly").

At the top: how many sounds have a favourite, the volume, and **Play over game music**, which plays the game's own
music quietly underneath so you can hear how a sound fits. The filters show all sounds, only those without a favourite
yet, or only the picked ones. The tabs jump to one group (Sister in green, Brother in blue).

Everything you choose is kept in this browser on this device, also after closing it. Clearing the browser's data
removes it, so send your picks back when you are done.

Cards marked **only 1 (or 2) of 3 made**, **failed** or **nearly silent** have fewer versions than planned.

## Sending picks back

1. Type your name in **Your name**.
2. Press **Download my picks**. This saves a small file such as `sound-picks-anna-2026-11-28.json`. (Or press
   **Copy my picks** and paste it into a message.)
3. Send that file.

**Import picks** loads someone else's picks file. Their favourite, their ✕ marks and their notes then show at the
bottom of each card, next to your own, so the choices can be compared. Your own picks do not change.

## Making or remaking sounds

This needs the project folder, Python 3, `pip install elevenlabs mutagen`, and an ElevenLabs key in the project's
`.env` file (made by `npx -y @elevenlabs/cli@latest onboard init` in the project folder; `.env` is never stored in git
and must never be shared). From the `sfx-lab` folder:

| Step | Command |
|---|---|
| See what would be made (spends nothing) | `python tools/generate.py --dry` |
| Make everything not made yet | `python tools/generate.py` |
| Remake one version | `python tools/generate.py --only bro-yay --take B` |
| Measure the sounds (length, loudness, silence) | `python tools/analyze.py` |
| Write the page's list and SOUND_LIST.md | `python tools/build.py` |
| Also make the zip for sending | `python tools/build.py --zip` |
| Check the page (every sound, picks, copy, download, import) | `node tools/check.mjs` |

To **add a sound** or **change a prompt**, edit `tools/scenarios.py` (every scenario and its three prompts are there;
each sibling's voice description is kept in one place, `SIS` and `BRO`, so that all their sounds sound like one
person). Then run the steps above.

`tools/generate.py` makes take A of every sound first, then B, then C, so that if the credits run out every sound
still has one version. It reads the price of each sound from ElevenLabs' reply (about 20 credits a second), checks the
account every 10 sounds, and stops before the credits run out. A refused sound is tried once more with a simpler
prompt; a file that is empty or the wrong length is made once more. Every result, with its exact prompt, is in
`sound-log.json`.

`ffmpeg` is not installed on this computer, so the files are not trimmed or levelled. Instead `tools/analyze.py`
measures where each sound starts and ends and how loud it is, and the page plays each one trimmed and at an even
loudness. The files themselves are exactly what ElevenLabs made.

## Files

| File | What it is |
|---|---|
| `index.html` | The page |
| `sounds.js` | The list of sounds the page shows (written by `tools/build.py`) |
| `sounds/<group>/<sound>-<A, B or C>.mp3` | The sounds |
| `SOUND_LIST.md` | Every sound, when it plays in the game, each prompt, and how it turned out |
| `sound-log.json` | The record of every sound made: prompt, length, date, result, licence |
| `sound-analysis.json` | Length, loudness and start and end of each file |
| `DECISIONS_LOG.md` | The decisions made while building this without the user |
| `tools/` | The scripts above |
