import React, { useEffect, useState } from 'react';
import { Input, Modal, $yellow } from '@dexcommas/core';
import validator from 'validator';
import styled from 'styled-components';
import { Button } from '../Button';
import { gql } from '@apollo/client';
import { client } from '../../pages/_app';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const ErrorText = styled.p`
    margin: 8px 0 0;
    color: ${$yellow};
`;

const StyleButton = styled(Button)`
    margin-top: 16px;
`;

let closeTimeOut;

const SUBSCRIBE = gql`
    query subscribe($email: String!) {
        subscribe(email: $email) {
            success
        }
    }
`;

export const GetInTouch = () => {
    const [modalIsVisible, setModalIsVisible] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<boolean>(false);

    const send = async () => {
        if (!validator.isEmail(email)) {
            setError('Please, type valid email');
            return;
        }
        try {
            // SEND REQUEST
            await client.query({
                query: SUBSCRIBE,
                variables: {
                    email,
                },
            });
            setSuccess(true);
            closeTimeOut = setTimeout(() => {
                setModalIsVisible(false);
            }, 3000);
        } catch (e) {
            setError('Error');
        }
    };

    useEffect(() => {
        setError('');
    }, [email]);

    useEffect(() => {
        if (!modalIsVisible) {
            clearTimeout(closeTimeOut);
        }
    }, [modalIsVisible]);

    return (
        <>
            <Modal visible={modalIsVisible} onClose={() => setModalIsVisible(false)} title='Get in touch with updates'>
                <Container>
                    <Input
                        value={success ? 'Thank you!' : email}
                        onChange={(e) => setEmail(e.target.value)}
                        label='Email'
                        labelPosition='top'
                        disabled={success}
                    />
                    {error && <ErrorText>{error}</ErrorText>}
                    <StyleButton onClick={send} type='primary' disabled={success}>
                        Get in touch
                    </StyleButton>
                </Container>
            </Modal>
            <Button onClick={() => setModalIsVisible(true)} type='primary'>
                Get in touch
            </Button>
        </>
    );
};
