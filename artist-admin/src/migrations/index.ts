import * as migration_20260513_082836_initial from './20260513_082836_initial';

export const migrations = [
  {
    up: migration_20260513_082836_initial.up,
    down: migration_20260513_082836_initial.down,
    name: '20260513_082836_initial'
  },
];
