import { TableCell } from './TableCell';
import { TitleText } from './TitleText';
import { FC } from 'react';

interface IPrintGreekProps {
    name: string;
    value?: number;
}

export const PrintGreek: FC<IPrintGreekProps> = ({ value, name }) => {
    return (
        <TableCell data-name={name}>
            <TitleText>{value && Number.isFinite(value) ? value.toFixed(2) : <TitleText>-</TitleText>}</TitleText>
        </TableCell>
    );
};
