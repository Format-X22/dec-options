import { FC, ReactNode } from 'react';
import styled from 'styled-components';

import Header from './Header';
import Footer from './Footer';

const Container: FC<{ fixedScreenHeight: boolean }> = styled.div`
    display: flex;
    flex-direction: column;
    ${({ fixedScreenHeight }: { fixedScreenHeight: boolean }) =>
        fixedScreenHeight ? `height: 100vh;` : `min-height: 100vh;`}
`;

interface IProps {
    fixedScreenHeight?: boolean;
    children: ReactNode;
}

const Layout: FC<IProps> = ({ fixedScreenHeight = false, children }) => {
    return (
        <Container fixedScreenHeight={fixedScreenHeight}>
            <Header />
            {children}
            <Footer />
        </Container>
    );
};

export default Layout;
