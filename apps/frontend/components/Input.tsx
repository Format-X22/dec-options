import React, { FC } from 'react';
import styled from 'styled-components';
import { $blue, $buttonBackgroundHover, $colorRed } from '../theme';

const InputContainer = styled.div`
    display: flex;
    width: 100%;
    height: 34px;
    overflow: hidden;
    flex-direction: row-reverse;
`;

type InputElementProps = {
    valid?: boolean;
    placeholder?: string;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
};

const InputElement: FC<InputElementProps> = styled.input`
    border: 1px solid ${({ valid }: InputElementProps) => (valid ? $blue : $colorRed)};
    background: transparent;
    outline: none;
    padding: 0 12px;
    width: 100%;
    border-radius: 2px;
    font-size: 12px;
    flex-wrap: wrap;

    &:focus {
        border-color: ${$buttonBackgroundHover};
    }
`;

const Button = styled.button`
    background: ${$blue};
    border: 0;
    padding: 0 24px;
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
    cursor: pointer;

    &:hover {
        background: ${$buttonBackgroundHover};
    }

    & + ${InputElement} {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }
`;

const ErrorText = styled.div`
    color: ${$colorRed};
    width: 100%;
    margin-top: 12px;
`;

function Input({
    value,
    onChange,
    placeholder,
    buttonText,
    valid,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onButtonClick = (): void => {},
    error,
}: {
    value;
    placeholder?: string;
    buttonText?: string;
    onChange: (value: string) => void;
    valid?: boolean;
    onButtonClick?: () => void;
    error?: string | null;
}): JSX.Element {
    return (
        <>
            <InputContainer>
                {buttonText && <Button onClick={onButtonClick}>{buttonText}</Button>}
                <InputElement
                    valid={valid}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </InputContainer>
            {error && <ErrorText>{error}</ErrorText>}
        </>
    );
}

export default Input;
