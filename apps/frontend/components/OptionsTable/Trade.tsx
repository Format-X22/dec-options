import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { ITradeQuery } from '../../dtos/ITradeQuery';
import TradeChart from '../TradeChart/TradeChart';
import { useStatsData } from '../../hooks/useStatsData';
import { useStrikeHistoryData } from '../../hooks/useStrikesHistoryData';
import { useTotalValuesByExpirations } from '../../hooks/useTotalValuesByExpirations';

const TradeComingSoon = styled.div`
    background: #303030;
    padding-left: 31px;
    font-size: 22px;

    @media all and (max-width: 576px) {
        padding-left: 0;
        padding-top: 30px;
    }
`;

const Trade = () => {
    const router = useRouter();
    const { strike, base, type, date } = router.query as unknown as ITradeQuery;
    const { loading: loadingStats, data: dataStats } = useStatsData(base);
    const strikesHistoryData = useStrikeHistoryData(base, date, strike, type, dataStats);
    const totalValuesByExpirations = useTotalValuesByExpirations(base, strike, type, dataStats);

    return (
        <TradeComingSoon>
            {!loadingStats && (
                <TradeChart
                    type='area'
                    data={strikesHistoryData}
                    chartKey='openInterest'
                    dataTitle='Open Interest History'
                    base={base}
                />
            )}
            {!loadingStats && (
                <TradeChart
                    type='area'
                    data={strikesHistoryData}
                    chartKey='volume'
                    dataTitle='Volume History'
                    base={base}
                />
            )}
            {!loadingStats && (
                <TradeChart
                    type='area'
                    data={strikesHistoryData}
                    chartKey='impliedVolatility'
                    dataTitle='Implied Volatility History'
                    base=''
                />
            )}
            {!loadingStats && (
                <TradeChart
                    type='column'
                    data={totalValuesByExpirations}
                    chartKey='openInterest'
                    dataTitle='Total Open Interest by Expiration Dates'
                    base={base}
                />
            )}
            {!loadingStats && (
                <TradeChart
                    type='column'
                    data={totalValuesByExpirations}
                    chartKey='volume'
                    dataTitle='Total Volume by Expiration Dates'
                    base={base}
                />
            )}
            {!loadingStats && (
                <TradeChart
                    type='column'
                    data={totalValuesByExpirations}
                    chartKey='impliedVolatility'
                    dataTitle='Total Implied Volatility by Expiration Dates'
                    base=''
                />
            )}
        </TradeComingSoon>
    );
};

export default Trade;
