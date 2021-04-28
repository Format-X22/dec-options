import { Injectable } from '@nestjs/common';
import { OptionsData, OptionsDataDocument } from '@app/shared/options-data.schema';
import { ListDto } from '@app/shared/list.dto';
import { ESortDirection, OptionsQueryDto } from './options-query.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

type TOptionsQuery = {
    market?: OptionsData['market'];
    marketType?: OptionsData['marketType'];
    type?: OptionsData['type'];
};

type TSortDirection = 1 | -1;

type TOptionsSort = {
    market?: TSortDirection;
    marketType?: TSortDirection;
    type?: TSortDirection;
    size?: TSortDirection;
    strike?: TSortDirection;
    expirationDate?: TSortDirection;
};

@Injectable()
export class AggregationApiService {
    constructor(@InjectModel(OptionsData.name) private optionsDataModel: Model<OptionsDataDocument>) {}

    async getOptions(requestQuery: OptionsQueryDto): Promise<ListDto<OptionsData>> {
        const dbQuery: TOptionsQuery = this.makeOptionsQuery(requestQuery);
        const dbSort: TOptionsSort = this.makeOptionsSort(requestQuery);
        const data: Array<OptionsDataDocument> = await this.optionsDataModel.find(dbQuery, null, {
            sort: dbSort,
            skip: requestQuery.offset,
            limit: requestQuery.limit,
        });

        return { data };
    }

    private makeOptionsQuery(requestQuery: OptionsQueryDto): TOptionsQuery {
        const dbQuery: TOptionsQuery = {};

        if (requestQuery.filterByMarket) {
            dbQuery.market = requestQuery.filterByMarket;
        }

        if (requestQuery.filterByMarketType) {
            dbQuery.marketType = requestQuery.filterByMarketType;
        }

        if (requestQuery.filterByType) {
            dbQuery.type = requestQuery.filterByType;
        }

        return dbQuery;
    }

    private makeOptionsSort(requestQuery: OptionsQueryDto): TOptionsSort {
        const dbSort: TOptionsSort = {};

        if (requestQuery.sortByMarket) {
            dbSort.market = this.querySortToDbSort(requestQuery.sortByMarket);
        }

        if (requestQuery.sortByMarketType) {
            dbSort.marketType = this.querySortToDbSort(requestQuery.sortByMarketType);
        }

        if (requestQuery.sortByType) {
            dbSort.type = this.querySortToDbSort(requestQuery.sortByType);
        }

        if (requestQuery.sortBySize) {
            dbSort.size = this.querySortToDbSort(requestQuery.sortBySize);
        }

        if (requestQuery.sortByStrike) {
            dbSort.strike = this.querySortToDbSort(requestQuery.sortByStrike);
        }

        if (requestQuery.sortByExpirationDate) {
            dbSort.expirationDate = this.querySortToDbSort(requestQuery.sortByExpirationDate);
        }

        return dbSort;
    }

    private querySortToDbSort(direction: ESortDirection): TSortDirection {
        if (direction === ESortDirection.ASC) {
            return 1;
        } else {
            return -1;
        }
    }
}