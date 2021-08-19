import { ReactElement } from 'react';
import styled from 'styled-components';
import { $blue } from '../theme';

const StyledButton = styled.button`
    padding: 8px 16px;
    border: 1px solid ${$blue};
    color: ${$blue};
    background: #3a3a3a;
    font-weight: 600;
    font-size: 14px;
    line-height: 18px;
    letter-spacing: 0.16px;
    box-sizing: border-box;
    border-radius: 6px;
    cursor: pointer;

    &:hover:not(:disabled) {
        background: linear-gradient(0deg, rgba(99, 206, 250, 0.1), rgba(99, 206, 250, 0.1));
    }

    &:disabled {
        cursor: not-allowed;

        &:hover {
            cursor: not-allowed;
        }
    }
`;

function Button({
    children,
    onClick,
    disabled = false,
}: {
    children: ReactElement | string;
    onClick?: () => void;
    disabled?: boolean;
}): JSX.Element {
    function onClickHandler(): void {
        if (onClick) {
            onClick();
        }
    }

    return (
        <StyledButton onClick={onClickHandler} disabled={disabled}>
            {children}
        </StyledButton>
    );
}

export default Button;
