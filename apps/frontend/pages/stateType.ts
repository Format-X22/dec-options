import { Dispatch } from 'react';

export type State = {
    filter: {
        date: string;
        currency: string;
    };
    prices: {
        [key: string]: number;
    };
    currentSplashPanel: ESplashPanels;
    selectedOption: {
        date: Date;
        type: 'call' | 'put';
        strike: number;
        base: string;
    };
};

export enum ActionType {
    SET_FILTER_DATE = 'SET_FILTER_DATE',
    SET_FILTER_CURRENCY = 'SET_FILTER_CURRENCY',
    SET_PRICE = 'SET_PRICE',
    SET_PRICES = 'SET_PRICES',
    SET_CURRENT_PANEL = 'SET_CURRENT_PANEL',
    SET_SELECTED_OPTION = 'SET_SELECTED_OPTION',
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

type TActionSelectedOption = {
    type: ActionType.SET_SELECTED_OPTION;
    payload: {
        date: Date;
        type: 'call' | 'put';
        strike: number;
        base: string;
    };
};

export type Action =
    | ActionStringPayload
    | ActionPricePayload
    | ActionPricesPayload
    | TActionCurrentPanelPayload
    | TActionSelectedOption;

export type ContextState = {
    state: State;
    changeState: Dispatch<Action>;
};
