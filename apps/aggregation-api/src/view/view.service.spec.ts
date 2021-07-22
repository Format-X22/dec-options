import { Test, TestingModule } from '@nestjs/testing';
import { ViewService } from './view.service';
import { ViewModule } from './view.module';
import { ViewController } from './view.controller';

describe('ViewService', (): void => {
    let service: ViewService;

    beforeEach(async (): Promise<void> => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ViewModule],
            controllers: [ViewController],
            providers: [ViewService],
        }).compile();

        service = module.get<ViewService>(ViewService);
    });

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
