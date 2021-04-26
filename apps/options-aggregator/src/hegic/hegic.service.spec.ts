import { Test, TestingModule } from '@nestjs/testing';
import { HegicService } from './hegic.service';

describe('HegicService', (): void => {
    let service: HegicService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [HegicService],
            }).compile();

            service = module.get<HegicService>(HegicService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
