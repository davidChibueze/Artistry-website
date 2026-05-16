import * as migration_20260516_092657_initial from './20260516_092657_initial';

export const migrations = [
  {
    up: migration_20260516_092657_initial.up,
    down: migration_20260516_092657_initial.down,
    name: '20260516_092657_initial'
  },
];
