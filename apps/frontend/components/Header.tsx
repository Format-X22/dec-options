import { ReactElement, useState } from 'react';
import styled from 'styled-components';
import { $backgroundLight } from '../theme';
import Button from './Button';
import { Modal } from './Modal';

import { GetInTouch } from './GetInTouch/GetInTouch';

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
    const [connectModalIsVisible, setConnectModalIsVisible] = useState(false);
    const closeModal = () => {
        setConnectModalIsVisible(false);
    };
    const openModal = () => {
        setConnectModalIsVisible(true);
    };
    return (
        <StyledHeader>
            <Logo>
                <img src='/opex/public/opex.svg' alt='Opex' />
                <h1>
                    <sup>DeCommas</sup>Opex
                </h1>
            </Logo>
            {/* <Button onClick={openModal}>Connect wallet</Button>
            <Modal visible={connectModalIsVisible} onClose={closeModal} title='Keep calm and just wait'>
                The connection with Ethereum network will be available soon.
            </Modal> */}
            <GetInTouch />
        </StyledHeader>
    );
}

export default Header;
