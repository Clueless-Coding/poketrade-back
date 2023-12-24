import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Nullable } from 'src/common/types';
import { PackEntity, PackModel } from 'src/infra/postgres/entities/pack.entity';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class PacksService {
  public constructor(
    @InjectRepository(PackEntity)
    private readonly packsRepository: Repository<PackEntity>,
  ) {}

  public async find<
    T extends FindOptionsRelations<PackEntity> = {},
  >(
    where?: FindOptionsWhere<PackEntity<T>>,
    relations?: T,
  ): Promise<Array<PackModel<T>>> {
    return this.packsRepository.find({
      where,
      relations,
    }) as Promise<Array<PackModel<T>>>;
  }

  public async findOne<
    T extends FindOptionsRelations<PackEntity> = {},
  >(
    where?: FindOptionsWhere<PackEntity<T>>,
    relations?: T,
  ): Promise<Nullable<PackModel<T>>> {

    return this.packsRepository.findOne({
      where,
      relations,
    }) as Promise<Nullable<PackModel<T>>>;
  }
}
