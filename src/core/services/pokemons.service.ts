import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePokemonInputDTO } from 'src/api/dtos/pokemons/create-pokemon.input.dto';
import { PokemonEntity, PokemonModel } from 'src/infra/postgres/entities/pokemon.entity';
import { DeleteResult, FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class PokemonsService {
  public constructor(
    @InjectRepository(PokemonEntity)
    private readonly pokemonsRepository: Repository<PokemonEntity>,
  ) {}

  public async find(where?: FindOptionsWhere<PokemonEntity>): Promise<Array<PokemonModel>> {
    return this.pokemonsRepository.find({ where });
  }

  private async create(...dtos: Array<CreatePokemonInputDTO>): Promise<Array<PokemonModel>> {
    const pokemons = this.pokemonsRepository.create(dtos);

    return this.pokemonsRepository.save(pokemons);
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
