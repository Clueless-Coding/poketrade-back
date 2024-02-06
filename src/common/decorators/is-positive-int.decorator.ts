import { applyDecorators } from "@nestjs/common";
import { IsInt, IsPositive, ValidationOptions } from "class-validator";

export const IsPositiveInt = (validationOptions?: ValidationOptions) => {
  return applyDecorators(IsInt(validationOptions), IsPositive(validationOptions));
};
