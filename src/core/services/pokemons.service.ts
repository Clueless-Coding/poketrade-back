import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePokemonEntityFields, PokemonEntity, PokemonModel } from 'src/infra/postgres/entities/pokemon.entity';
import { FindEntityRelationsOptions } from 'src/infra/postgres/other/types';
import { DeleteResult, FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class PokemonsService {
  public constructor(
    @InjectRepository(PokemonEntity)
    private readonly pokemonsRepository: Repository<PokemonEntity>,
  ) {}

  public async find<
    T extends FindEntityRelationsOptions<PokemonEntity> = {},
  >(
    where?: FindOptionsWhere<PokemonEntity>,
    relations?: T,
  ): Promise<Array<PokemonModel<T>>> {
    return this.pokemonsRepository.find({
      where,
      relations
    }) as Promise<Array<PokemonModel<T>>>;
  }

  private async create(...fields: Array<CreatePokemonEntityFields>): Promise<Array<PokemonModel>> {
    const pokemons = this.pokemonsRepository.create(fields);

    return this.pokemonsRepository.save(pokemons) as Promise<Array<PokemonModel>>;
  }

  public async createOne(fields: CreatePokemonEntityFields): Promise<PokemonModel> {
    return this.create(fields).then(([pokemon]) => pokemon!);
  }

  public async createMany(fields: Array<CreatePokemonEntityFields>): Promise<Array<PokemonModel>> {
    return this.create(...fields);
  }

  public async deleteAll(): Promise<DeleteResult> {
    return this.pokemonsRepository.delete({});
  }
}
