import { Injectable } from '@nestjs/common';
import { OptionsData } from '@app/shared/options-data.schema';
import { IAggregator } from '../options-aggregator.service';

@Injectable()
export class PrimitiveService implements IAggregator {
    async getCurrentData(): Promise<Array<OptionsData>> {
        // TODO -
        return;
    }
}