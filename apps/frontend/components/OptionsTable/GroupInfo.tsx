import React, { useContext } from 'react';
import styled from 'styled-components';
import { $backgroundLight } from '../../theme';
import CallsIcon from '../CallsIcon';
import Button from '../Button';
import { ActionType, ContextState, ESplashPanels } from '../../pages/stateType';
import { ContextApp } from '../../pages/_app';
import format from 'date-fns/format';
import PutsIcon from '../PutsIcon';

const StyledInfo = styled.div`
    width: 100%;
    display: flex;
    justify-content: left;
    background: ${$backgroundLight};
    padding: 10px 24px;
    flex-direction: row;
    align-items: center;
`;

const Text = styled.span`
    font-weight: 600;
    font-size: 20px;
    line-height: 20px;
    margin-right: 12px;
`;

export function GroupInfo(): JSX.Element {
    const { state, changeState }: Partial<ContextState> = useContext(ContextApp);
    const dateString = format(state.selectedOption?.date || new Date(), 'dd MMMM');

    return (
        <StyledInfo>
            <Button
                onClick={(): void =>
                    changeState({
                        type: ActionType.SET_CURRENT_PANEL,
                        payload: ESplashPanels.STRIKES_TABLE,
                    })
                }
            >
                &lt;&lt;&lt; back
            </Button>
            {state.selectedOption?.type === 'call' ? <CallsIcon large={true} /> : <PutsIcon large={true} />}
            <Text>{dateString}</Text>
        </StyledInfo>
    );
}
