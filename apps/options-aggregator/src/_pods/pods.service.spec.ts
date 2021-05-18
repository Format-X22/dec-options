import { Test, TestingModule } from '@nestjs/testing';
import { PodsService } from './pods.service';

describe('PodsService', (): void => {
    let service: PodsService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [PodsService],
            }).compile();

            service = module.get<PodsService>(PodsService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
