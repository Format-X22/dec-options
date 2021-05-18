import { Test, TestingModule } from '@nestjs/testing';
import { OpiumService } from './opium.service';

describe('OpiumService', (): void => {
    let service: OpiumService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [OpiumService],
            }).compile();

            service = module.get<OpiumService>(OpiumService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
