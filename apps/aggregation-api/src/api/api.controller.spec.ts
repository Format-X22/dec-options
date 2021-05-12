import { Test, TestingModule } from '@nestjs/testing';
import { ApiController } from './api.controller';
import { ApiModule } from './api.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OptionsData, OptionsDataSchema } from '@app/shared/options-data.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';
import { ApiService } from './api.service';

describe('ApiController', (): void => {
    let controller: ApiController;
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

            controller = module.get<ApiController>(ApiController);
        },
    );

    it('should be defined', (): void => {
        expect(controller).toBeDefined();
    });

    afterEach(async (): Promise<void> => module.close());
});
