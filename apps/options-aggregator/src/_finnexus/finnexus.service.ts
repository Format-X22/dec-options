import { Injectable } from '@nestjs/common';
import { Option } from '@app/shared/option.schema';
import { IAggregator } from '../options-aggregator.service';

@Injectable()
export class FinnexusService implements IAggregator {
    async getCurrentData(): Promise<Array<Option>> {
        // TODO Suspended
        return;
    }
}
