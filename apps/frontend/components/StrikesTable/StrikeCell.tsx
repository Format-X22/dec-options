import React from 'react';
import styled from 'styled-components';
import { $backgroundDark, $lineColor, $tableTitleBackground } from '../../theme';

type StrikeCellProps = {
    active?: boolean;
};
export const StrikeCell: React.FunctionComponent<StrikeCellProps> = styled.div`
    background: ${$backgroundDark};
    width: 100%;
    font-size: 12px;
    line-height: 20px;
    text-align: center;
    padding: 16px 0;
    color: ${({ active }: StrikeCellProps) => (active ? '#fff' : $tableTitleBackground)};
    border-top: 1px solid ${$lineColor};
`;
