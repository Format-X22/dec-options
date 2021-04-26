import { Test } from '@nestjs/testing';
import { OptionsAggregatorService } from './options-aggregator.service';

describe('OptionsAggregatorController', (): void => {
    beforeEach(
        async (): Promise<void> => {
            await Test.createTestingModule({
                controllers: [],
                providers: [OptionsAggregatorService],
            }).compile();
        },
    );
});
