import { FC, ReactElement, useEffect } from 'react';
import styled from 'styled-components';
import { $selectBackground, $selectBackgroundHover } from '../theme';

let z = 99;

type ModalContainerProps = {
    visible: boolean;
};

const ModalContainer: FC<ModalContainerProps> = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: ${z};
    display: ${({ visible }: ModalContainerProps): string => (visible ? 'flex' : 'none')};
    align-items: center;
    justify-content: center;
`;

const ModalOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 99;
    background: ${$selectBackground};
    opacity: 0.5;
    cursor: pointer;
`;

const ModalContent = styled.div`
    width: 400px;
    max-width: 95vw;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 100;
    background: ${$selectBackground};
    filter: drop-shadow(0px 5px 14px rgba(0, 0, 0, 0.45));
    overflow: hidden;
    border-radius: 2px;
`;

const ModalTitle = styled.div`
    padding: 12px 24px;
    font-weight: 600;
    font-size: 14px;
    border-bottom: 1px solid ${$selectBackgroundHover};
`;

const ModalChildren = styled.div`
    padding: 12px 24px;
`;

export function Modal({
    children,
    visible,
    title,
    onClose,
}: {
    children?: ReactElement | string;
    visible: boolean;
    title?: string;
    onClose: () => void;
}): JSX.Element {
    useEffect((): void => {
        z++;
    }, []);
    return (
        <ModalContainer visible={visible}>
            <ModalOverlay onClick={onClose} />
            <ModalContent>
                {title && <ModalTitle>{title}</ModalTitle>}
                <ModalChildren>{children}</ModalChildren>
            </ModalContent>
        </ModalContainer>
    );
}
