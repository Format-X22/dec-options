import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

@ObjectType()
export class Pagination {
    @Field()
    offset: number;

    @Field()
    limit: number;

    @Field()
    total: number;
}

export class ListDto<TItem> {
    @ApiProperty({ type: Object, isArray: true, description: 'Any data object' })
    data: Array<TItem>;
    pagination: Pagination;
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

export class Paginated<T> {
    data: Array<T>;
    pagination: Pagination;
}

export function makePaginated<T>(classRef: Type<T>): Type<Paginated<T>> {
    @ObjectType(`${classRef.name}List`, { isAbstract: true })
    class GQLPaginatedType extends Paginated<T> {
        @Field((): Array<typeof classRef> => [classRef])
        data: Array<T>;

        @Field((): typeof Pagination => Pagination)
        pagination: Pagination;
    }

    return GQLPaginatedType;
}
