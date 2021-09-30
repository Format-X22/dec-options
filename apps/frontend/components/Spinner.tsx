import styled from 'styled-components';

export const Spinner = styled.div`
    z-index: 200;
    position: absolute;
    top: calc(50% - 20px);
    left: calc(50% - 20px);
    border: 4px solid #303030; /* Light grey */
    border-top: 4px solid #71abd2; /* Blue */
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 0.9s ease-in-out infinite;
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
`;
