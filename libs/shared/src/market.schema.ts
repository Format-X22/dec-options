import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum EMarketType {
    DEX = 'DEX',
    CEX = 'CEX',
}
registerEnumType(EMarketType, { name: 'MarketType' });

export enum EMarketKey {
    DERIBIT = 'DERIBIT',
    BINANCE = 'BINANCE',
    OKEX = 'OKEX',
    AUCTUS = 'AUCTUS',
    HEGIC = 'HEGIC',
    OPYN = 'OPYN',
    SIREN = 'SIREN',
}
registerEnumType(EMarketKey, { name: 'MarketKey' });

@ObjectType()
export class Market {
    @Field((): typeof EMarketKey => EMarketKey)
    key: EMarketKey;

    @Field((): typeof EMarketType => EMarketType)
    type: EMarketType;

    @Field()
    name: string;
}

export const markets: Array<Market> = [
    {
        key: EMarketKey.DERIBIT,
        type: EMarketType.CEX,
        name: 'Deribit',
    },
    {
        key: EMarketKey.BINANCE,
        type: EMarketType.CEX,
        name: 'Binance',
    },
    {
        key: EMarketKey.OKEX,
        type: EMarketType.CEX,
        name: 'Okex',
    },
    {
        key: EMarketKey.AUCTUS,
        type: EMarketType.DEX,
        name: 'Auctus',
    },
    {
        key: EMarketKey.HEGIC,
        type: EMarketType.DEX,
        name: 'Hegic',
    },
    {
        key: EMarketKey.OPYN,
        type: EMarketType.DEX,
        name: 'Opyn',
    },
    {
        key: EMarketKey.SIREN,
        type: EMarketType.DEX,
        name: 'Siren',
    },
];
