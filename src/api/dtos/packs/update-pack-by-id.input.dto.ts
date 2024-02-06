import { PartialType } from '@nestjs/swagger';
import { CreatePackInputDTO } from './create-pack.input.dto';

export class UpdatePackByIdInputDTO extends PartialType(CreatePackInputDTO) {}
