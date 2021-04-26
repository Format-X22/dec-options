import { Test, TestingModule } from '@nestjs/testing';
import { AuctusService } from './auctus.service';

describe('AuctusService', (): void => {
    let service: AuctusService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [AuctusService],
            }).compile();

            service = module.get<AuctusService>(AuctusService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
