import { Param, ParseUUIDPipe } from '@nestjs/common';

export const UUIDv4Param = (property: string) => Param(property, new ParseUUIDPipe({ version: '4' }));
