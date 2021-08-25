import React from 'react';
import styled from 'styled-components';
import { $colorRed } from '../theme';
import { PutsSvgIcon } from './Icons/PutsSvgIcon';

const Container = styled.div`
    display: flex;
    padding: 24px;
    align-items: center;
    justify-content: flex-start;
`;

const Text = styled.span`
    font-weight: 600;
    font-size: 12px;
    line-height: 20px;
    color: ${$colorRed};
    margin-right: 12px;
`;

function PutsIcon({ large = false }: { large?: boolean }): JSX.Element {
    return (
        <Container>
            <Text style={large ? { fontSize: 20 } : { fontSize: 12 }}>Puts</Text>
            <PutsSvgIcon />
        </Container>
    );
}

export default PutsIcon;
