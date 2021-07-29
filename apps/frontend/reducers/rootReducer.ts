import { EMarketType } from '@app/shared/market.schema';
import { Action, ActionType, State } from '../pages/stateType';

export const rootReducer = (state: State, action: Action): State => {
    switch (action.type) {
        case ActionType.SET_FILTER_DATE:
            return { ...state, filter: { ...state.filter, date: action.payload } };
        case ActionType.SET_FILTER_CURRENCY:
            return { ...state, filter: { ...state.filter, currency: action.payload } };
        case ActionType.SET_FILTER_MARKET_TYPE:
            return { ...state, filter: { ...state.filter, marketType: action.payload as EMarketType } };
        case ActionType.SET_PRICE:
            return { ...state, prices: { ...state.prices, [action.payload.key]: action.payload.price } };
        case ActionType.SET_PRICES:
            return { ...state, prices: { ...state.prices, ...action.payload } };
        case ActionType.SET_CURRENT_PANEL:
            return { ...state, currentSplashPanel: action.payload };
        case ActionType.SET_SELECTED_OPTION_GROUP:
            return { ...state, selectedOptionGroup: action.payload };
        case ActionType.SET_SELECTED_OPTION_FOR_ORDER_BOOK:
            return { ...state, selectedOptionForOrderBook: action.payload };
        default:
            throw new Error('Unexpected action');
    }
};
