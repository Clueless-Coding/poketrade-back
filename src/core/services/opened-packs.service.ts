import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OpenedPackEntity, OpenedPackModel } from 'src/infra/postgres/entities/opened-pack.entity';
import { PackModel } from 'src/infra/postgres/entities/pack.entity';
import { PokemonModel } from 'src/infra/postgres/entities/pokemon.entity';
import { UserModel } from 'src/infra/postgres/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OpenedPacksService {
  public constructor(
    @InjectRepository(OpenedPackEntity)
    private readonly openedPacksRepository: Repository<OpenedPackEntity>,
  ) {}

  public async createOne(
    user: UserModel,
    pack: PackModel,
    pokemon: PokemonModel,
  ): Promise<OpenedPackModel<{ user: true, pack: true, pokemon: true }>> {
    const openedPack = this.openedPacksRepository.create({
      user,
      pack,
      pokemon,
    });

    return this.openedPacksRepository.save(openedPack);
  }
}
