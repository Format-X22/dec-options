import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export class ListDto<TItem> {
    @ApiProperty({ type: Object, isArray: true })
    data: Array<TItem>;
}

export function makeListDtoApi(itemsType: Parameters<typeof getSchemaPath>[0]): { schema: SchemaObject } {
    return {
        schema: {
            allOf: [
                { $ref: getSchemaPath(ListDto) },
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: { $ref: getSchemaPath(itemsType) },
                        },
                    },
                },
            ],
        },
    };
}
