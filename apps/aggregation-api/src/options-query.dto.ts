import { EMarketType, EOptionType } from '@app/shared/options-data.schema';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export enum EFilterDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}

export const DEFAULT_OFFSET: number = 0;
export const DEFAULT_LIMIT: number = 20;

export class OptionsQueryDto {
    @IsOptional()
    @IsString()
    filterByMarket: string;

    @IsOptional()
    @IsEnum(EMarketType)
    filterByMarketType: EMarketType;

    @IsOptional()
    @IsEnum(EOptionType)
    filterByType: EOptionType;

    @IsOptional()
    @IsEnum(EFilterDirection)
    sortByMarket: EFilterDirection;

    @IsOptional()
    @IsEnum(EFilterDirection)
    sortByMarketType: EFilterDirection;

    @IsOptional()
    @IsEnum(EFilterDirection)
    sortByType: EFilterDirection;

    @IsOptional()
    @IsEnum(EFilterDirection)
    sortBySize: EFilterDirection;

    @IsOptional()
    @IsEnum(EFilterDirection)
    sortByStrike: EFilterDirection;

    @IsOptional()
    @IsEnum(EFilterDirection)
    sortByExpirationDate: EFilterDirection;

    @IsOptional()
    @IsNumber()
    @Min(0)
    offset: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    limit: number;
}
