import * as migration_20260513_082836_initial from './20260513_082836_initial';
import * as migration_20260515_012004_add_s3_prefix_to_media from './20260515_012004_add_s3_prefix_to_media';
import * as migration_20260515_013117 from './20260515_013117';

export const migrations = [
  {
    up: migration_20260513_082836_initial.up,
    down: migration_20260513_082836_initial.down,
    name: '20260513_082836_initial',
  },
  {
    up: migration_20260515_012004_add_s3_prefix_to_media.up,
    down: migration_20260515_012004_add_s3_prefix_to_media.down,
    name: '20260515_012004_add_s3_prefix_to_media',
  },
  {
    up: migration_20260515_013117.up,
    down: migration_20260515_013117.down,
    name: '20260515_013117'
  },
];
