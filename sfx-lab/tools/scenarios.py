"""Every sound the Sound Lab offers: one scenario per sound the game needs, each with three different takes (A, B, C).

This file is the one place the list lives. tools/generate.py makes the sounds from it, and tools/build.py writes
SOUND_LIST.md and sounds.js (for the page) from it and the log.

A scenario: id, category, name, when it plays in the game, length in seconds, priority (1 = needed first), and three
takes, each (flavour, prompt). The prompts describe the source, the action and the mood; every one asks for a clean,
isolated sound with no music and no words (the interface jingles are the only music).
"""

# The two voices. Every sound of a sibling starts with the same description, so that each sounds like one person.
SIS = 'An older girl, about 11 years old, with a warm, calm and kind voice'
BRO = 'A little boy, about 6 years old, with a bright, cheeky and bouncy voice'
# The same, for a retry if a prompt is refused (no ages)
SIS_SAFE = 'A cartoon big-sister character with a warm, kind voice'
BRO_SAFE = 'A cartoon little-brother character with a bright, cheeky voice'
CLEAN = 'isolated, no background noise, no music, no other words'
CLEAN_FX = 'isolated sound effect, no background noise, no music, no voices'
STORY = 'cozy storybook cartoon style'

CATEGORIES = [
    ('sister', 'Sister'),
    ('brother', 'Brother'),
    ('together', 'Together'),
    ('footsteps', 'Footsteps and movement'),
    ('objects', 'Objects'),
    ('nature', 'Water and nature'),
    ('interface', 'Interface and rewards'),
]
# the order sounds are made in (most needed first), round by round
ORDER = ['sister', 'brother', 'footsteps', 'objects', 'together', 'nature', 'interface']


def voice(who, action, takes):
    """Three takes of one sibling's sound: takes = [(flavour, how), ...]"""
    v = SIS if who == 'sister' else BRO
    return [(f, f'{v}, {action}, {how}, {CLEAN}.') for f, how in takes]


def fx(what, takes):
    return [(f, f'{what}, {how}, {STORY}, {CLEAN_FX}.') for f, how in takes]


S = []


def add(id, cat, name, when, dur, pri, takes):
    S.append({'id': id, 'cat': cat, 'name': name, 'when': when, 'dur': dur, 'pri': pri, 'takes': takes})


# ---------------------------------------------------------------- A. Sister
for who, p in (('sister', 'sis'), ('brother', 'bro')):
    me = 'her' if who == 'sister' else 'his'
    add(f'{p}-yay', who, 'Happy "yay"', 'A small success: a plate pressed, a gate opened.', 1.2, 1, voice(who, 'saying a happy "yay!"', [
        ('soft', 'gentle and pleased, quietly delighted'), ('bright', 'bright and excited, a little skip in the voice'), ('cartoony', 'big cartoon "yaaay!", playful and bouncy')]))
    add(f'{p}-giggle', who, 'Giggle', 'Standing close together; a funny moment.', 1.5, 1, voice(who, 'giggling', [
        ('soft', 'a soft shy giggle'), ('bubbly', 'a bubbly, bouncy giggle'), ('cartoony', 'a cute cartoon tee-hee giggle')]))
    add(f'{p}-laugh', who, 'Laugh', 'Something silly happens (a splash, a wobble).', 2.0, 2, voice(who, 'laughing', [
        ('warm', 'a warm, happy laugh'), ('belly', 'a big joyful belly laugh'), ('cartoony', 'a playful cartoon ha-ha-ha')]))
    add(f'{p}-yawn', who, 'Yawn', 'Nobody has moved for a while (sleepy face).', 2.5, 3, voice(who, 'yawning sleepily', [
        ('soft', 'a long soft sleepy yawn'), ('stretchy', 'a big stretchy yawn ending in a small sigh'), ('cartoony', 'a cute cartoon yawn with a little mumble')]))
    add(f'{p}-worried', who, 'Worried hum', f'The other one is far away, or {me} sibling is stuck.', 1.5, 2, voice(who, 'making a worried "hmmm" hum', [
        ('soft', 'quiet and unsure'), ('wobbly', 'a wobbly, anxious little hum'), ('cartoony', 'a cartoon "uh-oh" worried hum')]))
    add(f'{p}-gasp', who, 'Scared gasp', 'A plank bends, a boat sinks, a close call.', 1.0, 2, voice(who, 'giving a short startled gasp', [
        ('soft', 'a small, quick gasp, more surprised than scared'), ('sharp', 'a sharp gasp with a tiny squeak'), ('cartoony', 'a cartoon "eep!" gasp, funny not scary')]))
    add(f'{p}-oh', who, 'Surprised "oh!"', 'Something new appears: a lever, a hidden path.', 1.0, 2, voice(who, 'saying a surprised "oh!"', [
        ('soft', 'curious and gentle'), ('bright', 'bright and amazed'), ('cartoony', 'a big cartoon "ooh!"')]))
    add(f'{p}-hmm', who, 'Thinking "hmm"', 'Standing still in front of a puzzle.', 1.5, 2, voice(who, 'thinking out loud with a "hmmm"', [
        ('soft', 'calm and thoughtful'), ('rising', 'a curious rising "hmm?"'), ('cartoony', 'a cartoon pondering "hmmmm"')]))
    add(f'{p}-aww', who, 'Sad "aww"', 'Something goes wrong: a box falls off, a gate closes again.', 1.2, 2, voice(who, 'saying a disappointed "aww"', [
        ('soft', 'gentle and a little sad'), ('sulky', 'a long sulky "awww"'), ('cartoony', 'a cartoon "aww, man" sigh, funny')]))
    add(f'{p}-cheer', who, 'Cheer', 'A puzzle is solved.', 1.8, 1, voice(who, 'cheering', [
        ('warm', 'a warm, proud "woo-hoo!"'), ('bouncy', 'a bouncy, excited cheer'), ('cartoony', 'a big cartoon cheer with a little laugh')]))

# the sister's own sounds
add('sis-effort', 'sister', 'Effort grunt', 'Lifting or carrying the heavy crate.', 1.0, 1, voice('sister', 'making a short effort grunt while lifting something heavy', [
    ('soft', 'a soft "nngh"'), ('strong', 'a determined "hnnf!"'), ('cartoony', 'a cartoon strain, funny and cute')]))
add('sis-hup', 'sister', '"Hup!" (lifting him)', 'She lifts her brother onto her shoulders, or tosses him.', 0.8, 1, voice('sister', 'saying a quick "hup!"', [
    ('soft', 'gentle and caring'), ('strong', 'strong and sporty'), ('cartoony', 'a cartoon "hup-la!"')]))
add('sis-hop', 'sister', 'Jump "hop"', 'She jumps.', 0.6, 1, voice('sister', 'a tiny breath as she jumps, "hop"', [
    ('soft', 'barely there, a light breath'), ('sporty', 'a sporty short "hup"'), ('cartoony', 'a cartoon "hop!"')]))
add('sis-oof', 'sister', 'Landing "oof"', 'She lands after a jump or a fall.', 0.6, 1, voice('sister', 'landing lightly with a small "oof"', [
    ('soft', 'a soft breathy "oof"'), ('surprised', 'a surprised little "oof!"'), ('cartoony', 'a cartoon "oof"')]))

# the brother's own sounds
add('bro-wheee', 'brother', '"Wheee!"', 'He is launched by the see-saw, or tossed up by his sister.', 2.0, 1, voice('brother', 'shouting a joyful "wheeee!" while flying through the air', [
    ('soft', 'happy and light'), ('excited', 'very excited, rising up'), ('cartoony', 'a long cartoon "wheeeee!" with a giggle')]))
add('bro-lifted', 'brother', 'Giggle while lifted', 'His sister lifts him onto her shoulders.', 1.5, 1, voice('brother', 'giggling while being lifted up high', [
    ('soft', 'a soft delighted giggle'), ('ticklish', 'a ticklish squealy giggle'), ('cartoony', 'a cartoon "hee-hee, higher!" giggle, no words')]))
add('bro-hop', 'brother', 'Jump "hop"', 'He jumps.', 0.6, 1, voice('brother', 'a tiny breath as he jumps, "hop"', [
    ('soft', 'a light breath'), ('bouncy', 'a bouncy "hup!"'), ('cartoony', 'a cartoon "boing-hop"')]))
add('bro-oof', 'brother', 'Landing "oof"', 'He lands after a jump or a fall.', 0.6, 1, voice('brother', 'landing with a small "oof"', [
    ('soft', 'a soft little "oof"'), ('silly', 'a silly "oof!" with a giggle'), ('cartoony', 'a cartoon "oomf"')]))
add('bro-splutter', 'brother', 'Splash and splutter', 'He falls into the water (he is back on land within a second).', 2.0, 1, [
    ('soft', f'{BRO}, falling into shallow water with a small splash and a little cough and splutter, then a giggle, {CLEAN}.'),
    ('bubbly', f'{BRO}, a splash into water followed by bubbly spluttering "pfff-blbl", funny, {CLEAN}.'),
    ('cartoony', f'{BRO}, a cartoon splash and a silly spluttering "bleh!", {CLEAN}.')])

# ---------------------------------------------------------------- C. Together
add('both-highfive', 'together', 'High five', 'The two of them high-five after a puzzle.', 1.5, 1, [
    ('soft', f'Two children high-fiving: one clap of hands and a small happy shared "yay", {CLEAN}.'),
    ('bright', f'A crisp high-five clap and two children cheering "yeah!" together, {CLEAN}.'),
    ('cartoony', f'A cartoon high-five slap with a sparkle and two kids giggling, {CLEAN}.')])
add('both-laugh', 'together', 'Laughing together', 'Both of them laugh at a funny moment.', 2.5, 2, [
    ('warm', f'{SIS} and {BRO.lower()}, laughing warmly together, {CLEAN}.'),
    ('giggly', f'An older girl and a little boy giggling together uncontrollably, {CLEAN}.'),
    ('cartoony', f'Two cartoon siblings laughing together, playful, {CLEAN}.')])
add('both-tada', 'together', '"Ta-da!"', 'The end of a level: both cheer together.', 2.0, 1, [
    ('warm', f'An older girl and a little boy cheering "ta-da!" together, proud and warm, {CLEAN}.'),
    ('bright', f'Two children shouting a bright "ta-daaa!" together, {CLEAN}.'),
    ('cartoony', f'Two cartoon kids shouting "ta-da!" with a little giggle at the end, {CLEAN}.')])

# ---------------------------------------------------------------- D. Footsteps and movement
for id, name, when, surface, pri in [
    ('step-grass', 'Footsteps on grass', 'Walking in the park.', 'soft grass', 1),
    ('step-wood', 'Footsteps on a wooden floor', 'Walking inside the house, on jetties and planks.', 'a wooden floor', 1),
    ('step-stone', 'Footsteps on a stone path', 'Walking on the canal quay and cobbles.', 'a stone cobbled path', 1),
    ('step-pavement', 'Footsteps on pavement', 'Walking along the city streets.', 'a city pavement', 1),
    ('step-carpet', 'Footsteps on carpet', 'Walking on rugs inside the house.', 'a thick carpet indoors', 3),
]:
    add(id, 'footsteps', name, when, 1.2, pri, fx(f'A child\'s light footsteps, four steps on {surface}', [
        ('soft', 'small sneakers, slow and soft'), ('bouncy', 'quick, skipping and bouncy'), ('cartoony', 'playful cartoon tip-tap steps')]))
add('step-puddle', 'footsteps', 'Splashing through a puddle', 'Walking through a puddle in the park or the canal.', 1.2, 2, fx('A child\'s boots splashing through a small puddle, three steps', [
    ('soft', 'gentle little splashes'), ('bouncy', 'jumping, splashy and fun'), ('cartoony', 'cartoon splish-splosh steps')]))
add('land-grass', 'footsteps', 'Landing on grass', 'A sibling lands on grass after a jump.', 0.6, 1, fx('A child landing on soft grass after a small jump', [
    ('soft', 'a soft muffled thump'), ('springy', 'a light springy landing with a rustle'), ('cartoony', 'a cartoon "thup" landing')]))
add('land-wood', 'footsteps', 'Landing on wood', 'A sibling lands on a box, a plank or a floor.', 0.6, 1, fx('A child landing on a wooden floor after a small jump', [
    ('soft', 'a soft wooden thud'), ('hollow', 'a hollow knock on boards'), ('cartoony', 'a cartoon "bonk" landing')]))

# ---------------------------------------------------------------- E. Objects
for id, name, when, dur, pri, what, takes in [
    ('box-pick', 'Box picked up', 'A light box is picked up.', 0.6, 1, 'Picking up a small hollow wooden box',
     [('soft', 'a light wooden knock and lift'), ('scrapy', 'a short scrape and lift'), ('cartoony', 'a cartoon "whup" pick-up')]),
    ('box-put', 'Box put down', 'A box is set down (often on a plate).', 0.6, 1, 'Setting a small wooden box down',
     [('soft', 'one soft wooden thud'), ('solid', 'a solid clunk on stone'), ('cartoony', 'a cartoon "thonk"')]),
    ('box-slide', 'Box pushed or sliding', 'A box slides along the ground.', 1.2, 2, 'A small wooden box being pushed and sliding across the floor',
     [('soft', 'a gentle scrape'), ('bumpy', 'a bumpy wooden scrape over cobbles'), ('cartoony', 'a cartoon slide "shhhk"')]),
    ('crate-drag', 'Heavy crate dragged', 'The sister drags the heavy crate.', 1.6, 2, 'A heavy wooden crate dragged slowly across the floor',
     [('soft', 'a low heavy scrape'), ('creaky', 'a creaky heavy drag with a grunt-like wood groan'), ('cartoony', 'a cartoon heavy "grrrrk" drag')]),
    ('plate-down', 'Pressure plate down', 'Someone steps on a plate, or a box is put on it.', 0.6, 1, 'A big stone pressure plate clicking down into the ground',
     [('soft', 'a soft stone click'), ('clunky', 'a satisfying mechanical clunk'), ('cartoony', 'a cartoon "click-thunk"')]),
    ('plate-up', 'Pressure plate releasing', 'The plate rises again when left.', 0.6, 2, 'A stone pressure plate springing back up',
     [('soft', 'a soft click up'), ('springy', 'a springy release'), ('cartoony', 'a cartoon "boink" release')]),
    ('gate-open', 'Gate opening', 'A gate opens when a plate or lever is on.', 1.4, 1, 'A small iron garden gate swinging open',
     [('soft', 'a gentle squeak and swing with a little wobble'), ('rattly', 'a rattly metal slide with a wobble at the end'), ('cartoony', 'a cartoon "creeeak-boing" with a wobble')]),
    ('gate-close', 'Gate closing', 'The gate shuts when the plate is left.', 1.0, 2, 'A small iron garden gate swinging shut',
     [('soft', 'a soft clink'), ('rattly', 'a rattle and a clang'), ('cartoony', 'a cartoon "clang"')]),
    ('door-unlock', 'Door unlocking', 'The house door is unlocked with the spare key.', 1.2, 2, 'A key turning in an old front door lock',
     [('soft', 'a soft click-clack'), ('chunky', 'a chunky lock turning with a jingle of keys'), ('cartoony', 'a cartoon "ka-chunk" unlock with a sparkle')]),
    ('seesaw-creak', 'See-saw creak', 'The see-saw tips.', 1.2, 1, 'A wooden playground see-saw tipping',
     [('soft', 'a soft wooden creak'), ('squeaky', 'a squeaky metal-hinge creak'), ('cartoony', 'a cartoon "creeeak"')]),
    ('seesaw-thump', 'See-saw thump', 'The see-saw hits the ground.', 0.6, 1, 'A wooden see-saw end hitting the ground',
     [('soft', 'a soft wooden thump'), ('bouncy', 'a bouncy thump with a little rattle'), ('cartoony', 'a cartoon "ba-dump"')]),
    ('plank-creak', 'Plank creaking', 'Someone walks on a thin plank.', 1.2, 1, 'A thin wooden plank creaking under small feet',
     [('soft', 'a soft gentle creak'), ('wobbly', 'a wobbly, springy creak'), ('cartoony', 'a cartoon "eeeek" creak')]),
    ('plank-bend', 'Plank bending and sinking', 'The sister steps on a thin plank: it bends and sends her back.', 1.4, 1, 'A thin wooden plank bending down too far and dipping into water',
     [('soft', 'a long low creak and a small plop'), ('groany', 'a groaning creak and a splashy dip'), ('cartoony', 'a cartoon "boiiing" bend and a plop')]),
    ('boat-bob', 'Small boat bobbing', 'Someone steps into a small boat.', 1.6, 1, 'A small wooden rowing boat bobbing on calm water',
     [('soft', 'gentle lapping and a wooden knock'), ('wobbly', 'a wobble with sloshing water'), ('cartoony', 'a cartoon "bloop-bloop" bob')]),
    ('rope-pull', 'Rope pulled', 'The pulley lift goes up or down.', 1.2, 2, 'A thick rope pulled through a wooden pulley',
     [('soft', 'a soft rope creak'), ('squeaky', 'a squeaky pulley wheel and rope'), ('cartoony', 'a cartoon "zzzip" rope pull')]),
    ('ladder-down', 'Ladder rattling down', 'A rope ladder drops down.', 1.2, 2, 'A rope ladder with wooden rungs dropping down a wall',
     [('soft', 'soft wooden clatter'), ('rattly', 'a rattly unrolling clatter'), ('cartoony', 'a cartoon "clackety-clack" drop')]),
    ('lever-pull', 'Lever pulled', 'Someone pulls a lever.', 0.8, 1, 'An old iron lever pulled down',
     [('soft', 'a soft metal clunk'), ('clanky', 'a clanky ratchet and clunk'), ('cartoony', 'a cartoon "ker-chunk"')]),
    ('balloon-squeak', 'Balloon grabbed', 'The brother grabs the balloon in the park.', 0.8, 2, 'A rubber balloon squeaking as a small hand grabs it',
     [('soft', 'a soft rubbery squeak'), ('squeaky', 'a high squeaky rub'), ('cartoony', 'a cartoon "squeak-boing"')]),
]:
    add(id, 'objects', name, when, dur, pri, fx(what, takes))

# ---------------------------------------------------------------- F. Water and nature
for id, name, when, dur, pri, what, takes in [
    ('splash-big', 'Big splash', 'Someone falls into the canal.', 1.4, 1, 'A child falling into a calm canal',
     [('soft', 'a soft round splash'), ('splashy', 'a big playful splash with drips'), ('cartoony', 'a cartoon "ker-sploosh"')]),
    ('splash-small', 'Small splash', 'A box or a foot dips into water.', 0.8, 1, 'A small object dropping into water',
     [('soft', 'a small plop'), ('splashy', 'a little splash'), ('cartoony', 'a cartoon "plip"')]),
    ('ripples', 'Water ripples', 'Gentle water by the canal and the pond.', 3.0, 3, 'Calm water lapping gently against a stone canal wall',
     [('soft', 'very soft lapping'), ('bubbly', 'lapping with little bubbles'), ('cartoony', 'gentle cartoon water "blub-blub"')]),
    ('ducks', 'Ducks quacking', 'The ducks on the canal and the pond.', 1.5, 2, 'A friendly little duck quacking',
     [('soft', 'two soft quacks'), ('chatty', 'a chatty run of quacks'), ('cartoony', 'a cute cartoon quack-quack')]),
    ('birds-away', 'Birds fluttering away', 'Birds in the park fly off when someone runs past.', 1.5, 2, 'Small birds fluttering away',
     [('soft', 'soft wing flutters'), ('chirpy', 'flutters with a few chirps'), ('cartoony', 'a cartoon flappy take-off')]),
    ('leaves', 'Leaves rustling', 'Walking past bushes and trees in the park.', 1.5, 3, 'Leaves rustling in a bush',
     [('soft', 'a soft light rustle'), ('breezy', 'a breezy rustle'), ('cartoony', 'a playful cartoon rustle')]),
    ('dog-bark', 'Friendly dog bark', 'Saved for a later level (the park dog).', 1.0, 3, 'A small friendly puppy',
     [('soft', 'two soft happy woofs'), ('yappy', 'a playful yappy bark'), ('cartoony', 'a cartoon "arf-arf"')]),
]:
    add(id, 'nature', name, when, dur, pri, fx(what, takes))

# ---------------------------------------------------------------- G. Interface and rewards (music allowed here)
UI = 'cozy storybook game interface sound, no voices, no background noise'
for id, name, when, dur, pri, takes in [
    ('ui-play', '"Tap to play" button', 'The big play button on the start screen.', 1.5, 1,
     [('soft', 'a warm soft chime with a gentle whoosh, inviting'), ('bright', 'a bright magical sparkle and a pop'), ('cartoony', 'a bouncy cartoon "boing" with a glockenspiel twinkle')]),
    ('ui-tap', 'Button tap', 'Any small button.', 0.5, 1,
     [('soft', 'a soft wooden tap'), ('bright', 'a bright little pop'), ('cartoony', 'a cartoon "blip"')]),
    ('ui-stop', 'Map stop chosen', 'A stop is chosen on the chapter map.', 0.8, 1,
     [('soft', 'a soft paper tap with a tiny chime'), ('bright', 'a bright marimba note'), ('cartoony', 'a cartoon "plink"')]),
    ('ui-walk', 'Walking along the map', 'The siblings walk along the dashed path on the map.', 1.5, 2,
     [('soft', 'soft paper-like pitter-patter steps'), ('bright', 'little xylophone steps, tip-tip-tip'), ('cartoony', 'cartoon tiptoe steps')]),
    ('ui-unlock', 'Level unlocked', 'A new stop opens on the map (the padlock goes).', 1.5, 1,
     [('soft', 'a soft padlock click and a warm chime'), ('bright', 'a padlock pop and a sparkling rise'), ('cartoony', 'a cartoon "click-ta-da" with a twinkle')]),
    ('ui-locked', 'Locked stop tapped', 'Tapping a stop that is still locked.', 0.6, 2,
     [('soft', 'a soft low "bonk", gentle not harsh'), ('wobbly', 'a wobbly padlock rattle'), ('cartoony', 'a cartoon "boop-boop" no')]),
    ('ui-hint', 'Hint sparkle', 'The picture hint: the thing to use sparkles.', 1.2, 1,
     [('soft', 'a soft magical sparkle'), ('bright', 'a bright twinkly shimmer'), ('cartoony', 'a cartoon "ting-a-ling" sparkle')]),
    ('ui-solved', 'Puzzle solved jingle', 'A puzzle is solved.', 2.0, 1,
     [('soft', 'a short gentle three-note harp jingle, happy'), ('bright', 'a short glockenspiel success jingle, rising'), ('cartoony', 'a short cartoon xylophone "ta-da" jingle')]),
    ('ui-level', 'Level complete fanfare', 'The end card of a level.', 3.5, 1,
     [('soft', 'a short warm fanfare on harp and strings, proud and cozy'), ('bright', 'a short bright fanfare on glockenspiel and brass, cheerful'), ('cartoony', 'a short cartoon fanfare with kazoo and xylophone, funny')]),
    ('ui-chapter', 'Chapter complete celebration', 'The chapter card on the map, with confetti.', 4.0, 2,
     [('soft', 'a short warm celebration tune on harp, bells and soft strings'), ('bright', 'a short joyful celebration with bells, brass and a cymbal shimmer'), ('cartoony', 'a short cartoon celebration with party horns, xylophone and a pop of confetti')]),
]:
    add(id, 'interface', name, when, dur, pri, [(f, f'{how}, {UI}.') for f, how in takes])

# ---------------------------------------------------------------- extras the game uses (found in its code)
for id, cat, name, when, dur, what, takes in [
    ('cat-meow', 'nature', 'Cat meow', 'The cat sitting on a box in the park.', 1.0, 'A friendly little cat',
     [('soft', 'a soft sleepy meow'), ('chatty', 'a chatty "mrrp-meow"'), ('cartoony', 'a cute cartoon "mew"')]),
    ('bird-chirp', 'nature', 'Bird chirp', 'The little birds in the park.', 1.0, 'A small songbird',
     [('soft', 'two soft chirps'), ('chatty', 'a cheerful chirpy trill'), ('cartoony', 'a cartoon "tweet-tweet"')]),
    ('bell-ding', 'objects', 'Bell ding', 'The bell in the city (station 0) and the shop doors.', 1.5, 'A small brass bell',
     [('soft', 'one soft ding'), ('bright', 'a bright ring'), ('cartoony', 'a cartoon "ding-a-ling"')]),
    ('parasol-pop', 'objects', 'Parasols popping open', 'The cafe parasols open into steps (the toss station).', 0.8, 'A big cloth parasol popping open',
     [('soft', 'a soft fabric whump'), ('springy', 'a springy fabric pop'), ('cartoony', 'a cartoon "fwoomp-pop"')]),
    ('wind-mist', 'nature', 'Mist lifting', 'The mist lifts from the forest at the end of Chapter 1.', 3.0, 'A gentle magical wind',
     [('soft', 'a soft airy whoosh'), ('sparkly', 'a whoosh with a faint sparkle'), ('cartoony', 'a cartoon magical "fwoooosh"')]),
    ('door-creak', 'objects', 'Front door creaking open', 'The house\'s front door swings open.', 1.6, 'An old wooden front door creaking open',
     [('soft', 'a soft slow creak'), ('squeaky', 'a squeaky long creak'), ('cartoony', 'a cartoon "creeeak"')]),
    ('paper-rustle', 'objects', 'Letter rustling', 'Reading the parents\' letter in the house.', 1.0, 'A paper letter unfolded',
     [('soft', 'a soft paper rustle'), ('crisp', 'a crisp unfold'), ('cartoony', 'a cartoon "fwip" unfold')]),
    ('code-dial', 'objects', 'Code dial click', 'Turning the dials on Dad\'s box in the house.', 0.5, 'A small dial on a lockbox clicking round',
     [('soft', 'one soft click'), ('ratchet', 'a little ratchet click'), ('cartoony', 'a cartoon "tick"')]),
    ('cord-pull', 'objects', 'Light cord pulled', 'The brother pulls the light cord in the cupboard.', 0.6, 'A light-switch pull cord',
     [('soft', 'a soft click'), ('plinky', 'a click with a little plink'), ('cartoony', 'a cartoon "tink-click"')]),
]:
    add(id, cat, name, when, dur, 3, fx(what, takes))

BY_ID = {s['id']: s for s in S}
assert len(BY_ID) == len(S), 'two scenarios share an id'
assert all(len(s['takes']) == 3 for s in S)
