# Standing rules for work on this project

This is a 2-player co-op puzzle game that runs in a web browser (the folder `game/`). These rules hold in every
session. If a brief from the user says something different, the brief wins for that session.

## At the start of a session

1. Read [DECISIONS.md](DECISIONS.md), [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md), [PROGRESSION.md](PROGRESSION.md),
   [PROJECT_STATUS.md](PROJECT_STATUS.md) and [CHECKPOINTS.md](CHECKPOINTS.md).
2. Run `git status`. If there are uncommitted changes you did not make, stop and show them to the user. Do not stash,
   discard or commit them without asking.

## Branches and commits

- Never work directly on `main`. Make a branch for each task, from `main` or from the branch the user names:
  `level-N/<name>` for a level, `fix/<name>` for a fix, `docs/<name>` for documents.
- Commit after each meaningful step, with a clear, plain message that says what changed and why.
- Never rewrite history: no rebase of shared work, no amending pushed commits, no forced push, no
  `git reset --hard`. To undo something, use `git revert`.
- Never delete a branch or a tag without asking.

## Keeping the documents true

- When the user or the client approves something, move it from "Proposed" to the approved tables in DECISIONS.md with
  the date, add a line to the decision log, and remove it from OPEN_QUESTIONS.md. A decision that replaces an older
  one does not delete it: mark the old one "Replaced on <date> by decision N".
- When a feature or a level is finished, update `game/README.txt`, `game/worlds/README.md`, PROJECT_STATUS.md,
  OPEN_QUESTIONS.md and CHECKPOINTS.md in the same branch, before reporting back.
- Check facts against the game's code and the test results, not against older documents.
- Write the documents in plain, simple English that the client can read. PROJECT_STATUS.md is written for the client.
- Do not change game design decisions on your own. Write the idea under "Proposed" in DECISIONS.md, or as a question
  in OPEN_QUESTIONS.md, and say so in your report.

## When a version is approved

1. Merge the branch into `main` with `git merge --no-ff`.
2. Make an annotated checkpoint tag on `main`: `git tag -a checkpoint-YYYY-MM-DD-<short-name> -m "<what it holds>"`.
3. Update CHECKPOINTS.md: the checkpoints table, the list of commits, and the web address if there is one.
4. Push `main`, the branch and the tags.

Only push when the user says the work is approved, or asks for a push. The same goes for putting a version on the
web: only when asked.

## Before saying something is done

- Run the scripted tests in `game/tools/` for every level the change could touch: a play-through and a solo test
  (`?solo=1`) for each of the park, the city and the canal, the chapter test, the house test and the characters
  check. How to run them is in [game/worlds/README.md](game/worlds/README.md), "Repainting and testing". A change to
  anything in `game/shared/` touches every level.
- Say plainly what was tested and what was not. The scripts press keys; they are not real players.

## Standing constraints (from DECISIONS.md and the user's briefs)

- Nothing in the game needs reading. No lives, no game over, nobody can get stuck: no dead ends.
- Every puzzle needs both siblings, and neither one only waits.
- Each level keeps its own folder in `game/worlds/`; what levels share is in `game/shared/`.
- No build step and no heavy libraries: double-clicking an HTML file must work. Free CC0 art, music and sounds only.
- One new idea per level, then combinations of known tools (PROGRESSION.md).
