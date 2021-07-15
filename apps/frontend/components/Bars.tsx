import React, { FC } from 'react';
import styled from 'styled-components';
import { $barBackground, $blue } from '../theme';

type ALIGN = 'left' | 'right';

const TextContainer = styled.div`
    position: absolute;
    width: 100%;
    left: 0;
    padding: 8px 16px;
    bottom: 0;
    transform: translateY(100%);
    transition: 0.3s ease all;
    line-height: 12px;
    font-size: 12px;
    background: ${$blue};
`;

type BarsContainerProps = {
    readonly align: string;
    readonly max: number;
};

const BarsContainer: FC<BarsContainerProps> = styled.div`
    display: flex;
    flex-direction: ${({ align }: BarsContainerProps): string => (align === 'left' ? 'row' : 'row-reverse')};
    ${({ max }: BarsContainerProps): string => `width: ${(max + 1) * 4 + (max + 1 - 1) * 2}px`};

    &:hover {
        ${TextContainer} {
            transform: translateY(0);
        }
    }
`;

type BarProps = {
    readonly active: boolean;
    readonly className: string;
};

const Bar: FC<BarProps> = styled.div`
    background: ${({ active }: BarProps): string => (active ? $blue : $barBackground)};
    width: 4px;
    height: 16px;
    border-radius: 1px;

    &.left {
        & + & {
            margin-left: 2px;
        }
    }

    &.right {
        & + & {
            margin-right: 2px;
        }
    }
`;

function Bars({
    max,
    value,
    align = 'left',
    activeBars,
}: {
    max: number;
    value: number;
    align: ALIGN;
    activeBars?: number;
}): JSX.Element {
    const maxBarsCount = 6;
    const activeBarsPercent = (value / max) * 100;
    const activeBarsQty =
        activeBars ||
        (activeBarsPercent === 0
            ? 0
            : activeBarsPercent < 10
            ? 1
            : activeBarsPercent < 25
            ? 2
            : activeBarsPercent < 35
            ? 3
            : activeBarsPercent < 60
            ? 4
            : activeBarsPercent < 80
            ? 5
            : 6);
    return (
        <BarsContainer max={maxBarsCount} align={align}>
            {[...Array(maxBarsCount)].map(
                (_: unknown, i: number): JSX.Element => (
                    <Bar active={i < activeBarsQty} key={`bar_${i}`} className={align} />
                ),
            )}
        </BarsContainer>
    );
}

export default Bars;
