export type SlotSource =
  | { type: 'group_winner'; group: string }        // 1st place in group
  | { type: 'group_runner_up'; group: string }     // 2nd place in group
  | { type: 'best_third'; groups: string[] }       // best 3rd from these groups
  | { type: 'match_winner'; matchNumber: number }; // Winner of a previous match

export interface KnockoutSlot {
  matchNumber: number;
  slot1: SlotSource;
  slot2: SlotSource;
}

export const ALL_KNOCKOUT_SLOTS: KnockoutSlot[] = [
  // Round of 32 (73-88)
  { matchNumber: 73, slot1: { type: 'group_runner_up', group: 'A' }, slot2: { type: 'group_runner_up', group: 'B' } },
  { matchNumber: 74, slot1: { type: 'group_winner', group: 'C' },    slot2: { type: 'group_runner_up', group: 'F' } },
  { matchNumber: 75, slot1: { type: 'group_winner', group: 'E' },    slot2: { type: 'best_third', groups: ['A','B','C','D','F'] } },
  { matchNumber: 76, slot1: { type: 'group_winner', group: 'F' },    slot2: { type: 'group_runner_up', group: 'C' } },
  { matchNumber: 77, slot1: { type: 'group_runner_up', group: 'E' }, slot2: { type: 'group_runner_up', group: 'I' } },
  { matchNumber: 78, slot1: { type: 'group_winner', group: 'I' },    slot2: { type: 'best_third', groups: ['C','D','F','G','H'] } },
  { matchNumber: 79, slot1: { type: 'group_winner', group: 'A' },    slot2: { type: 'best_third', groups: ['C','E','F','H','I'] } },
  { matchNumber: 80, slot1: { type: 'group_winner', group: 'L' },    slot2: { type: 'best_third', groups: ['E','H','I','J','K'] } },
  { matchNumber: 81, slot1: { type: 'group_winner', group: 'G' },    slot2: { type: 'best_third', groups: ['A','E','H','I','J'] } },
  { matchNumber: 82, slot1: { type: 'group_winner', group: 'D' },    slot2: { type: 'best_third', groups: ['B','E','F','I','J'] } },
  { matchNumber: 83, slot1: { type: 'group_winner', group: 'H' },    slot2: { type: 'group_runner_up', group: 'J' } },
  { matchNumber: 84, slot1: { type: 'group_runner_up', group: 'K' }, slot2: { type: 'group_runner_up', group: 'L' } },
  { matchNumber: 85, slot1: { type: 'group_winner', group: 'B' },    slot2: { type: 'best_third', groups: ['E','F','G','I','J'] } },
  { matchNumber: 86, slot1: { type: 'group_runner_up', group: 'D' }, slot2: { type: 'group_runner_up', group: 'G' } },
  { matchNumber: 87, slot1: { type: 'group_winner', group: 'J' },    slot2: { type: 'group_runner_up', group: 'H' } },
  { matchNumber: 88, slot1: { type: 'group_winner', group: 'K' },    slot2: { type: 'best_third', groups: ['D','E','I','J','L'] } },

  // Round of 16 (89-96)
  { matchNumber: 89, slot1: { type: 'match_winner', matchNumber: 73 }, slot2: { type: 'match_winner', matchNumber: 74 } },
  { matchNumber: 90, slot1: { type: 'match_winner', matchNumber: 75 }, slot2: { type: 'match_winner', matchNumber: 76 } },
  { matchNumber: 91, slot1: { type: 'match_winner', matchNumber: 77 }, slot2: { type: 'match_winner', matchNumber: 78 } },
  { matchNumber: 92, slot1: { type: 'match_winner', matchNumber: 79 }, slot2: { type: 'match_winner', matchNumber: 80 } },
  { matchNumber: 93, slot1: { type: 'match_winner', matchNumber: 81 }, slot2: { type: 'match_winner', matchNumber: 82 } },
  { matchNumber: 94, slot1: { type: 'match_winner', matchNumber: 83 }, slot2: { type: 'match_winner', matchNumber: 84 } },
  { matchNumber: 95, slot1: { type: 'match_winner', matchNumber: 85 }, slot2: { type: 'match_winner', matchNumber: 86 } },
  { matchNumber: 96, slot1: { type: 'match_winner', matchNumber: 87 }, slot2: { type: 'match_winner', matchNumber: 88 } },

  // Quarter-Finals (97-100)
  { matchNumber: 97, slot1: { type: 'match_winner', matchNumber: 89 }, slot2: { type: 'match_winner', matchNumber: 90 } },
  { matchNumber: 98, slot1: { type: 'match_winner', matchNumber: 91 }, slot2: { type: 'match_winner', matchNumber: 92 } },
  { matchNumber: 99, slot1: { type: 'match_winner', matchNumber: 93 }, slot2: { type: 'match_winner', matchNumber: 94 } },
  { matchNumber: 100, slot1: { type: 'match_winner', matchNumber: 95 }, slot2: { type: 'match_winner', matchNumber: 96 } },

  // Semi-Finals (101-102)
  { matchNumber: 101, slot1: { type: 'match_winner', matchNumber: 97 }, slot2: { type: 'match_winner', matchNumber: 98 } },
  { matchNumber: 102, slot1: { type: 'match_winner', matchNumber: 99 }, slot2: { type: 'match_winner', matchNumber: 100 } },

  // Final (103)
  { matchNumber: 103, slot1: { type: 'match_winner', matchNumber: 101 }, slot2: { type: 'match_winner', matchNumber: 102 } },
];

export function getSlotLabel(source: SlotSource): string {
  switch (source.type) {
    case 'group_winner':
      return `Winner Group ${source.group}`;
    case 'group_runner_up':
      return `Runner-up Group ${source.group}`;
    case 'best_third':
      return `Best 3rd (${source.groups.join('/')})`;
    case 'match_winner':
      return `Winner Match ${source.matchNumber}`;
    default:
      return 'TBD';
  }
}
