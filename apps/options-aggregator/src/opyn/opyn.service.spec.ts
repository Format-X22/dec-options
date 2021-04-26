import { Test, TestingModule } from '@nestjs/testing';
import { OpynService } from './opyn.service';

describe('OpynService', (): void => {
    let service: OpynService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [OpynService],
            }).compile();

            service = module.get<OpynService>(OpynService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
