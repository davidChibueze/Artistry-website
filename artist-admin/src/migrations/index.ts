import * as migration_20260513_082836_initial from './20260513_082836_initial';
import * as migration_20260515_012004_add_s3_prefix_to_media from './20260515_012004_add_s3_prefix_to_media';
import * as migration_20260515_013117 from './20260515_013117';
import * as migration_20260515_043358_linktree_on_artist_profile from './20260515_043358_linktree_on_artist_profile';
import * as migration_20260516_071527 from './20260516_071527';
import * as migration_20260516_085527_artist_stream_url from './20260516_085527_artist_stream_url';

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
    name: '20260515_013117',
  },
  {
    up: migration_20260515_043358_linktree_on_artist_profile.up,
    down: migration_20260515_043358_linktree_on_artist_profile.down,
    name: '20260515_043358_linktree_on_artist_profile',
  },
  {
    up: migration_20260516_071527.up,
    down: migration_20260516_071527.down,
    name: '20260516_071527',
  },
  {
    up: migration_20260516_085527_artist_stream_url.up,
    down: migration_20260516_085527_artist_stream_url.down,
    name: '20260516_085527_artist_stream_url'
  },
];
