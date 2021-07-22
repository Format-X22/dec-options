import { Dispatch } from 'react';
import { EMarketKey } from '@app/shared/market.schema';

export type State = {
    filter: {
        date: string;
        currency: string;
    };
    prices: {
        [key: string]: number;
    };
    currentSplashPanel?: ESplashPanels;
    selectedOptionGroup?: {
        date: Date;
        type: 'call' | 'put';
        strike: number;
        base: string;
    };
    selectedOptionForOrderBook?: {
        optionMarketKey: EMarketKey;
        optionId: string;
    };
};

export enum ActionType {
    SET_FILTER_DATE = 'SET_FILTER_DATE',
    SET_FILTER_CURRENCY = 'SET_FILTER_CURRENCY',
    SET_PRICE = 'SET_PRICE',
    SET_PRICES = 'SET_PRICES',
    SET_CURRENT_PANEL = 'SET_CURRENT_PANEL',
    SET_SELECTED_OPTION_GROUP = 'SET_SELECTED_OPTION_GROUP',
    SET_SELECTED_OPTION_FOR_ORDER_BOOK = 'SET_SELECTED_OPTION_FOR_ORDER_BOOK',
}

export enum ESplashPanels {
    STRIKES_TABLE = 'STRIKES_TABLE',
    OPTIONS_TABLE_WITH_ORDER_BOOK = 'OPTIONS_TABLE_WITH_ORDER_BOOK',
}

type ActionStringPayload = {
    type: ActionType.SET_FILTER_DATE | ActionType.SET_FILTER_CURRENCY;
    payload: string;
};

type ActionPricePayload = {
    type: ActionType.SET_PRICE;
    payload: {
        key: string;
        price: number;
    };
};

type ActionPricesPayload = {
    type: ActionType.SET_PRICES;
    payload: {
        [key: string]: number;
    };
};

type TActionCurrentPanelPayload = {
    type: ActionType.SET_CURRENT_PANEL;
    payload: ESplashPanels;
};

type TActionSelectedOptionGroup = {
    type: ActionType.SET_SELECTED_OPTION_GROUP;
    payload: {
        date: Date;
        type: 'call' | 'put';
        strike: number;
        base: string;
    };
};

type TActionSelectedOptionForOrderBook = {
    type: ActionType.SET_SELECTED_OPTION_FOR_ORDER_BOOK;
    payload: {
        optionMarketKey: EMarketKey;
        optionId: string;
    };
};

export type Action =
    | ActionStringPayload
    | ActionPricePayload
    | ActionPricesPayload
    | TActionCurrentPanelPayload
    | TActionSelectedOptionGroup
    | TActionSelectedOptionForOrderBook;

export type ContextState = {
    state: State;
    changeState: Dispatch<Action>;
};
