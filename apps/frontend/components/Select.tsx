import { FC, ReactNode, useRef, useState } from 'react';
import styled from 'styled-components';
import { $labelColor, $optionColor, $selectBackground, $selectBackgroundHover } from '../theme';
import { IconUp } from './IconUp';
import { IconDown } from './IconDown';
import { useClickOutside } from '../hooks/useClickOutside';

export type Option = {
    name: ReactNode;
    value: string;
};

const SelectAndLabelContainer = styled.div`
    display: flex;
    align-items: center;
    margin-right: 40px;

    &:last-child {
        margin-right: 0;
    }

    @media all and (max-width: 576px) {
        margin-right: 0;
        margin-bottom: 20px;

        &:last-child {
            margin-bottom: 0;
        }
    }
`;

const Label = styled.label`
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
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
    padding: 7px 16px;
    border-radius: 6px;
    transition: 0.3s ease all;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0.16px;
    cursor: pointer;
    background: ${({ open }: SelectContainerProps) => (open ? $selectBackgroundHover : $selectBackground)};

    &:hover {
        background: ${$selectBackgroundHover};
    }

    svg:first-child {
        margin: 10px 10px 10px 0;
    }
    svg:last-child {
        margin-left: 11px;
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
    border-radius: 6px;
`;

type OptionProps = {
    active: boolean;
    onClick: () => void;
};

const Option: FC<OptionProps> = styled.div`
    width: 100%;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0.16px;
    color: ${$optionColor};
    padding: 10px 16px;
    background: ${$selectBackground};

    &:hover {
        background: ${$selectBackgroundHover};
    }

    ${({ active }: OptionProps) => active && `background: ${$selectBackgroundHover}`};

    & + & {
        border-top: 1px solid ${$selectBackgroundHover};
    }
`;

function Select({
    value,
    options,
    onChange,
    label,
}: {
    value: ReactNode;
    options: Option[];
    onChange: (value: string) => void;
    label?: string;
}): JSX.Element {
    const ref = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    const toggle = (): void => {
        setOpen(!open);
    };

    const optionClickHandler = (newValue: string) => (): void => {
        onChange(newValue);
    };

    const valueOption = options.find(({ value: oValue }) => oValue === value);
    const valueString = valueOption ? valueOption.name : value || '\u00A0';

    useClickOutside(ref, () => setOpen(false));

    return (
        <SelectAndLabelContainer ref={ref}>
            {label && <Label>{label}</Label>}
            <SelectContainer onClick={toggle} open={open}>
                {valueString}
                <div className='arrow'>{open ? <IconUp /> : <IconDown />}</div>
                <OptionsContainer open={open}>
                    {options.map(
                        (option): JSX.Element => (
                            <Option
                                key={option.value}
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
