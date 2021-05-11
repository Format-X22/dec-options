import { Test, TestingModule } from '@nestjs/testing';
import { ApiService } from './api.service';

describe('ApiService', (): void => {
    let service: ApiService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [ApiService],
            }).compile();

            service = module.get<ApiService>(ApiService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
