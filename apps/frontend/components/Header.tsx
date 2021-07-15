import { ReactElement, useState } from 'react';
import styled from 'styled-components';
import { $backgroundLight } from '../theme';
import Button from './Button';
import { Modal } from './Modal';

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
            <Logo>OPEX</Logo>
            <Button onClick={openModal}>Connect wallet</Button>
            <Modal visible={connectModalIsVisible} onClose={closeModal} title='Keep calm and just wait'>
                The connection with Ethereum network will be available soon.
            </Modal>
        </StyledHeader>
    );
}

export default Header;
