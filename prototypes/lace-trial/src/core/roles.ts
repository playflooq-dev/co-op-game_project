import type { Role, Seat } from './types.ts';

/** Seat 0 is the Pin on the first level, and the tools swap every level after that. */
export function roleFor(seat: Seat, levelIndex: number): Role {
  return (seat + levelIndex) % 2 === 0 ? 'pin' : 'bobbin';
}

export const ROLE_NAMES: Readonly<Record<Role, string>> = {
  pin: 'the Pin',
  bobbin: 'the Bobbin',
};
