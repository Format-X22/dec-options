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
    SIREN = 'SIREN',
    OPYN = 'OPYN',
    FINNEXUS = 'FINNEXUS',
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
        key: EMarketKey.SIREN,
        type: EMarketType.DEX,
        name: 'Siren',
    },
    {
        key: EMarketKey.OPYN,
        type: EMarketType.DEX,
        name: 'Opyn',
    },
    {
        key: EMarketKey.FINNEXUS,
        type: EMarketType.DEX,
        name: 'Finnexus',
    },
];

export const marketsMapByKey: Map<EMarketKey, Market> = new Map();

for (const market of markets) {
    marketsMapByKey.set(market.key, market);
}

export function marketKeysByMarketType(type: EMarketType): Array<EMarketKey> {
    return markets.filter((item) => item.type === type).map((item) => item.key);
}

export const ActiveMarkets: Array<EMarketKey> = [
    EMarketKey.OKEX,
    EMarketKey.DERIBIT,
    EMarketKey.BINANCE,
    EMarketKey.AUCTUS,
    EMarketKey.SIREN,
];
