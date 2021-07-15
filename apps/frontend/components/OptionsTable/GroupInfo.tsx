import React from 'react';
import styled from 'styled-components';
import { $backgroundLight } from '../../theme';
import Button from '../Button';
import format from 'date-fns/format';
import { useRouter } from 'next/router';
import { ITradeQuery } from '../../dtos/ITradeQuery';

const StyledInfo = styled.div`
    width: 100%;
    display: flex;
    justify-content: left;
    background: ${$backgroundLight};
    padding: 10px 24px;
    flex-direction: row;
    align-items: center;
    flex: 1;
`;

const Text = styled.span`
    font-weight: 600;
    font-size: 20px;
    line-height: 20px;
    margin-right: 12px;
`;

const Space = styled.span`
  margin-left: 25px;
`

export function GroupInfo(): JSX.Element {
    const router = useRouter();
    const {date, strike, base, type} = router.query as unknown as ITradeQuery;
    const dateString = format(new Date(date) || new Date(), 'dd MMMM');

    return (
        <StyledInfo>
            <Button
                onClick={() => {
                  router.back();
                }}
            >
                &lt;&lt;&lt; back
            </Button>
            <Space />
            <Text>{base}</Text>
            <Text>{dateString}</Text>
            <Text>{strike}</Text>
            {type === 'call' ? <Text>{'CALL'}</Text> : <Text>{'PUT'}</Text>}
        </StyledInfo>
    );
}
