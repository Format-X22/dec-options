import { Test, TestingModule } from '@nestjs/testing';
import { ViewController } from './view.controller';
import { ViewModule } from './view.module';
import { ViewService } from './view.service';

describe('ViewController', (): void => {
    let controller: ViewController;

    beforeEach(async (): Promise<void> => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ViewModule],
            controllers: [ViewController],
            providers: [ViewService],
        }).compile();

        controller = module.get<ViewController>(ViewController);
    });

    it('should be defined', (): void => {
        expect(controller).toBeDefined();
    });
});
