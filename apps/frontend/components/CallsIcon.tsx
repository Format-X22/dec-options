import React from 'react';
import styled from 'styled-components';
import { $colorGreen } from '../theme';
import { CallsSvgIcon } from './Icons/CallsSvgIcon';

const Container = styled.div`
    display: flex;
    padding: 24px;
    align-items: center;
    justify-content: flex-start;
`;

const Text = styled.span`
    font-weight: 600;
    line-height: 20px;
    color: ${$colorGreen};
    margin-right: 12px;
`;

function CallsIcon({ large = false }: { large?: boolean }): JSX.Element {
    return (
        <Container>
            <Text style={large ? { fontSize: 20 } : { fontSize: 12 }}>Calls</Text>
            <CallsSvgIcon />
        </Container>
    );
}

export default CallsIcon;
