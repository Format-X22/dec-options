import { gql, useQuery } from '@apollo/client';
import { useContext } from 'react';
import { ContextApp } from '../pages/_app';

const GET_EXPIRATIONS = gql`
    query getExpirations($timezone: Int, $base: String, $marketType: MarketType) {
        expirations(packByDateSize: DAY, timezone: $timezone, base: $base, marketType: $marketType) {
            expirationDate
            markets {
                name
            }
            strikes
        }
    }
`;

function normalizeWeight(obj: WEIGHT): WEIGHT {
    const newObject: WEIGHT = {};
    let previousValue = -1;
    let previousIndex = -1;
    Object.entries(obj)
        .map(([key, value]): [string, number] => [key, value])
        .sort(([, a], [, b]) => (a > b ? 1 : -1))
        .forEach(([key, value]) => {
            if (value === previousValue) {
                newObject[key] = previousIndex;
            } else {
                previousIndex++;
                newObject[key] = previousIndex;
                previousValue = value;
            }
        });
    return newObject;
}

type WEIGHT = {
    [key: string]: number;
};

export function useExpirations() {
    const { state } = useContext(ContextApp);
    const { currency: base, marketType } = state.filter;
    const { loading, data, error } = useQuery<{
        expirations: {
            expirationDate: string;
            markets: {
                name: string;
            }[];
            strikes: number;
            barsValue: number;
        }[];
    }>(GET_EXPIRATIONS, {
        variables: {
            timezone: new Date().getTimezoneOffset() / 60,
            base,
            marketType,
        },
    });

    const strikesWeightsBeforeParsing: WEIGHT = {};
    const marketsWeightsBeforeParsing: WEIGHT = {};

    data?.expirations?.forEach((el): void => {
        strikesWeightsBeforeParsing[el.expirationDate] = el.strikes;
        marketsWeightsBeforeParsing[el.expirationDate] = el.markets.length;
    });

    const strikesWeights: WEIGHT = normalizeWeight(strikesWeightsBeforeParsing);
    const marketsWeights: WEIGHT = normalizeWeight(marketsWeightsBeforeParsing);

    const parsedData =
        data && data.expirations
            ? data.expirations.map((ex) => {
                  const _ = { ...ex };
                  _.barsValue = strikesWeights[ex.expirationDate] + marketsWeights[ex.expirationDate] * 1.3; // magic coefficient
                  return _;
              })
            : null;
    return { loading, error, parsedData, data };
}
