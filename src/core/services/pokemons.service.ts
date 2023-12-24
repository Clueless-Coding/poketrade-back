import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePokemonInputDTO } from 'src/api/dtos/pokemons/create-pokemon.input.dto';
import { PokemonEntity, PokemonModel } from 'src/infra/postgres/entities/pokemon.entity';
import { DeleteResult, FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class PokemonsService {
  public constructor(
    @InjectRepository(PokemonEntity)
    private readonly pokemonsRepository: Repository<PokemonEntity>,
  ) {}

  public async find<
    T extends FindOptionsRelations<PokemonEntity> = {},
  >(
    where?: FindOptionsWhere<PokemonEntity<T>>,
    relations?: T,
  ): Promise<Array<PokemonModel<T>>> {
    return this.pokemonsRepository.find({
      where,
      relations
    }) as Promise<Array<PokemonModel<T>>>;
  }

  private async create(...dtos: Array<CreatePokemonInputDTO>): Promise<Array<PokemonModel>> {
    const pokemons = this.pokemonsRepository.create(dtos);

    return this.pokemonsRepository.save(pokemons) as Promise<Array<PokemonModel>>;
  }

  public async createOne(dto: CreatePokemonInputDTO): Promise<PokemonModel> {
    return this.create(dto).then(([pokemon]) => pokemon!);
  }

  public async createMany(dtos: Array<CreatePokemonInputDTO>): Promise<Array<PokemonModel>> {
    return this.create(...dtos);
  }

  public async deleteAll(): Promise<DeleteResult> {
    return this.pokemonsRepository.delete({});
  }
}
