import { FC } from 'react';
import styled from 'styled-components';
import { $backgroundLight, $lineColor, $tableRowHover } from '../../theme';

type TableRowProps = {
    reverse?: boolean;
    maxHeight?: number;
    onClick?: () => void;
    className?: string;
    highlighted?: boolean;
};
export const TableRow: FC<TableRowProps> = styled.div`
    display: flex;
    width: 100%;
    max-height: ${({ maxHeight }: TableRowProps) => (maxHeight ? `${maxHeight}px` : '48px')};
    background: ${({ highlighted }: TableRowProps) => (highlighted ? `rgba(113,210,152,0.06)` : $backgroundLight)};
    align-items: center;
    justify-content: center;
    flex-direction: ${({ reverse }: TableRowProps) => (reverse ? 'row-reverse' : 'row')};
    position: relative;
    border-top: 1px solid ${$lineColor};
    flex: 1;
    position: relative;

    &.data-row {
        cursor: pointer;
    }

    &:hover {
        background: ${$tableRowHover};
    }

    &:hover {
        button {
            visibility: visible;
            pointer-events: all;
        }
    }
`;
