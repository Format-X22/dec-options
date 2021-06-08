import React from 'react';
import styled from 'styled-components';
import { $colorRed } from '../theme';

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

function Icon(): JSX.Element {
    return (
        <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
                d='M11.7761 11.7761C11.6209 11.9313 11.4098 12.0059 11.1676 11.9996L2.92774 11.9934C2.68558 11.9872 2.4993 11.9127 2.35027 11.7637C2.04601 11.4594 2.02738 10.9937 2.33785 10.6833C2.48688 10.5342 2.69179 10.4411 2.88428 10.4473L5.69092 10.4225L9.68975 10.6087L8.09394 9.19921L0.239083 1.34435C-0.0838042 1.02146 -0.0775948 0.568181 0.245293 0.245294C0.56818 -0.0775948 1.02146 -0.0838041 1.34435 0.239083L9.19921 8.09394L10.6025 9.68354L10.4225 5.69092L10.4473 2.88428C10.4473 2.68558 10.5342 2.48688 10.6833 2.33785C10.9937 2.02738 11.4594 2.04601 11.7637 2.35027C11.9127 2.4993 11.9934 2.67937 11.9934 2.95258L11.9996 11.1676C12.0059 11.4098 11.9313 11.6209 11.7761 11.7761Z'
                fill='#D27171'
            />
        </svg>
    );
}

function PutsIcon(): JSX.Element {
    return (
        <Container>
            <Text>Puts</Text>
            <Icon />
        </Container>
    );
}

export default PutsIcon;
