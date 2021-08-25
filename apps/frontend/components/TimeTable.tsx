import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useContext, FC, useEffect, useCallback } from 'react';
import { ContextApp } from '../pages/_app';
import format from 'date-fns/format';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Skeleton } from 'antd';
import Bars from './Bars';
import { $dateBackground, $dateBackgroundActive } from '../theme';
import { useExpirations } from '../hooks/useExpirations';

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
type DateElementProps = {
    active: boolean;
};
const DateElement: FC<DateElementProps> = styled.div`
    cursor: pointer;
    display: flex;
    flex-direction: column;
    padding: 16px;
    width: 100%;
    height: 100%;
    background: ${({ active }: DateElementProps): string => (active ? $dateBackgroundActive : $dateBackground)};
    position: relative;
    border-radius: 2px;
    overflow: hidden;

    ${({ active }: DateElementProps): string =>
        active
            ? `${DateTitle} {
        color: #000;
    }`
            : ``}
`;
const ErrorText = styled.div`
    margin-top: 16px;
`;

const printDate = (dateString: string): string => format(new Date(dateString), 'MMMM, d');
const getDateString = (dateString: string): string => format(new Date(dateString), 'yyyy/MM/dd');

export function TimeTable(): JSX.Element {
    const router = useRouter();
    const { state } = useContext(ContextApp);
    const { date: value } = state.filter;
    const { loading, error, parsedData, data } = useExpirations();

    function onChange(newValue: string): void {
        router.query.date = newValue;
        router.push(router);
    }

    useEffect((): void => {
        if (data?.expirations?.length) {
            if (data && !value && onChange) {
                onChange(getDateString(data.expirations[0].expirationDate));
            } else {
                if (data && value) {
                    const elementWithCurrentDate = data.expirations.find(
                        ({ expirationDate }) => format(new Date(expirationDate), 'yyyy/MM/dd') === value,
                    );
                    if (!elementWithCurrentDate) {
                        onChange(getDateString(data.expirations[0].expirationDate));
                    }
                }
            }
        }
    }, [data]);

    const barsValues = [...new Set(parsedData?.map(({ barsValue }) => barsValue))];
    const maxBarsValue = Math.max.apply(null, barsValues);
    const minBarsValue = Math.min.apply(null, barsValues);

    const getBarsCount = useCallback(
        (count: number, max: number): number => {
            if (count === maxBarsValue) {
                return max;
            }
            if (count === minBarsValue) {
                return 1;
            }

            for (let i = max; i >= 1; i--) {
                if (count > (maxBarsValue / max) * i) {
                    return i;
                }
            }
            return 1;
        },
        [maxBarsValue, minBarsValue],
    );

    return (
        <>
            <Swiper slidesPerView='auto' loop={false} spaceBetween={12} cssMode>
                {parsedData && (loading || error) ? (
                    <>
                        {[...Array(10)].map(
                            (_: unknown, index: number): JSX.Element => (
                                <SwiperSlide style={{ width: '160px' }} key={`skeleton_slide_${index}`}>
                                    <SwiperSlideElement>
                                        <Skeleton.Button active />
                                    </SwiperSlideElement>
                                </SwiperSlide>
                            ),
                        )}
                    </>
                ) : null}
                {parsedData &&
                    !error &&
                    parsedData.map(
                        ({ expirationDate, barsValue }): JSX.Element => (
                            <SwiperSlide style={{ width: '160px' }} key={`skeleton_slide_${expirationDate}`}>
                                <SwiperSlideElement onClick={(): void => onChange(getDateString(expirationDate))}>
                                    <DateElement active={value === getDateString(expirationDate)}>
                                        <DateTitle>{printDate(expirationDate)}</DateTitle>
                                        <Bars
                                            max={6}
                                            value={getBarsCount(barsValue, 6)}
                                            align='left'
                                            activeBars={getBarsCount(barsValue, 6)}
                                            // text={markets.map(({ name }) => name).join(', ')}
                                        />
                                    </DateElement>
                                </SwiperSlideElement>
                            </SwiperSlide>
                        ),
                    )}
            </Swiper>
            {error && <ErrorText>Error loading expiration dates</ErrorText>}
        </>
    );
}
