import { FC, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { $labelColor, $optionColor, $selectBackground, $selectBackgroundHover } from '../theme';
import { IconUp } from './IconUp';
import { IconDown } from './IconDown';
import { DOMEvent } from '../types';

export type Option<T = string> = {
    name: string;
    value: T;
};

const SelectAndLabelContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Label = styled.label`
    font-weight: 500;
    font-size: 14px;
    line-height: 18px;
    letter-spacing: 0.16px;
    color: ${$labelColor};
    margin-right: 16px;
`;

type SelectContainerProps = {
    open: boolean;
    onClick: (e: Event) => void;
};

const SelectContainer: FC<SelectContainerProps> = styled.div`
    position: relative;
    width: auto;
    min-width: 128px;
    transition: 0.3s ease all;
    border-radius: 2px;
    display: flex;
    align-items: center;
    padding: 7px 16px;
    justify-content: space-between;
    font-weight: 500;
    font-size: 14px;
    line-height: 18px;
    letter-spacing: 0.16px;
    cursor: pointer;
    background: ${({ open }: SelectContainerProps) => (open ? $selectBackgroundHover : $selectBackground)};

    &:hover {
        background: ${$selectBackgroundHover};
    }
`;

type OptionsContainerProps = {
    open: boolean;
};

const OptionsContainer: FC<OptionsContainerProps> = styled.div`
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    min-width: 200px;
    display: ${({ open }: OptionsContainerProps) => (open ? 'flex' : 'none')};
    border-radius: 2px;
    flex-direction: column;
    z-index: 99;
    filter: drop-shadow(0px 5px 14px rgba(0, 0, 0, 0.45));
    overflow: hidden;
`;

type OptionProps = {
    active: boolean;
    onClick: () => void;
};

const Option: FC<OptionProps> = styled.div`
    width: 100%;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 18px;
    letter-spacing: 0.16px;
    color: ${$optionColor};
    padding: 7px 16px;
    background: ${$selectBackground};

    &:hover {
        background: ${$selectBackgroundHover};
    }

    ${({ active }: OptionProps) => active && `background: ${$selectBackgroundHover}`};

    & + & {
        border-top: 1px solid ${$selectBackgroundHover};
    }
`;

function Select<T = string>({
    value,
    options,
    onChange,
    label,
}: {
    value: T;
    options: Option<T>[];
    onChange: (value: T) => void;
    label?: string;
}): JSX.Element {
    const ref = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    const toggle = (): void => {
        setOpen(!open);
    };

    const optionClickHandler = (newValue: T) => (): void => {
        onChange(newValue);
    };

    const valueOption = options.find(({ value: oValue }) => oValue === value);
    const valueString = valueOption ? valueOption.name : value || '\u00A0';

    useEffect(() => {
        const listener = (e: DOMEvent<Node>): void => {
            let target: Node = e.target;
            while (target && !document.body.isSameNode(target)) {
                if (ref && typeof ref.current !== 'undefined') {
                    target = target.parentNode;
                    if (target && ref.current?.isSameNode(target)) {
                        return;
                    }
                }
            }
            setOpen(false);
        };

        window.addEventListener('click', listener);

        return (): void => {
            window.removeEventListener('click', listener);
        };
    }, []);

    return (
        <SelectAndLabelContainer ref={ref}>
            {label && <Label>{label}</Label>}
            <SelectContainer onClick={toggle} open={open}>
                {valueString}
                {open ? <IconUp /> : <IconDown />}
                <OptionsContainer open={open}>
                    {options.map(
                        (option): JSX.Element => (
                            <Option
                                key={option.value.toString()}
                                active={option.value === value}
                                onClick={optionClickHandler(option.value)}
                            >
                                {option.name}
                            </Option>
                        ),
                    )}
                </OptionsContainer>
            </SelectContainer>
        </SelectAndLabelContainer>
    );
}

export default Select;
