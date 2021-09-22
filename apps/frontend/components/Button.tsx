import styled, { StyledComponent, css } from 'styled-components';
import { Button as Btn } from 'antd';
import { $buttonBackground, $buttonBackgroundHover } from '@dexcommas/core';
import { $buttonBackgroundGhost, $buttonBackgroundHoverGhost } from '../theme';

export const Button: StyledComponent<typeof Btn, any> = styled(Btn)`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 38px;
    border-radius: 4px;
    text-shadow: none;
    box-shadow: none;

    img {
        margin-right: 10px;
    }

    ${({ type }) =>
        type === 'primary' &&
        css`
            border: 1px solid ${$buttonBackground};
            color: ${$buttonBackground};
            background: transparent;

            :hover {
                color: #fff;
                border-color: ${$buttonBackgroundHover};
                background: ${$buttonBackgroundHover};
            }
        `}

    ${({ type }) =>
        type === 'ghost' &&
        css`
            border: 1px solid ${$buttonBackgroundGhost};
            color: ${$buttonBackgroundGhost};

            :hover,
            :focus {
                color: #fff;
                background-color: ${$buttonBackgroundHoverGhost};
                border-color: ${$buttonBackgroundHoverGhost};
            }
        `}
`;
