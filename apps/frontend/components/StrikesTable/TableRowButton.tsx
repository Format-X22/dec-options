import { ReactNode } from 'react';
import styled from 'styled-components';
import { $buttonBackground, $buttonBackgroundHover } from '../../theme';

const TableRowButtonComponent = styled.button`
    border: 0;
    outline: none;
    background: ${$buttonBackground};
    position: absolute;
    top: 0;
    height: 100%;
    padding: 0 24px;
    cursor: pointer;

    &:hover {
        background: ${$buttonBackgroundHover};
    }
`;

function TableRowButton({ children, onClick }: { children: ReactNode; onClick: () => void }): JSX.Element {
    return <TableRowButtonComponent onClick={onClick}>{children}</TableRowButtonComponent>;
}

export default TableRowButton;
