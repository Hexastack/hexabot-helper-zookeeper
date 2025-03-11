/*
 * Copyright © 2024 Hexastack. All rights reserved.
 *
 * Licensed under the GNU Affero General Public License v3.0 (AGPLv3) with the following additional terms:
 * 1. The name "Hexabot" is a trademark of Hexastack. You may not use this name in derivative works without express written permission.
 * 2. All derivative works must include clear attribution to the original creator and software, Hexastack and Hexabot, in a prominent location (e.g., in the software's "About" section, documentation, and README file).
 */

import { HelperSetting } from '@/helper/types';
import { SettingType } from '@/setting/schemas/types';

export const ZOOKEEPER_HELPER_NAME = 'zookeeper-helper' as const;

export const ZOOKEEPER_HELPER_NAMESPACE = 'zookeeper_helper' as const;

export default [
  {
    group: ZOOKEEPER_HELPER_NAMESPACE,
    label: 'endpoint',
    value: 'zoo1',
    type: SettingType.text,
  },
  {
    group: ZOOKEEPER_HELPER_NAMESPACE,
    label: 'port',
    value: 2181,
    type: SettingType.number,
    config: {
      min: 1,
      max: 65535,
      step: '1',
    },
  },
  {
    group: ZOOKEEPER_HELPER_NAMESPACE,
    label: 'timeout',
    value: 5000,
    type: SettingType.number,
    config: {
      min: 0,
      max: 1000 * 60 * 5,
      step: '1',
    },
  },
  {
    group: ZOOKEEPER_HELPER_NAMESPACE,
    label: 'path',
    value: 'master',
    type: SettingType.text,
  },
  {
    group: ZOOKEEPER_HELPER_NAMESPACE,
    label: 'isHostOrderDeterministic',
    value: false,
    type: SettingType.checkbox,
  },
] as const satisfies HelperSetting<typeof ZOOKEEPER_HELPER_NAME>[];
