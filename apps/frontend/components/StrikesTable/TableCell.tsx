import { FC } from 'react';
import styled from 'styled-components';

type TableCellProps = {
    width?: string;
};

export const TableCell: FC<TableCellProps> = styled.div`
    width: ${({ width }: TableCellProps) => (width ? `${width}` : 'calc(100% / 8)')};
    text-align: center;
    flex: 1;

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
