import React, { useContext } from 'react';
import { TableSide } from '../StrikesTable/TableSide';
import { ContextState } from '../../pages/stateType';
import { ContextApp } from '../../pages/_app';
import { gql } from '@apollo/client';

export function Table(): JSX.Element {
    // TODO -
    const { state }: Partial<ContextState> = useContext(ContextApp);

    console.log(state);

    return (
        <TableSide
            data={[]} // TODO -
            error={null} // TODO -
            type={state.selectedOption.type}
            date={state.selectedOption.date}
            onRowClick={(): void => console.log('INSIDE ROW')} // TODO -
            hideSourcesColumn={true}
        />
    );
}
