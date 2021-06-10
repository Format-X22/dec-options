import React from 'react';
import styled from 'styled-components';
import { $backgroundLight, $lineColor, $tableRowHover } from '../../theme';

type TableRowProps = {
    reverse?: boolean;
};
export const TableRow: React.FunctionComponent<TableRowProps> = styled.div`
    display: flex;
    width: 100%;
    height: 48px;
    background: ${$backgroundLight};
    align-items: center;
    justify-content: center;
    flex-direction: ${({ reverse }: TableRowProps) => (reverse ? 'row-reverse' : 'row')};
    position: relative;

    & + & {
        border-top: 1px solid ${$lineColor};
    }

    &:hover {
        background: ${$tableRowHover};
    }

    button {
        visibility: hidden;
        pointer-events: none;

        @media (min-width: 681px) {
            ${({ reverse }: TableRowProps) => `${reverse ? 'right' : 'left'}: 0;`};
        }

        @media (max-width: 680px) {
            ${({ reverse }: TableRowProps) => `${!reverse ? 'right' : 'left'}: 0;`};
        }
    }

    &:hover {
        button {
            visibility: visible;
            pointer-events: all;
        }
    }
`;
