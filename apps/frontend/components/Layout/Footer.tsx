import React from 'react';
import styled from 'styled-components';
import { GetInTouch } from '../GetInTouch/GetInTouch';
import { $blue } from '@dexcommas/core';

const StyledFooter = styled.footer`
    width: 100%;
    display: flex;
    flex-direction: column;
    background: #1b1b1b;
    padding: 32px;

    a {
        color: #fff;
    }

    .logo-link-wrapper {
        border-bottom: 1px solid #303030;
        padding-bottom: 32px;
        margin-bottom: 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        @media screen and (orientation: portrait) {
            flex-direction: column;
        }
    }

    .logo-link {
        display: flex;
        align-items: center;

        @media screen and (orientation: portrait) {
            margin-bottom: 16px;
        }

        img {
            width: 32px;
            height: 32px;
            margin-right: 16px;
        }
        span {
            font-size: 24px;
            line-height: 34px;
        }
    }
    .social-links {
        display: flex;
        flex-direction: column;

        @media screen and (orientation: portrait) {
            align-items: center;
            margin-bottom: 16px;
        }

        a {
            font-size: 16px;
            font-weight: 500;
            &:hover {
                color: ${$blue};
            }

            & + & {
                margin-top: 8px;
            }
        }
    }

    .social-links-icons {
        display: flex;
        align-items: center;

        a {
            margin-left: 8px;

            img {
                width: 24px;
            }
        }
    }

    .link-row {
        display: flex;
        justify-content: space-between;

        @media screen and (orientation: portrait) {
            flex-direction: column;
            align-items: center;
        }
    }
`;

const Footer = () => {
    const decommasTools = [
        { link: '/#tools', text: 'Tools' },
        { link: '/#contact', text: 'Contact Us' },
        { link: 'mailto:info@decommas.io', text: 'info@decommas.io' },
    ];
    const socialLinks = [
        { link: 'https://twitter.com/decommas', image: 'twitter.svg', text: 'Twitter' },
        { link: 'https://t.me/decommas', image: 'telegram.svg', text: 'Telegram' },
        { link: 'https://discord.gg/FyENCJt8nY', image: 'discord.svg', text: 'Discord' },
        { link: 'https://medium.com/@DeCommas/', image: 'medium.svg', text: 'Medium' },
    ];
    return (
        <StyledFooter>
            <div className='logo-link-wrapper'>
                <a href='https://decommas.io' className='logo-link'>
                    <img src='/opex/public/decommas.svg' alt='Decommas' />
                    <span>DeCommas</span>
                </a>
                <GetInTouch />
            </div>
            <div className='link-row'>
                <div className='social-links'>
                    {decommasTools.map(({ link, text }, index) => {
                        return (
                            <a key={`decommas-links-${index}`} href={link}>
                                {text}
                            </a>
                        );
                    })}
                </div>
                <div className='social-links-icons'>
                    {socialLinks.map(({ link, text, image }, index) => {
                        return (
                            <a key={`social-links-${index}`} target='_blank' rel='noreferrer' href={link}>
                                <img src={`/opex/public/${image}`} alt={text} />
                            </a>
                        );
                    })}
                </div>
            </div>
        </StyledFooter>
    );
};

export default Footer;
