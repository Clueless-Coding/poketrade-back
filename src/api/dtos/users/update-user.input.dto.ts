import { PartialType } from '@nestjs/swagger';
import { CreateUserInputDTO } from './create-user.input.dto';
import { IsOptional } from 'class-validator';
import { IsPositiveInt } from 'src/common/decorators/is-positive-int.decorator';

export class UpdateUserInputDTO extends PartialType(CreateUserInputDTO) {
  @IsPositiveInt()
  @IsOptional()
  public readonly balance?: number;
}
