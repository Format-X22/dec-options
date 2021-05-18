import { Test, TestingModule } from '@nestjs/testing';
import { PrimitiveService } from './primitive.service';

describe('PrimitiveService', (): void => {
    let service: PrimitiveService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [PrimitiveService],
            }).compile();

            service = module.get<PrimitiveService>(PrimitiveService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
