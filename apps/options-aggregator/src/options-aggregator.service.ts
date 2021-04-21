import { Injectable } from '@nestjs/common';

@Injectable()
export class OptionsAggregatorService {
    getHello(): string {
        return 'Hello World!';
    }
}
