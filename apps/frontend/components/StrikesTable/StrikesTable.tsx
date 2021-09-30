import { useContext } from 'react';
import { ContextApp } from '../../pages/_app';
import { StyledContainer } from './StyledContainer';
import { Table } from './Table';

function StrikesTable(): JSX.Element {
    const { state } = useContext(ContextApp);

    return (
        <StyledContainer>
            {state.filter.currency && state.filter.date && (
                <Table base={state.filter.currency} date={state.filter.date} marketType={state.filter.marketType} />
            )}
        </StyledContainer>
    );
}

export default StrikesTable;
