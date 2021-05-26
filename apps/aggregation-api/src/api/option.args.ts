import { ArgsType, Field, registerEnumType } from '@nestjs/graphql';
import { PaginationArgs } from '@app/shared/list.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';
import { EOptionType } from '@app/shared/option.schema';

export enum ESortDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}
registerEnumType(ESortDirection, { name: 'SortDirection' });

@ArgsType()
export class OptionListArgs extends PaginationArgs {
    @Field((): typeof EMarketKey => EMarketKey, { nullable: true })
    @IsOptional()
    @IsEnum(EMarketKey)
    filterByMarket?: EMarketKey;

    @Field((): typeof EMarketType => EMarketType, { nullable: true })
    @IsOptional()
    @IsEnum(EMarketType)
    filterByMarketType?: EMarketType;

    @Field((): typeof EOptionType => EOptionType, { nullable: true })
    @IsOptional()
    @IsEnum(EOptionType)
    filterByType?: EOptionType;

    @Field((): typeof ESortDirection => ESortDirection, { nullable: true })
    @IsOptional()
    @IsEnum(ESortDirection)
    sortByMarket?: ESortDirection;

    @Field((): typeof ESortDirection => ESortDirection, { nullable: true })
    @IsOptional()
    @IsEnum(ESortDirection)
    sortByMarketType?: ESortDirection;

    @Field((): typeof ESortDirection => ESortDirection, { nullable: true })
    @IsOptional()
    @IsEnum(ESortDirection)
    sortByType?: ESortDirection;

    @Field((): typeof ESortDirection => ESortDirection, { nullable: true })
    @IsOptional()
    @IsEnum(ESortDirection)
    sortBySize?: ESortDirection;

    @Field((): typeof ESortDirection => ESortDirection, { nullable: true })
    @IsOptional()
    @IsEnum(ESortDirection)
    sortByStrike?: ESortDirection;

    @Field((): typeof ESortDirection => ESortDirection, { nullable: true })
    @IsOptional()
    @IsEnum(ESortDirection)
    sortByExpirationDate?: ESortDirection;
}
