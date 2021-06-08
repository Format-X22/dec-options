import React, { useContext } from 'react';
import { Skeleton } from 'antd';
import { Swiper, SwiperSlide } from 'swiper/react';
import { gql, useQuery } from '@apollo/client';
import styled from 'styled-components';
import format from 'date-fns/format';
import { $backgroundLight, $dateBackground, $dateBackgroundActive } from '../theme';
import Bars from './Bars';
import { ContextApp } from '../pages/_app';
import { ActionType } from '../pages/stateType';
import Select from './Select';

const StyledFilters = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    background: ${$backgroundLight};
    padding: 40px 24px;
    margin-bottom: 4px;
    flex-direction: column;
    align-items: flex-start;
`;

const FiltersRow = styled.div`
    width: 100%;
    display: flex;

    & + & {
        margin-top: 40px;
    }
`;

const SwiperSlideElement = styled.div`
    width: 160px;
    height: 96px;
    display: flex;

    .ant-skeleton {
        width: 100%;
        height: 100%;

        .ant-skeleton-button {
            width: 100%;
            height: 100%;
        }
    }
`;

const DateTitle = styled.div`
    font-weight: 500;
    font-size: 16px;
    line-height: 28px;
    margin-bottom: 16px;
`;

const DateElement = styled.div`
    cursor: pointer;
    display: flex;
    flex-direction: column;
    padding: 16px;
    width: 100%;
    height: 100%;
    background: ${({ active }) => (active ? $dateBackgroundActive : $dateBackground)};
    position: relative;
    border-radius: 2px;
    overflow: hidden;

    ${({ active }) =>
        active &&
        `${DateTitle} {
        color: #000;
    }`}
`;

const ErrorText = styled.div`
    margin-top: 16px;
`;

const GET_EXPIRATIONS = gql`
    query getExpirations($timezone: Int, $base: String) {
        expirations(packByDateSize: DAY, timezone: $timezone, base: $base) {
            expirationDate
            markets {
                name
            }
        }
    }
`;

const printDate = (dateString: string): string => format(new Date(dateString), 'MMMM, d');
const getDateString = (dateString: string): string => format(new Date(dateString), 'yyyy/MM/dd');

function TimeTable(): JSX.Element {
    const { state, changeState } = useContext(ContextApp);
    const value = state.filter.date;
    const base = state.filter.currency;

    function onChange(newValue: string): void {
        changeState({ type: ActionType.SET_FILTER_DATE, payload: newValue });
    }

    const [loadingTimeout, setLoadingTimeout] = React.useState(true);
    const { loading, data, error } = useQuery(GET_EXPIRATIONS, {
        variables: {
            timezone: new Date().getTimezoneOffset() / 60,
            base,
        },
    });

    React.useEffect((): void => {
        setTimeout((): void => {
            setLoadingTimeout(false);
        }, 1000);
    }, []);

    // tslint:disable-next-line:typedef
    React.useEffect(() => {
        if (data && !value && onChange) {
            onChange(getDateString(data.expirations[0].expirationDate));
        } else {
            if (data && value) {
                // 2021/06/07
                const elementWithCurrentDate = data.expirations.find(
                    ({ expirationDate }) => format(new Date(expirationDate), 'yyyy/MM/dd') === value,
                );
                if (!elementWithCurrentDate) {
                    onChange(getDateString(data.expirations[0].expirationDate));
                }
            }
        }
    }, [data]);

    return (
        <>
            <Swiper slidesPerView='auto' loop={false} spaceBetween={12} cssMode>
                {data && (loading || loadingTimeout || error) ? (
                    <>
                        {[...Array(10)].map((_, index: number) => (
                            <SwiperSlide style={{ width: '160px' }} key={`skeleton_slide_${index}`}>
                                <SwiperSlideElement>
                                    <Skeleton.Button active />
                                </SwiperSlideElement>
                            </SwiperSlide>
                        ))}
                    </>
                ) : null}
                {data &&
                    !error &&
                    data.expirations &&
                    // tslint:disable-next-line:typedef
                    data.expirations.map(({ expirationDate, markets }) => (
                        <SwiperSlide style={{ width: '160px' }} key={`skeleton_slide_${expirationDate}`}>
                            <SwiperSlideElement onClick={() => onChange(getDateString(expirationDate))}>
                                <DateElement active={value === getDateString(expirationDate)}>
                                    <DateTitle>{printDate(expirationDate)}</DateTitle>
                                    <Bars
                                        max={7}
                                        value={markets.length}
                                        align='left'
                                        // text={markets.map(({ name }) => name).join(', ')}
                                    />
                                </DateElement>
                            </SwiperSlideElement>
                        </SwiperSlide>
                    ))}
            </Swiper>
            {error && <ErrorText>Error loading expiration dates</ErrorText>}
        </>
    );
}

function CurrencySelector(): JSX.Element {
    const { state, changeState } = useContext(ContextApp);
    const options = [
        {
            name: 'ETH',
            value: 'ETH',
        },
        {
            name: 'BTC',
            value: 'BTC',
        },
    ];
    const value = state.filter.currency;
    function onChange(newValue: string): void {
        changeState({ type: ActionType.SET_FILTER_CURRENCY, payload: newValue });
    }

    return <Select options={options} value={value} onChange={onChange} label='Currency' />;
}

function Filters({}: { children?: React.ReactElement | string }): JSX.Element {
    return (
        <StyledFilters>
            <FiltersRow>
                <CurrencySelector />
            </FiltersRow>
            <FiltersRow>
                <TimeTable />
            </FiltersRow>
        </StyledFilters>
    );
}

export default Filters;
