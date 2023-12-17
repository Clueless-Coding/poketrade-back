import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PokemonEntity } from 'src/infra/postgres/entities/pokemon.entity';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class PokemonsService {
  public constructor(
    @InjectRepository(PokemonEntity)
    private readonly pokemonsRepository: Repository<PokemonEntity>,
  ) {}

  public async find(where?: FindOptionsWhere<PokemonEntity>): Promise<PokemonEntity[]> {
    return this.pokemonsRepository.find({ where });
  }
}
