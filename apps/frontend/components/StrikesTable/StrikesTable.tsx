import React, { useContext } from 'react';
import { client, ContextApp } from '../../pages/_app';
import { StyledContainer } from './StyledContainer';
import { Table } from './Table';
import { Modal } from '../Modal';
import styled from 'styled-components';
import Input from '../Input';
import { gql } from '@apollo/client';

const ModalContent = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const ModalContentText = styled.div`
    margin-bottom: 12px;
`;

const SUBSCRIBE = gql`
    query subscribe($email: String!) {
        subscribe(email: $email) {
            success
        }
    }
`;

function StrikesTable(): JSX.Element {
    const { state } = useContext(ContextApp);

    const [thanksModalIsVisible, setThanksModalIsVisible] = React.useState(false);
    const [subscribeModalIsVisible, setSubscribeModalIsVisible] = React.useState(false);
    const [email, setEmail] = React.useState<string>('');
    const [valid, setValid] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const closeModal = (): void => {
        setSubscribeModalIsVisible(false);
    };
    const openModal = (): void => {
        setSubscribeModalIsVisible(true);
    };

    const onChange = (value: string): void => {
        setValid(true);
        setEmail(value);
        setError(null);
    };

    const sendEmail = async (): Promise<void> => {
        const data = await client.query({
            query: SUBSCRIBE,
            variables: {
                email,
            },
        });
        if (data?.data?.subscribe?.success) {
            setEmail('');
            setSubscribeModalIsVisible(false);
            setThanksModalIsVisible(true);
        } else {
            setError('Error');
        }
    };

    const onButtonClick = (): void => {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const isValid: boolean = re.test(String(email).toLowerCase());

        if (!isValid) {
            setError('Please type valid email.');
            setValid(false);
        } else {
            sendEmail();
        }
    };

    return (
        <StyledContainer>
            {state.filter.currency && state.filter.date && (
                <Table base={state.filter.currency} date={state.filter.date} openSubscribeModal={openModal} />
            )}
            <Modal
                visible={subscribeModalIsVisible}
                onClose={closeModal}
                title='The addition information will be available soon'
            >
                <ModalContent>
                    <ModalContentText>
                        Please, subscribe to notifications, we will be informing you about our news.
                    </ModalContentText>
                    <Input
                        buttonText='Subscribe'
                        value={email}
                        onChange={onChange}
                        onButtonClick={onButtonClick}
                        valid={valid}
                        error={error}
                    />
                </ModalContent>
            </Modal>
            <Modal
                visible={thanksModalIsVisible}
                onClose={() => setThanksModalIsVisible(false)}
                title='Thank you for the subscribing'
            >
                We will be informing you about our news.
            </Modal>
        </StyledContainer>
    );
}

export default StrikesTable;
