import { Test, TestingModule } from '@nestjs/testing';
import { OkexService } from './okex.service';

describe('OkexService', (): void => {
    let service: OkexService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [OkexService],
            }).compile();

            service = module.get<OkexService>(OkexService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
