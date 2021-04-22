import { Injectable } from '@nestjs/common';
import { EMarketType, EOptionType, OptionsData } from '@app/shared/options-data.schema';
import { ListDto } from '@app/shared/list.dto';
import { OptionsQueryDto } from './options-query.dto';

@Injectable()
export class AggregationApiService {
    getOptions(options: OptionsQueryDto): ListDto<OptionsData> {
        // TODO MOCK
        return {
            data: [
                {
                    market: 'TODO',
                    marketType: EMarketType.CEX,
                    type: EOptionType.CALL,
                    size: 100,
                    strike: 200,
                    expirationDate: new Date(),
                },
                {
                    market: 'TODO',
                    marketType: EMarketType.DEX,
                    type: EOptionType.CALL,
                    size: 500,
                    strike: 700,
                    expirationDate: new Date(),
                },
                {
                    market: 'TODO',
                    marketType: EMarketType.CEX,
                    type: EOptionType.PUT,
                    size: 900,
                    strike: 1200,
                    expirationDate: new Date(),
                },
            ],
        };
    }
}
