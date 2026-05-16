import * as migration_20260516_092657_initial from './20260516_092657_initial';
import * as migration_20260516_112302_add_about_background_image from './20260516_112302_add_about_background_image';
import * as migration_20260516_114038_add_hero_release_to_site_settings from './20260516_114038_add_hero_release_to_site_settings';

export const migrations = [
  {
    up: migration_20260516_092657_initial.up,
    down: migration_20260516_092657_initial.down,
    name: '20260516_092657_initial',
  },
  {
    up: migration_20260516_112302_add_about_background_image.up,
    down: migration_20260516_112302_add_about_background_image.down,
    name: '20260516_112302_add_about_background_image',
  },
  {
    up: migration_20260516_114038_add_hero_release_to_site_settings.up,
    down: migration_20260516_114038_add_hero_release_to_site_settings.down,
    name: '20260516_114038_add_hero_release_to_site_settings'
  },
];
