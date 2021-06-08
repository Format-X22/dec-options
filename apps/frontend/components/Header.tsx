import React from 'react';
import styled from 'styled-components';
import { $backgroundLight } from '../theme';
import Button from './Button';

const StyledHeader = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: ${$backgroundLight};
    padding: 32px;
    margin-bottom: 4px;
`;

const Logo = styled.div`
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
`;

function Header({}: { children?: React.ReactElement | string }): JSX.Element {
    return (
        <StyledHeader>
            <Logo>OPEX</Logo>
            <Button disabled>Connect wallet</Button>
        </StyledHeader>
    );
}

export default Header;
