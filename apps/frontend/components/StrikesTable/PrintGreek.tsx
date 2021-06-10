import { TableCell } from './TableCell';
import { TitleText } from './TitleText';
import { Lines } from './Lines';
import React from 'react';

export function PrintGreek({ strikeData, propKey, name }): JSX.Element {
    return (
        <TableCell data-name={name}>
            <TitleText>
                {strikeData[propKey] ? (
                    strikeData[propKey].toFixed(2)
                ) : (
                    <TitleText>
                        <Lines />
                    </TitleText>
                )}
            </TitleText>
        </TableCell>
    );
}
