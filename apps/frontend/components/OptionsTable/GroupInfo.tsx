import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { $backgroundLight } from '../../theme';
import { Button } from '../Button';
import { useRouter } from 'next/router';
import { ITradeQuery } from '../../dtos/ITradeQuery';
import { CallsSvgIcon } from '../Icons/CallsSvgIcon';
import { PutsSvgIcon } from '../Icons/PutsSvgIcon';
import { DatesSelector } from '../DatesSelector';

const StyledInfo = styled.div`
    width: 100%;
    background: ${$backgroundLight};

    > div {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        padding: 8px 24px 24px;

        &:first-child {
            padding: 24px;
        }
        .group-info {
            display: flex;
            align-items: flex-end;
            img {
                width: 32px;
                height: 32px;
                margin-right: 16px;
            }
            svg {
                width: 10px;
                height: 10px;
                margin-bottom: 4px;
            }
        }
    }

    @media all and (max-width: 576px) {
        > div {
            flex-direction: column;
            align-items: flex-start;

            .group-info {
                margin-bottom: 20px;
            }
        }
    }
`;

const BaseText = styled.span`
    font-size: 32px;
    line-height: 32px;
    color: white;
    margin-right: 8px;
`;

const Text = styled.span`
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
    margin-right: 12px;
`;

export function GroupInfo(): JSX.Element {
    const router = useRouter();
    const { date, strike, base, type, marketType } = router.query as unknown as ITradeQuery;

    const query: { date: string; base: string; marketType?: string } = {
        date,
        base,
    };
    if (marketType) {
        query.marketType = marketType;
    }
    const returnLink = `/?${Object.keys(query)
        .map((key) => `${key}=${query[key]}`)
        .join('&')}`;
    return (
        <StyledInfo>
            <div>
                <Link href={returnLink}>
                    <Button type='primary'>
                        <img src='/opex/public/back.svg' alt='back' /> Go back
                    </Button>
                </Link>
            </div>
            <div>
                <div className='group-info'>
                    <img src={`/opex/public/coins/${base.toLowerCase()}.png`} alt={base} />
                    <BaseText>{base}</BaseText>
                    <Text>
                        {strike},&nbsp;{type === 'call' ? 'CALL' : 'PUT'}
                    </Text>
                    {type === 'call' ? <CallsSvgIcon /> : <PutsSvgIcon />}
                </div>
                <DatesSelector />
            </div>
        </StyledInfo>
    );
}
