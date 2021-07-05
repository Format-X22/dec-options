import React from 'react';
import { TableRow } from '../StrikesTable/TableRow';
import { TableCell } from '../StrikesTable/TableCell';
import { TitleText } from '../StrikesTable/TitleText';

export function OrderBook(): JSX.Element {
    // TODO -
    return (
        <TableRow>
            <TableCell className={'TODO-order-book-column-size'}>
                <TitleText>Price</TitleText>
            </TableCell>
            <TableCell className={'TODO-order-book-column-size'}>
                <TitleText>Amount</TitleText>
            </TableCell>
        </TableRow>
    );
}
