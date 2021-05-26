import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';
import { Max, Min } from 'class-validator';

export const DEFAULT_OFFSET: number = 0;
export const DEFAULT_LIMIT: number = 20;

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

@ArgsType()
export class PaginationArgs {
    @Field((): typeof Int => Int)
    @Min(0)
    offset: number = DEFAULT_OFFSET;

    @Field((): typeof Int => Int)
    @Min(1)
    @Max(100)
    limit: number = DEFAULT_LIMIT;
}
