import { FC, ReactNode } from 'react';
import styled from 'styled-components';

import Header from '../Header';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
`;

interface IProps {
    children: ReactNode;
}

const Layout: FC<IProps> = ({ children }) => {
    return (
        <Container>
            <Header />
            {children}
        </Container>
    );
};

export default Layout;
