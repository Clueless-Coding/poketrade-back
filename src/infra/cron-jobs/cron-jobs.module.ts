import { Module } from '@nestjs/common';
import { CronJobsService } from './cron-jobs.service';
import { UserRefreshTokensModule } from '../ioc/core-modules/user-refresh-tokens.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot(), UserRefreshTokensModule],
  providers: [CronJobsService],
})
export class CronJobsModule {}
