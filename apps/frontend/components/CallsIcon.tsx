import React from 'react';
import styled from 'styled-components';
import { $colorGreen } from '../theme';

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
    color: ${$colorGreen};
    margin-right: 12px;
`;

function Icon(): JSX.Element {
    return (
        <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
                d='M11.7761 0.223896C11.6209 0.0686614 11.4098 -0.00585114 11.1676 0.000358233L2.92774 0.00656761C2.68558 0.012777 2.4993 0.0872895 2.35027 0.236315C2.04601 0.540574 2.02738 1.00628 2.33785 1.31675C2.48688 1.46577 2.69179 1.55891 2.88428 1.5527L5.69092 1.57754L9.68975 1.39126L8.09394 2.80079L0.239083 10.6556C-0.0838042 10.9785 -0.0775948 11.4318 0.245293 11.7547C0.56818 12.0776 1.02146 12.0838 1.34435 11.7609L9.19921 3.90606L10.6025 2.31646L10.4225 6.30908L10.4473 9.11572C10.4473 9.31442 10.5342 9.51312 10.6833 9.66215C10.9937 9.97262 11.4594 9.95399 11.7637 9.64973C11.9127 9.5007 11.9934 9.32063 11.9934 9.04742L11.9996 0.832415C12.0059 0.590249 11.9313 0.37913 11.7761 0.223896Z'
                fill='#71D298'
            />
        </svg>
    );
}

function CallsIcon(): JSX.Element {
    return (
        <Container>
            <Text>Calls</Text>
            <Icon />
        </Container>
    );
}

export default CallsIcon;
