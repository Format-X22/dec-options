import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseModuleOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';
import { OptionModule } from './option/option.module';
import { ViewModule } from './view/view.module';
import { GraphQLModule } from '@nestjs/graphql';
import { PriceModule } from './price/price.module';
import { StatsModule } from './stats/stats.module';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: './apps/frontend/public',
            serveRoot: '/public',
        }),
        OptionModule,
        ViewModule,
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
        GraphQLModule.forRoot({
            installSubscriptionHandlers: true,
            autoSchemaFile: true,
        }),
        PriceModule,
        StatsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
