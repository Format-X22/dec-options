import { EOptionType } from '@app/shared/option.schema';
import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { EMarketKey, EMarketType } from '@app/shared/market.schema';

export enum ESortDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}

export const DEFAULT_OFFSET: number = 0;
export const DEFAULT_LIMIT: number = 20;

export class OptionsQueryDto {
    @IsOptional()
    @IsEnum(EMarketKey)
    filterByMarket: EMarketKey;

    @IsOptional()
    @IsEnum(EMarketType)
    filterByMarketType: EMarketType;

    @IsOptional()
    @IsEnum(EOptionType)
    filterByType: EOptionType;

    @IsOptional()
    @IsEnum(ESortDirection)
    sortByMarket: ESortDirection;

    @IsOptional()
    @IsEnum(ESortDirection)
    sortByMarketType: ESortDirection;

    @IsOptional()
    @IsEnum(ESortDirection)
    sortByType: ESortDirection;

    @IsOptional()
    @IsEnum(ESortDirection)
    sortBySize: ESortDirection;

    @IsOptional()
    @IsEnum(ESortDirection)
    sortByStrike: ESortDirection;

    @IsOptional()
    @IsEnum(ESortDirection)
    sortByExpirationDate: ESortDirection;

    @IsNumber()
    @Min(0)
    offset: number;

    @IsNumber()
    @Min(1)
    @Max(100)
    limit: number;
}
