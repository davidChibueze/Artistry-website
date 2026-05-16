import * as migration_20260516_092657_initial from './20260516_092657_initial';
import * as migration_20260516_112302_add_about_background_image from './20260516_112302_add_about_background_image';

export const migrations = [
  {
    up: migration_20260516_092657_initial.up,
    down: migration_20260516_092657_initial.down,
    name: '20260516_092657_initial',
  },
  {
    up: migration_20260516_112302_add_about_background_image.up,
    down: migration_20260516_112302_add_about_background_image.down,
    name: '20260516_112302_add_about_background_image'
  },
];
