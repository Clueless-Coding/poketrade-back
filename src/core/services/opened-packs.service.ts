import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOpenedPackEntityFields, OpenedPackEntity, OpenedPackModel } from 'src/infra/postgres/entities/opened-pack.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OpenedPacksService {
  public constructor(
    @InjectRepository(OpenedPackEntity)
    private readonly openedPacksRepository: Repository<OpenedPackEntity>,
  ) {}

  public async createOne(
    fields: CreateOpenedPackEntityFields,
  ): Promise<OpenedPackModel<{ user: true, pack: true, pokemon: true }>> {
    const openedPack = this.openedPacksRepository.create(fields);

    return this.openedPacksRepository.save(openedPack);
  }
}
