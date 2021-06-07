import { ArgsType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { PaginationArgs } from '@app/shared/list.dto';
import { IsEnum, IsInstance, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';
import { EOptionType, Option } from '@app/shared/option.schema';

export enum ESortDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}
registerEnumType(ESortDirection, { name: 'SortDirection' });

export enum EPackByDateSize {
    DAY = 'DAY',
}
registerEnumType(EPackByDateSize, { name: 'PackByDateSize' });

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

@ArgsType()
export class ExpirationGroupArgs {
    @Field((): typeof EPackByDateSize => EPackByDateSize, { nullable: true })
    @IsOptional()
    @IsEnum(EPackByDateSize)
    packByDateSize?: EPackByDateSize;

    @Field((): typeof Int => Int, { nullable: true })
    @IsOptional()
    @IsInt()
    @Min(-24)
    @Max(24)
    timezone?: number;

    @Field((): typeof String => String, { nullable: true })
    @IsOptional()
    @IsString()
    base?: Option['base'];
}

@ArgsType()
export class StrikeGroupArgs {
    @Field((): typeof EOptionType => EOptionType, { nullable: true })
    @IsOptional()
    @IsEnum(EOptionType)
    type?: Option['type'];

    @Field((): typeof String => String, { nullable: true })
    @IsOptional()
    @IsString()
    base?: Option['base'];

    @Field((): typeof Date => Date, { nullable: true })
    @IsOptional()
    @IsInstance(Date)
    fromDate?: Date;

    @Field((): typeof Date => Date, { nullable: true })
    @IsOptional()
    @IsInstance(Date)
    toDate?: Date;
}
