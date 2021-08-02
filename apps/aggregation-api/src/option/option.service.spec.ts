import { Test, TestingModule } from '@nestjs/testing';
import { OptionService } from './option.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OptionModule } from './option.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseModuleOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';
import { Option, OptionSchema } from '@app/shared/option.schema';
import { HttpModule } from '@nestjs/common';

describe('ApiService', (): void => {
    let service: OptionService;
    let module: TestingModule;

    beforeEach(async (): Promise<void> => {
        module = await Test.createTestingModule({
            imports: [
                HttpModule,
                ConfigModule.forRoot({
                    isGlobal: true,
                    cache: true,
                }),
                OptionModule,
                MongooseModule.forRootAsync({
                    imports: [ConfigModule],
                    useFactory: (configService: ConfigService): MongooseModuleOptions => ({
                        uri: configService.get<string>('OA_MONGO_CONNECT'),
                    }),
                    inject: [ConfigService],
                }),
                MongooseModule.forFeature([{ name: Option.name, schema: OptionSchema }]),
            ],
            providers: [OptionService],
        }).compile();

        service = module.get<OptionService>(OptionService);
    });

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });

    afterEach(async (): Promise<void> => module.close());
});
