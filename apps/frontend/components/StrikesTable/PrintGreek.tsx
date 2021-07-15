import { TableCell } from './TableCell';
import { TitleText } from './TitleText';
import React from 'react';

export function PrintGreek({ strikeData, propKey, name }): JSX.Element {
    return (
        <TableCell data-name={name}>
            <TitleText>
                {Number.isFinite(strikeData[propKey]) ? strikeData[propKey].toFixed(2) : <TitleText>-</TitleText>}
            </TitleText>
        </TableCell>
    );
}
