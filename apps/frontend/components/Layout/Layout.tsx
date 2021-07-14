import React, { FC, ReactNode } from 'react';
import styled from 'styled-components';

import Header from '../Header';

const Container: FC<{screenHeight: boolean}> = styled.div`
    display: flex;
    flex-direction: column;
    ${({ screenHeight }: {screenHeight: boolean}) => screenHeight ? `max-height: 100vh;` : `min-height: 100vh;`}
`;

interface IProps {
  screenHeight?: boolean;
  children: ReactNode;
}

const Layout: FC<IProps> = ({screenHeight = false, children}) => {
  return (
    <Container screenHeight={screenHeight} >
      <Header />
      {children}
    </Container>
  );
};

export default Layout;