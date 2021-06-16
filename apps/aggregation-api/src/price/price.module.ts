import { HttpModule, Module } from '@nestjs/common';
import { PriceService } from './price.service';

@Module({
    imports: [HttpModule],
    exports: [PriceService],
    providers: [PriceService],
})
export class PriceModule {}
