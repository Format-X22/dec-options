import React from 'react';
import styled from 'styled-components';
import { $backgroundLight } from '../../theme';

type TablePartProps = {
    row?: boolean;
    noTable?: boolean;
    reverse?: boolean;
};

export const TablePart: React.FunctionComponent<TablePartProps> = styled.div`
    display: flex;
    flex-direction: ${({ row }: TablePartProps) => (row ? 'row' : 'column')};
    width: 100%;
    height: 100%;
    background: ${$backgroundLight};
    ${({ noTable }: TablePartProps) => noTable && `padding: 24px 0`};
    ${({ reverse }: TablePartProps) => reverse && 'align-items: flex-end;'}
`;
