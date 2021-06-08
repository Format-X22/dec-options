import { Test, TestingModule } from '@nestjs/testing';
import { SharedService } from './shared.service';

describe('SharedService', (): void => {
    let service: SharedService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [SharedService],
            }).compile();

            service = module.get<SharedService>(SharedService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
