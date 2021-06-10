import React from 'react';
import styled from 'styled-components';
import { $tableTitleBackground } from '../../theme';

type TitleTextProps = {
    active?: boolean;
};
export const TitleText: React.FunctionComponent<TitleTextProps> = styled.div`
    font-weight: 500;
    font-size: 12px;
    line-height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ active }: TitleTextProps) => (active ? '#fff' : $tableTitleBackground)};
`;
