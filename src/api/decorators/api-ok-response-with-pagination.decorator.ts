import { applyDecorators, Type } from '@nestjs/common'
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger'

const metaProperties = [
  'itemCount',
  'itemsPerPage',
  'currentPage',
  'totalPages',
  'totalItems',
];

export const ApiOkResponseWithPagination = ({ type }: { type: Type<unknown> }) => {
  return applyDecorators(
    ApiExtraModels(type),
    ApiOkResponse({
      schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              $ref: getSchemaPath(type),
            }
          },
          meta: {
            type: 'object',
            properties: metaProperties.reduce(
              (acc, x) => ({...acc, [x]: { type: 'number' }}),
              {},
            ),
            required: metaProperties,
          },
        },
        required: ['items', 'meta'],
      },
    }));
}
