import styled from 'styled-components';

export const TableCell = styled.div`
    width: calc(100% / 8);
    padding: 16px 0;

    @media (max-width: 1024px) {
        width: calc(100% / 5);
        &[data-name='greek'] {
            display: none;
        }
    }

    @media (max-width: 680px) {
        width: calc(100% / 3);
        &[data-name='param'] {
            display: none;
        }
    }
`;
