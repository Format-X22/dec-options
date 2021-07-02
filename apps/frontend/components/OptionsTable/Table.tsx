import React from 'react';
import { TableSide } from '../TableSide';

export function Table(): JSX.Element {
    // TODO -
    return (
        <TableSide
            data={[]}
            error={null}
            type={''}
            date={new Date()}
            onRowClick={(): void => console.log('INSIDE ROW')}
            hideSourcesColumn={true}
        />
    );
}
