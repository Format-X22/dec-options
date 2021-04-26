import { EMarket, EMarketType, EOptionType } from '@app/shared/options-data.schema';
import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';

export enum ESortDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}

export const DEFAULT_OFFSET: number = 0;
export const DEFAULT_LIMIT: number = 20;

export class OptionsQueryDto {
    @IsOptional()
    @IsEnum(EMarket)
    filterByMarket: EMarket;

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
