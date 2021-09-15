import { ArgsType, Field } from '@nestjs/graphql';
import { EMarketType } from '@app/shared/market.schema';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Option } from '@app/shared/option.schema';

@ArgsType()
export class StatsArgs {
    @Field((): typeof EMarketType => EMarketType, { nullable: true })
    @IsOptional()
    @IsEnum(EMarketType)
    marketType?: Option['marketType'];

    @Field((): typeof String => String, { nullable: true })
    @IsOptional()
    @IsString()
    base?: Option['base'];
}
