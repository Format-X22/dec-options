import React from 'react';
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

const BarsContainer = styled.div`
    display: flex;
    flex-direction: ${({ align }) => (align === 'left' ? 'row' : 'row-reverse')};
    ${({ max }) => `width: ${(max + 1) * 4 + (max + 1 - 1) * 2}px`};

    &:hover {
        ${TextContainer} {
            transform: translateY(0);
        }
    }
`;
// tslint:disable-current-file:typedef

const Bar: StyledComponen = styled.div`
    width: 4px;
    height: 16px;
    border-radius: 1px;
    background: ${({ active }) => (active ? $blue : $barBackground)};

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

function Bars({ max, value, align = 'left' }: { max: number; value: number; align: ALIGN }): JSX.Element {
    const maxBarsCount = 5;
    const activeBarsPercent = (value / max) * 100;
    const activeBarsQty =
        activeBarsPercent === 0
            ? 0
            : activeBarsPercent < 10
            ? 1
            : activeBarsPercent < 25
            ? 2
            : activeBarsPercent < 50
            ? 3
            : activeBarsPercent < 80
            ? 4
            : 5;
    return (
        <BarsContainer max={maxBarsCount} align={align}>
            {[...Array(maxBarsCount)].map((_, i) => (
                <Bar active={i < activeBarsQty} key={`bar_${i}`} className={align} />
            ))}
        </BarsContainer>
    );
}

export default Bars;
