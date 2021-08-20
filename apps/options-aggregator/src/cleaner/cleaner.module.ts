import { Module } from '@nestjs/common';
import { CleanerService } from './cleaner.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Option, OptionSchema } from '@app/shared/option.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Option.name, schema: OptionSchema }])],
    providers: [CleanerService],
})
export class CleanerModule {}
