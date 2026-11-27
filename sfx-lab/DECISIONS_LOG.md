# Decisions log

Decisions made while building the Sound Lab on 2026-11-27, while the user was away. Each can be changed.

## Setup

1. **No ElevenLabs MCP tools were connected** in this session (a search for them found none). The sounds were made
   with ElevenLabs' own Python library instead, using the key already in the project's `.env` (made earlier with
   `npx -y @elevenlabs/cli@latest onboard init`). The key is read into the script's memory only; it is in no file, log
   or output, and a search of the whole project, the zip and the git history found it nowhere.
2. **The model is `eleven_text_to_sound_v3`** (SFX v3), which ElevenLabs' own guide recommends for natural sounds and
   for prompts with several parts. Every sound: MP3, 44.1 kHz, 128 kbit/s; prompt influence 0.5 (between following the
   prompt closely and letting the model vary); each sound's length set from the list.
3. **Credits.** The account started with 10,000 (free plan). The account's own count lagged behind by several
   minutes, so the generator reads the price of each sound from ElevenLabs' reply (the header `character-cost`: 20
   credits a second) and uses whichever count is lower. At the end the account showed **7,082 used, 2,918 left**.
4. **The branch `sound/sfx-lab`** was made from `main`. The project's `.gitignore` on `main` did not list `.env` (that
   line was on another, unmerged branch), so it was added here first, before anything else.

## The list

5. **84 scenarios** instead of the brief's 75: the brief's list, plus nine sounds the game's code already plays and
   that would need new versions: a cat meow (the park), a bird chirp (the park), a bell (the city), parasols popping
   open (the city's cafe), the mist lifting from the forest (the chapter map), the house's front door creaking, the
   parents' letter rustling, the code dial on Dad's box, and the light cord in the cupboard (all three in the house).
   Also added: **"Locked stop tapped"** on the map, which the brief did not list but the map plays (a soft "no").
6. **Footsteps are one file of four steps**, not one step, so that each version can be heard as a walk. The game can
   cut single steps from the favourite later.
7. **Priorities**: 1 for what every level uses (jumping, landing, carrying, plates, gates, the boats, success), 2 for
   what one level uses or a sibling's reactions, 3 for nice-to-have (yawn, carpet, ripples, leaves, the dog, the nine
   extras).
8. **The three takes** of every sound are a soft one (A), a brighter or bouncier one (B), and a cartoonish one (C),
   with words to match each sound (for example "squeaky", "rattly", "belly laugh"). The flavour is on each button.
9. **One voice per sibling.** Every sister sound starts with "An older girl, about 11 years old, with a warm, calm
   and kind voice", every brother sound with "A little boy, about 6 years old, with a bright, cheeky and bouncy voice".
   The sound effects model has no way to keep a voice the same from one sound to the next, so the two may still not
   sound like one person each: see "What to listen for" below.
10. **Near-wordless sounds** ("yay", "hup", "ta-da", "wheee", "oh!") are asked for as written, with "no other words".
    Some may come out as real words, which is what the brief allows.
11. **Interface sounds** may have music (they are jingles); everything else asks for "no music, no voices, no
    background noise". Fanfares are 3.5 s and the chapter celebration 4 s.

## Making them

12. **Breadth first**, as the brief asked: take A of every sound (most needed groups first: Sister, Brother,
    Footsteps, Objects, Together, Water and nature, Interface), then all of B, then all of C. The credits did not run
    out: all 252 were made.
13. **Two sounds needed a second try**: `dog-bark` B (refused or failed at the first try; ElevenLabs' reason was not
    kept, because the script stored only the reply's headers, now fixed) was made with the rewritten prompt "Cartoon
    sound effect: ..."; `step-pavement` C timed out once and was made at the second try with the same prompt.
14. **A time limit of 60 seconds** was added to every request after one request hung for several minutes; the run was
    stopped and started again, and nothing was lost (files are written to a temporary name and renamed when complete).
15. **Faint files were made once more.** `ffmpeg` is not installed, so the files were measured in the browser instead
    (`tools/analyze.py`). One file was nearly silent (`step-grass` A); it was made again. Then 12 more files whose
    loudest moment was under 8 in 100 of full volume, or with far less sound than asked for (`step-carpet` A held
    one step instead of four), were made once more with "close-up and clearly audible" added to the prompt:
    `door-creak` A, `leaves` A, `plank-creak` A, `step-carpet` A, `step-grass` B, `step-pavement` A, `step-stone` A,
    `ui-hint` A, `ui-stop` A and C, `ui-tap` A, `ui-walk` A. That cost about 280 credits. **Six are still very faint**
    after the second try and are marked "very quiet" on their cards; they still play: `step-grass` A and B, `ui-stop` A,
    `ui-walk` A, `leaves` A and `door-creak` A. All are "soft" takes, so faint may be what was asked for.
16. **No trimming or levelling of the files.** Without ffmpeg the files are exactly what ElevenLabs made. Instead the
    page plays each one from where its sound starts to where it ends (measured), and turns the louder ones down to the
    middle loudness. A page opened from a file cannot turn a sound up, so very quiet ones play at full volume.

## The page

17. **The page is one file, `index.html`**, with its styles and code inside it, and `sounds.js` beside it for the list
    (not a JSON file, so that it works when opened by double-click).
18. **"Your name"** was added beside the picks buttons: it goes into the picks file, so that files from different
    people can be told apart, and an imported file shows under that name.
19. **Imported picks are shown, not merged**: each card shows the other person's favourite, ✕ marks and notes under
    your own, and your own picks never change. Importing the same person again replaces their earlier file.
20. **The game music**: "Quaint Town" (the park, the city by day and the canal) and "Magic Town" (the evening and the
    Old Bridge), both CC0, chosen in a menu. The house's music (8 MB) was left out to keep the zip small. In the zip
    the music is in `music/`; in the project the page takes it straight from the game's folders.
21. **A ✕ on the favourite removes the favourite**, and a ★ on a ✕-marked version removes the ✕.
22. **On a phone** the top bar scrolls away with the page instead of staying pinned, so that the sounds have room.
23. **Nothing is published.** The page has a `noindex` tag, the branch is not pushed, the zip is not in git
    (`.gitignore`), and nothing was put on the web.

## What to listen for

- **Do the sister and the brother each sound like one person?** The model cannot hold a voice; picking for each
  sibling the takes that sound alike matters more than picking the best one alone.
- **Children's voices.** The model may make the voices older, or more like adults putting on a child's voice.
- **Words.** Some "wordless" sounds may have slipped into words, or into another language.
