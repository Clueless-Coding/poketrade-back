import { seeder } from "nestjs-seeder";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PokemonsSeeder } from "./pokemons.seeder";
import { PostgresModule } from "../postgres.module";
import { ConfigModule } from "@nestjs/config";
import { validate } from '../../config/validation';
import { PokemonEntity } from "../entities/pokemon.entity";

seeder({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    PostgresModule,
    TypeOrmModule.forFeature([PokemonEntity]),
  ],
}).run([PokemonsSeeder]);
