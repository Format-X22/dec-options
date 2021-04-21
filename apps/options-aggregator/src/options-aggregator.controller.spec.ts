import { Test, TestingModule } from '@nestjs/testing';
import { OptionsAggregatorController } from './options-aggregator.controller';
import { OptionsAggregatorService } from './options-aggregator.service';

describe('OptionsAggregatorController', (): void => {
    let appController: OptionsAggregatorController;

    beforeEach(
        async (): Promise<void> => {
            const app: TestingModule = await Test.createTestingModule({
                controllers: [OptionsAggregatorController],
                providers: [OptionsAggregatorService],
            }).compile();

            appController = app.get<OptionsAggregatorController>(OptionsAggregatorController);
        },
    );

    describe('root', (): void => {
        it('should return "Hello World!"', (): void => {
            expect(appController.getHello()).toBe('Hello World!');
        });
    });
});
