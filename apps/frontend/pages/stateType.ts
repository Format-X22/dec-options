import { Dispatch } from 'react';

export type State = {
    filter: {
        date: string;
        currency: string;
    };
    prices: {
        [key: string]: number;
    };
};

export enum ActionType {
    SET_FILTER_DATE = 'SET_FILTER_DATE',
    SET_FILTER_CURRENCY = 'SET_FILTER_CURRENCY',
    SET_PRICE = 'SET_PRICE',
    SET_PRICES = 'SET_PRICES',
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

export type Action = ActionStringPayload | ActionPricePayload | ActionPricesPayload;

export type ContextState = {
    state: State;
    changeState: Dispatch<Action>;
};
