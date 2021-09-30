import { ReactElement } from 'react';
import styled from 'styled-components';
import { $backgroundLight } from '../../theme';

import { GetInTouch } from '../GetInTouch/GetInTouch';

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
    display: flex;
    align-items: center;
    h1 {
        font-size: 34px;
        line-height: 34px;
        margin: 0 0 0 15px;
        position: relative;
        color: #fff;
        sup {
            color: #c3c3c3;
            font-size: 11px;
            position: absolute;
            right: 0;
            top: -2px;
        }
    }

    img {
        width: 50px;
    }
`;

function Header({}: { children?: ReactElement | string }): JSX.Element {
    return (
        <StyledHeader id='header'>
            <Logo>
                <img src='/opex/public/opex.svg' alt='Opex' />
                <h1>
                    <sup>DeCommas</sup>Opex
                </h1>
            </Logo>
            <GetInTouch />
        </StyledHeader>
    );
}

export default Header;
