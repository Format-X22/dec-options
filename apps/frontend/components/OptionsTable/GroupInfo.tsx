import React from 'react';
import styled from 'styled-components';
import { $backgroundLight } from '../../theme';
import Button from '../Button';
import format from 'date-fns/format';
import { useRouter } from 'next/router';
import { ITradeQuery } from '../../dtos/ITradeQuery';

const StyledInfo = styled.div`
    width: 100%;
    background: ${$backgroundLight};

    > div {
        display: flex;
        align-items: flex-end;
        padding: 8px 24px 24px;

        &:first-child {
            padding: 24px;
        }
    }
`;

const BaseText = styled.span`
    font-size: 32px;
    line-height: 32px;
    color: white;
    margin-right: 8px;
    margin-left: 25px;
`;

const Text = styled.span`
    font-weight: 600;
    font-size: 20px;
    line-height: 20px;
    margin-right: 12px;
`;

export function GroupInfo(): JSX.Element {
    const router = useRouter();
    const { date, strike, base, type } = router.query as unknown as ITradeQuery;
    const dateString = format(new Date(date) || new Date(), 'dd MMMM');
    return (
        <StyledInfo>
            <div>
                <Button
                    onClick={() => {
                        if (window.history.length < 3) {
                            router.push(`/?date=${date}&base=${base}`);
                        } else {
                            router.back();
                        }
                    }}
                >
                    &lt;&lt;&lt; Go back
                </Button>
                <BaseText>{base}</BaseText>
                <Text>{dateString}</Text>
                <Text>{strike}</Text>
                {type === 'call' ? <Text>{'CALL'}</Text> : <Text>{'PUT'}</Text>}
            </div>
        </StyledInfo>
    );
}
