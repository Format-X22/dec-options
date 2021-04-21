import { Controller, Get } from '@nestjs/common';
import { OptionsAggregatorService } from './options-aggregator.service';

@Controller()
export class OptionsAggregatorController {
    constructor(private readonly appService: OptionsAggregatorService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
}
