import { Test, TestingModule } from '@nestjs/testing';
import { SirenService } from './siren.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseModuleOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';
import { Option, OptionSchema } from '@app/shared/option.schema';

describe('SirenService', (): void => {
    let service: SirenService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                imports: [
                    ConfigModule.forRoot({
                        isGlobal: true,
                        cache: true,
                    }),
                    MongooseModule.forRootAsync({
                        imports: [ConfigModule],
                        useFactory: (configService: ConfigService): MongooseModuleOptions => ({
                            uri: configService.get<string>('OA_MONGO_CONNECT'),
                        }),
                        inject: [ConfigService],
                    }),
                    MongooseModule.forFeature([{ name: Option.name, schema: OptionSchema }]),
                ],
                providers: [SirenService],
            }).compile();

            service = module.get<SirenService>(SirenService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
