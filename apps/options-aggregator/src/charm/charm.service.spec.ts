import { Test, TestingModule } from '@nestjs/testing';
import { CharmService } from './charm.service';

describe('CharmService', (): void => {
    let service: CharmService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [CharmService],
            }).compile();

            service = module.get<CharmService>(CharmService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
