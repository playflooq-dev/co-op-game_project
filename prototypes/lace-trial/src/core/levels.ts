import type { LevelDef } from './types.ts';

/**
 * The three trial levels of the lace world.
 * Each adds one idea: a single turn, an agreed order of turns, then reusing pins.
 */
export const LACE_LEVELS: readonly LevelDef[] = [
  {
    id: 'lace-1',
    title: 'One corner',
    cols: 5,
    rows: 5,
    pattern: [
      { x: 1, y: 4 },
      { x: 1, y: 1 },
      { x: 4, y: 1 },
    ],
    pins: 1,
    hints: {
      bobbin: 'You can see the pattern. Point at the corner so your partner can pin it, then lay the thread along the pattern.',
      pin: 'Your partner can see the pattern, you only see holes. Place your pin where they point.',
    },
  },
  {
    id: 'lace-2',
    title: 'Zigzag',
    cols: 5,
    rows: 6,
    pattern: [
      { x: 0, y: 5 },
      { x: 0, y: 3 },
      { x: 2, y: 3 },
      { x: 2, y: 1 },
      { x: 4, y: 1 },
    ],
    pins: 3,
    hints: {
      bobbin: 'Three corners this time. The thread can only turn where a pin is waiting.',
      pin: 'You have three pins. Agree with your partner on where each one goes.',
    },
  },
  {
    id: 'lace-3',
    title: 'Not enough pins',
    cols: 5,
    rows: 7,
    pattern: [
      { x: 0, y: 6 },
      { x: 0, y: 4 },
      { x: 2, y: 4 },
      { x: 2, y: 2 },
      { x: 4, y: 2 },
      { x: 4, y: 0 },
    ],
    pins: 2,
    hints: {
      bobbin: 'Four corners, but only two pins. Go one corner at a time and tell your partner when you have moved on.',
      pin: 'Only two pins. Once the thread has turned around a pin and moved on, tap that pin to take it out and use it again.',
    },
  },
];
