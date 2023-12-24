import { applyDecorators } from "@nestjs/common";
import { IsInt, IsPositive } from "class-validator";

export const IsPositiveInt = () => {
  return applyDecorators(IsInt(), IsPositive());
};
