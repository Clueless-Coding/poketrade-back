import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Nullable } from 'src/common/types';
import { PackEntity, PackEntityRelations, PackModel } from 'src/infra/postgres/entities/pack.entity';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class PacksService {
  public constructor(
    @InjectRepository(PackEntity)
    private readonly packsRepository: Repository<PackEntity>,
  ) {}

  public async findOne<T extends PackEntityRelations = never>(
    where: FindOptionsWhere<PackEntity>,
    relations: Array<T> = [],
  ): Promise<Nullable<PackModel<T>>> {

    return this.packsRepository.findOne({
      where,
      relations,
    }) as Promise<Nullable<PackModel<T>>>;
  }
}
