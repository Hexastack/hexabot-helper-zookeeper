/*
 * Copyright © 2025 Hexastack. All rights reserved.
 *
 * Licensed under the GNU Affero General Public License v3.0 (AGPLv3) with the following additional terms:
 * 1. The name "Hexabot" is a trademark of Hexastack. You may not use this name in derivative works without express written permission.
 * 2. All derivative works must include clear attribution to the original creator and software, Hexastack and Hexabot, in a prominent location (e.g., in the software's "About" section, documentation, and README file).
 */

import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { default as zookeeper, default as ZooKeeperPromise } from 'zookeeper';

import { HelperService } from '@/helper/helper.service';
import BaseHelper from '@/helper/lib/base-helper';
import { HelperType } from '@/helper/types';
import { LoggerService } from '@/logger/logger.service';
import { SettingService } from '@/setting/services/setting.service';

import { ZOOKEEPER_HELPER_NAME } from './settings';

@Injectable()
export default class ZookeeperHelper
  extends BaseHelper<typeof ZOOKEEPER_HELPER_NAME>
  implements OnApplicationBootstrap
{
  protected readonly type: HelperType = HelperType.UTIL;

  private client: ZooKeeperPromise;

  private isLeaderFlag = false;

  constructor(
    settingService: SettingService,
    helperService: HelperService,
    logger: LoggerService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super(ZOOKEEPER_HELPER_NAME, settingService, helperService, logger);
  }

  getPath() {
    return __dirname;
  }

  private async initClient() {
    const { endpoint, port, timeout, isHostOrderDeterministic } =
      await this.getSettings();
    if (!this.client) {
      this.logger.log('Called constructor');
      this.client = new zookeeper({
        connect: `${endpoint}:${port}`,
        timeout,
        debug_level: zookeeper.ZOO_LOG_LEVEL_WARN,
        host_order_deterministic: isHostOrderDeterministic,
      });

      this.client.connect(
        async (error: any) => {
          if (error) {
            this.logger.error('Zookeeper connection failed', error);
            return;
          }
          this.logger.log('✅ Connected to Zookeeper');
          await this.attemptToBecomeLeader();
        },
        () => {},
      );
    }
  }

  /**
   * Tries to become the leader by creating an ephemeral node.
   */
  private async attemptToBecomeLeader() {
    const { path } = await this.getSettings();

    return new Promise((resolve, reject) => {
      this.client?.a_create(
        `/${path}`,
        'I am the master',
        zookeeper.ZOO_EPHEMERAL,
        (rc: number, error: any, _path: string) => {
          if (rc === 0) {
            this.logger.log('🎉 This server is now the MASTER!');
            this.isLeaderFlag = true;
            // emit event to re-run logic in case of crash while running cron job, seeding db, running migrations
            this.eventEmitter.emit('hook:zookeeper_helper:leaderElected', true);
            resolve({ success: true });
          } else if (rc === zookeeper.ZNODEEXISTS) {
            this.logger.log(
              '🔹 Master already exists. Watching for changes...',
            );
            this.isLeaderFlag = false;
            this.watchMaster();
            resolve({ success: true });
          } else {
            this.logger.error('❌ Error while creating master node:', error);
            reject(error);
          }
        },
      );
    });
  }

  /**
   * Watches the master node for deletion using `w_exists()`.
   */
  private async watchMaster() {
    const { path } = await this.getSettings();

    this.client?.w_exists(
      `/${path}`,
      async (rc: number, error: any, stat: any) => {
        if (rc === 0 && stat) {
          this.logger.log('👀 Watching master node for deletion...');
        } else {
          this.logger.log('⚠️ No master found. Trying to become master...');
          await this.attemptToBecomeLeader();
        }
      },
    );
  }

  async onApplicationBootstrap() {
    await this.initClient();
  }

  @OnEvent('hook:zookeeper_helper:*')
  public async handleSettingUpdate() {
    await this.initClient();
  }

  /**
   * Checks if this instance is the leader.
   */
  public isLeader(): boolean {
    return this.isLeaderFlag;
  }
}
