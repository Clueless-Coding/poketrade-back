import { Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Nullable } from 'src/common/types';
import { PackEntity as PackEntityDrizzle, PokemonEntity as PokemonEntityDrizzle } from 'src/infra/postgres/other/types';
import { InjectDrizzle } from 'src/infra/postgres/postgres.module';
import { BaseService } from './base.service';
import * as tables from 'src/infra/postgres/tables';
import { packPokemons, pokemons } from 'src/infra/postgres/tables';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class PacksService extends BaseService<'packs'> {
  public constructor(
    @InjectDrizzle()
    drizzle: NodePgDatabase<typeof tables>,
  ) {
    super('packs', drizzle);
  }

  public async findRandomPokemonFromPack(
    pack: PackEntityDrizzle
  ): Promise<Nullable<PokemonEntityDrizzle>> {
    // TODO: Check the sql of the query
    // const sqlQuery = this.drizzle
    //   .select({ pokemon: pokemons })
    //   .from(this.table)
    //   .innerJoin(packPokemons, eq(packPokemons.packId, this.table.id))
    //   .innerJoin(pokemons, eq(pokemons.id, packPokemons.pokemonId))
    //   .orderBy(sql`random()`)
    //   .limit(1)
    //   .getSQL();

    return this.drizzle
      .select({ pokemon: pokemons })
      .from(this.table)
      .innerJoin(packPokemons, eq(packPokemons.packId, this.table.id))
      .innerJoin(pokemons, eq(pokemons.id, packPokemons.pokemonId))
      .where(eq(this.table.id, pack.id))
      .orderBy(sql<number>`random()`)
      .limit(1)
      .then(([result]) => result?.pokemon ?? null);
  }
}
