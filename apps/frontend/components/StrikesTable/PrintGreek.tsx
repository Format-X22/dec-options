import { TableCell } from './TableCell';
import { TitleText } from './TitleText';
import { Lines } from './Lines';
import React from 'react';

export function PrintGreek({ strikeData, propKey }): JSX.Element {
    return (
        <TableCell>
            <TitleText>
                {strikeData[propKey] ? (
                    strikeData[propKey].toFixed(4)
                ) : (
                    <TitleText>
                        <Lines />
                    </TitleText>
                )}
            </TitleText>
        </TableCell>
    );
}
