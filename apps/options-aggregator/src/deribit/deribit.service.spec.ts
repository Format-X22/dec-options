import { Test, TestingModule } from '@nestjs/testing';
import { DeribitService } from './deribit.service';

describe('DeribitService', (): void => {
    let service: DeribitService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [DeribitService],
            }).compile();

            service = module.get<DeribitService>(DeribitService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
