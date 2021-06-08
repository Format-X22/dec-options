import React from 'react';
import styled from 'styled-components';
import { $backgroundLight, $lineColor } from '../../theme';

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

    & + & {
        border-top: 1px solid ${$lineColor};
    }
`;
