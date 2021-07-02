import React from 'react';
import styled from 'styled-components';
import { $backgroundLight, $colorGreen } from '../../theme';
import CallsIcon from '../CallsIcon';

const StyledInfo = styled.div`
    width: 100%;
    display: flex;
    justify-content: left;
    background: ${$backgroundLight};
    padding: 10px 24px;
    margin-top: 4px;
    flex-direction: row;
    align-items: center;
`;

const Text = styled.span`
    font-weight: 600;
    font-size: 20px;
    line-height: 20px;
    margin-right: 12px;
`;

export function GroupInfo(): JSX.Element {
    return (
        <StyledInfo>
            <CallsIcon large={true}/>
            <Text>06 July</Text>
        </StyledInfo>
    );
}
