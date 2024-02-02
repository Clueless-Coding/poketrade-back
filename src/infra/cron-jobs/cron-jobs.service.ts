import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UserRefreshTokensService } from 'src/core/services/user-refresh-tokens.service';

@Injectable()
export class CronJobsService {
  public constructor(
    private readonly userRefreshTokensService: UserRefreshTokensService,
  ) {}

  @Cron('0 0 * * *')
  private async deleteExpiredUserRefreshTokens(): Promise<void> {
    await this.userRefreshTokensService.deleteExpiredUserRefreshTokens();
  }
}
