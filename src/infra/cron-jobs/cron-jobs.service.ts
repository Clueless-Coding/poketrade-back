import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IUserRefreshTokensRepository } from 'src/core/repositories/user-refresh-tokens.repository';

@Injectable()
export class CronJobsService {
  public constructor(
    private readonly userRefreshTokensRepository: IUserRefreshTokensRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async deleteExpiredUserRefreshTokens(): Promise<void> {
    await this.userRefreshTokensRepository.deleteExpiredUserRefreshTokens();
  }
}
