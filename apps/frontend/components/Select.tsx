import React from 'react';
import styled from 'styled-components';
import { $labelColor, $optionColor, $selectBackground, $selectBackgroundHover } from '../theme';

export type Option = {
    name: string;
    // tslint:disable-next-line:no-any
    value: any;
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

const SelectContainer = styled.div`
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
    background: ${({ open }) => (open ? $selectBackgroundHover : $selectBackground)};

    &:hover {
        background: ${$selectBackgroundHover};
    }
`;

const OptionsContainer = styled.div`
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    min-width: 200px;
    display: ${({ open }) => (open ? 'flex' : 'none')};
    border-radius: 2px;
    flex-direction: column;
    z-index: 99;
    filter: drop-shadow(0px 5px 14px rgba(0, 0, 0, 0.45));
    overflow: hidden;
`;

const Option = styled.div`
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

    ${({ active }) => active && `background: ${$selectBackgroundHover}`};

    & + & {
        border-top: 1px solid ${$selectBackgroundHover};
    }
`;

function IconDown(): JSX.Element {
    return (
        <svg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
                d='M4.62204 5.56356C4.82142 5.7938 5.17858 5.7938 5.37796 5.56356L9.47967 0.827327C9.7601 0.503505 9.53008 0 9.1017 0H0.898298C0.469922 0 0.239896 0.503505 0.520334 0.827327L4.62204 5.56356Z'
                fill='#626262'
            />
        </svg>
    );
}

function IconUp(): JSX.Element {
    return (
        <svg width='10' height='7' viewBox='0 0 10 7' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
                d='M4.62288 0.936435C4.82226 0.706205 5.17942 0.706205 5.3788 0.936436L9.4805 5.67267C9.76094 5.9965 9.53092 6.5 9.10254 6.5H0.899138C0.470762 6.5 0.240736 5.9965 0.521174 5.67267L4.62288 0.936435Z'
                fill='#626262'
            />
        </svg>
    );
}

function Select({
    value,
    options,
    onChange,
    label,
}: {
    // tslint:disable-next-line:no-any
    value: any;
    options: Option[];
    // tslint:disable-next-line:no-any
    onChange: (value: any) => void;
    label?: string;
}): JSX.Element {
    const ref = React.useRef();
    const [open, setOpen] = React.useState(false);

    const toggle = (): void => {
        setOpen(!open);
    };

    // tslint:disable-next-line:no-shadowed-variable no-any typedef
    const optionClickHandler = (newValue: any) => (): void => {
        onChange(newValue);
    };

    const valueOption = options.find(({ value: oValue }) => oValue === value);
    const valueString = valueOption ? valueOption.name : value || '\u00A0';

    React.useEffect(() => {
        const listener = (e: Event): void => {
            let target: Node = e.target;
            // let { target }: { target: EventTarget } = e;
            while (target && !document.body.isSameNode(target)) {
                target = target.parentNode;
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                if (target && ref && ref.current && ref.current.isSameNode(target)) {
                    return;
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
                        (option: Option): JSX.Element => (
                            <Option active={option.value === value} onClick={optionClickHandler(option.value)}>
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
