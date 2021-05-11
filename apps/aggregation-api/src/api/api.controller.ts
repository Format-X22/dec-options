import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { EMarket, EMarketType, EOptionType, OptionsData } from '@app/shared/options-data.schema';
import { DEFAULT_LIMIT, DEFAULT_OFFSET, ESortDirection, OptionsQueryDto } from './options-query.dto';
import { ListDto, makeListDtoApi } from '@app/shared/list.dto';
import { plainToClass } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { ApiService, TOptionsParams } from './api.service';

@Controller('api')
export class ApiController {
    constructor(private readonly apiService: ApiService) {}

    @Get()
    @ApiQuery({ name: 'filterByMarket', enum: EMarket, required: false })
    @ApiQuery({ name: 'filterByMarketType', enum: EMarketType, required: false })
    @ApiQuery({ name: 'filterByType', enum: EOptionType, required: false })
    @ApiQuery({ name: 'sortByMarket', enum: ESortDirection, required: false })
    @ApiQuery({ name: 'sortByMarketType', enum: ESortDirection, required: false })
    @ApiQuery({ name: 'sortByType', enum: ESortDirection, required: false })
    @ApiQuery({ name: 'sortBySize', enum: ESortDirection, required: false })
    @ApiQuery({ name: 'sortByStrike', enum: ESortDirection, required: false })
    @ApiQuery({ name: 'sortByExpirationDate', enum: ESortDirection, required: false })
    @ApiQuery({ name: 'offset', type: Number, required: false })
    @ApiQuery({ name: 'limit', type: Number, required: false })
    @ApiOkResponse(makeListDtoApi(OptionsData))
    async getOptions(
        @Query('filterByMarket') filterByMarket: unknown,
        @Query('filterByMarketType') filterByMarketType: unknown,
        @Query('filterByType') filterByType: unknown,
        @Query('sortByMarket') sortByMarket: unknown,
        @Query('sortByMarketType') sortByMarketType: unknown,
        @Query('sortByType') sortByType: unknown,
        @Query('sortBySize') sortBySize: unknown,
        @Query('sortByStrike') sortByStrike: unknown,
        @Query('sortByExpirationDate') sortByExpirationDate: unknown,
        @Query('offset') offset: unknown,
        @Query('limit') limit: unknown,
    ): Promise<ListDto<OptionsData>> {
        const paramsClassInstance: OptionsQueryDto = plainToClass(OptionsQueryDto, {
            filterByMarket,
            filterByMarketType,
            filterByType,
            sortByMarket,
            sortByMarketType,
            sortByType,
            sortBySize,
            sortByStrike,
            sortByExpirationDate,
            offset: +offset || DEFAULT_OFFSET,
            limit: +limit || DEFAULT_LIMIT,
        });

        try {
            await validateOrReject(paramsClassInstance);
        } catch (error) {
            if (Array.isArray(error) && error[0] instanceof ValidationError) {
                throw new BadRequestException({
                    errors: error.map(
                        (validation: ValidationError): Record<string, Record<string, string>> => {
                            return { [validation.property]: validation.constraints };
                        },
                    ),
                });
            }

            throw error;
        }

        return this.apiService.getOptions(paramsClassInstance);
    }

    @Get('/options-params')
    async getOptionsParamsList(): Promise<TOptionsParams> {
        return this.apiService.getOptionsParamsList();
    }
}
