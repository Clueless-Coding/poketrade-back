import { Injectable } from '@nestjs/common';
import { IPacksToPokemonsRepository } from '../repositories/packs-to-pokemons.repository';
import { UUIDv4 } from 'src/common/types';
import { PaginationOptionsInputDTO } from 'src/api/dtos/pagination.input.dto';

@Injectable()
export class PacksToPokemonsService {
  public constructor(
    private readonly packsToPokemonsRepository: IPacksToPokemonsRepository,
  ) {}

  public async getPacksToPokemonsWithPaginationByPackId(
    packId: UUIDv4,
    paginationOptionsDTO: PaginationOptionsInputDTO,
  ) {
    return this.packsToPokemonsRepository.findPacksToPokemonsWithPagination({
      where: { packId },
      paginationOptions: paginationOptionsDTO,
    });
  }
}
