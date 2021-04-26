import { Injectable } from '@nestjs/common';
import { IAggregator } from '../options-aggregator.service';
import { OptionsData } from '@app/shared/options-data.schema';

@Injectable()
export class AuctusService implements IAggregator {
    async getCurrentData(): Promise<Array<OptionsData>> {
        // TODO -
        return;
    }
}
