import {ReactElement} from 'react';
import styled from 'styled-components';
import { $backgroundLight } from '../theme';
import { TimeTable } from './TimeTable';
import { CurrencySelector } from './CurrencySelector';

const StyledFilters = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    background: ${$backgroundLight};
    padding: 40px 24px;
    margin-bottom: 4px;
    flex-direction: column;
    align-items: flex-start;
`;

const FiltersRow = styled.div`
    width: 100%;
    display: flex;

    & + & {
        margin-top: 40px;
    }
`;

function Filters({}: { children?: ReactElement | string }): JSX.Element {
    return (
        <StyledFilters>
            <FiltersRow>
                <CurrencySelector />
            </FiltersRow>
            <FiltersRow>
                <TimeTable />
            </FiltersRow>
        </StyledFilters>
    );
}

export default Filters;
