import { Test, TestingModule } from '@nestjs/testing';
import { ApiService } from './api.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiModule } from './api.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseModuleOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';
import { OptionsData, OptionsDataSchema } from '@app/shared/options-data.schema';
import { ApiController } from './api.controller';

describe('ApiService', (): void => {
    let service: ApiService;
    let module: TestingModule;

    beforeEach(
        async (): Promise<void> => {
            module = await Test.createTestingModule({
                imports: [
                    ConfigModule.forRoot({
                        isGlobal: true,
                        cache: true,
                    }),
                    ApiModule,
                    MongooseModule.forRootAsync({
                        imports: [ConfigModule],
                        useFactory: (configService: ConfigService): MongooseModuleOptions => ({
                            uri: configService.get<string>('OA_MONGO_CONNECT'),
                        }),
                        inject: [ConfigService],
                    }),
                    MongooseModule.forFeature([{ name: OptionsData.name, schema: OptionsDataSchema }]),
                ],
                controllers: [ApiController],
                providers: [ApiService],
            }).compile();

            service = module.get<ApiService>(ApiService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });

    afterEach(async (): Promise<void> => module.close());
});
