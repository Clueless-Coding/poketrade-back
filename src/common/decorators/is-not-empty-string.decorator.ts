import { applyDecorators } from "@nestjs/common";
import { IsNotEmpty, IsString } from "class-validator";

export const IsNotEmptyString = () => {
  return applyDecorators(IsString(), IsNotEmpty());
};
